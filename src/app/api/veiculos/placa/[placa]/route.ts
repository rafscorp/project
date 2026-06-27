import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limiter";
import { checkServiceStatus, recordSuccess, recordFailure } from "@/lib/security/circuit-breaker";
import { getSession } from "@/lib/auth/session";
import { checkPlacaCredits, debitPlacaCredit } from "@/lib/placa/credits";

// ─── Constantes ───────────────────────────────────────────────────────────────
const CACHE_TTL_HOURS = 24;
const WDAPI_TIMEOUT_MS = 12000;
const PLACA_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

// ─── Normaliza a resposta bruta para retornar APENAS os campos solicitados ───
function normalizeVehicle(raw: any, placa: string) {
  return {
    placa,
    marca:  String(raw.MARCA || raw.marca || "—").toUpperCase(),
    modelo: String(raw.MODELO || raw.modelo || "—").toUpperCase(),
    ano:    String(raw.anoModelo || raw.ano || raw.anoFabricacao || raw.ANO_MODELO || raw.ANO || "—"),
    cor:    String(raw.COR || raw.cor || "—").toUpperCase(),
    chassi: String(raw.CHASSI || raw.chassi || raw?.extra?.chassi || "—").toUpperCase(),
    motor:  String(raw.MOTOR || raw.motor || raw?.extra?.motor || "—").toUpperCase(),
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ placa: string }> }
) {
  try {
    const { placa: rawPlaca } = await context.params;
    const cleanPlaca = rawPlaca.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    if (cleanPlaca.length !== 7) {
      return NextResponse.json(
        { error: "Placa inválida. Use o formato ABC1234 ou ABC1D23 (7 caracteres)." },
        { status: 400 }
      );
    }
    if (!PLACA_REGEX.test(cleanPlaca)) {
      return NextResponse.json(
        { error: "Placa inválida. Verifique o formato: ABC1234 (antiga) ou ABC1D23 (Mercosul)." },
        { status: 400 }
      );
    }

    // 1.5. Verificar Sessão e Créditos
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Faça login para realizar consultas de placa." },
        { status: 401 }
      );
    }

    const creditStatus = await checkPlacaCredits(session.userId);
    if (!creditStatus.allowed) {
      return NextResponse.json(
        { 
          error: "Créditos insuficientes.", 
          code: "NO_CREDITS", 
          requiresPlan: true 
        },
        { status: 402 }
      );
    }

    // 2. Rate limiting — 10 consultas/hora por IP
    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`placa:${ip}`, {
      maxRequests: 10,
      windowSeconds: 3600,
      blockSeconds: 3600,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Limite atingido. Tente novamente em ${Math.ceil((rateLimit.retryAfterSeconds ?? 3600) / 60)} minutos.` },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds ?? 3600),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // 3. Cache de 24h no banco — evita gastar créditos repetidamente
    try {
      const cached = await prisma.placaCache.findUnique({ where: { placa: cleanPlaca } });
      if (cached && new Date() < cached.expiresAt) {
        return NextResponse.json(
          { ...(cached.data as object), _cached: true },
          { headers: { "X-Cache": "HIT", "X-RateLimit-Remaining": String(rateLimit.remaining) } }
        );
      }
    } catch {
      // Cache indisponível — continua sem ele
    }

    // 4. Consulta real via WDAPI
    const token = process.env.WDAPI_TOKEN?.trim();

    if (token) {
      // Verifica o Circuit Breaker antes de consultar
      const serviceStatus = await checkServiceStatus("placa-api");
      if (!serviceStatus.available) {
        return NextResponse.json(
          { error: "SERVICE_UNAVAILABLE", message: "Função de pesquisa por placas indisponível" },
          { status: 503 }
        );
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), WDAPI_TIMEOUT_MS);

      try {
        const res = await fetch(`https://wdapi2.com.br/consulta/${cleanPlaca}/${token}`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.status === 404 || res.status === 204) {
          return NextResponse.json(
            { error: "Placa inexistente. Veículo não encontrado na base nacional." },
            { status: 404 }
          );
        }
        if (res.status === 401 || res.status === 403) {
          console.error("[WDAPI] Token inválido ou sem créditos.");
          await recordFailure("placa-api", "API token inválido ou sem créditos (401/403)", true);
          return NextResponse.json(
            { error: "SERVICE_UNAVAILABLE", message: "Função de pesquisa por placas indisponível" },
            { status: 503 }
          );
        }
        if (res.status === 429) {
          console.error("[WDAPI] Limite de requisições excedido.");
          await recordFailure("placa-api", "Limite de requisições da API externa excedido (429)", true);
          return NextResponse.json(
            { error: "SERVICE_UNAVAILABLE", message: "Função de pesquisa por placas indisponível" },
            { status: 503 }
          );
        }
        if (!res.ok) {
          await recordFailure("placa-api", `API respondeu com status ${res.status}`);
          return NextResponse.json(
            { error: "SERVICE_UNAVAILABLE", message: "Função de pesquisa por placas indisponível" },
            { status: 503 }
          );
        }

        const raw = await res.json();

        // WDAPI sinaliza erro dentro do JSON
        if (!raw?.MARCA && !raw?.marca) {
          return NextResponse.json(
            { error: "Placa inexistente. Veículo não encontrado na base nacional." },
            { status: 404 }
          );
        }

        const vehicle = normalizeVehicle(raw, cleanPlaca);

        // Registra sucesso no circuit breaker
        await recordSuccess("placa-api");

        // Debita o crédito do usuário (somente se consultou a API externa de fato)
        await debitPlacaCredit(session.userId, creditStatus.isFreeQuota!);

        // Salva no cache (fire-and-forget, sem bloquear a resposta)
        const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 3600 * 1000);
        prisma.placaCache
          .upsert({
            where: { placa: cleanPlaca },
            create: { placa: cleanPlaca, data: vehicle as any, expiresAt },
            update: { data: vehicle as any, expiresAt },
          })
          .catch(() => {});

        return NextResponse.json(vehicle, {
          headers: { "X-Cache": "MISS", "X-RateLimit-Remaining": String(rateLimit.remaining) },
        });
      } catch (err: any) {
        clearTimeout(timer);
        const isTimeout = err.name === "AbortError";
        const errorDetail = isTimeout ? "Timeout: serviço demorou para responder." : (err.message || "Erro de conexão.");
        
        await recordFailure("placa-api", `Erro ao consultar API externa: ${errorDetail}`);

        return NextResponse.json(
          { error: "SERVICE_UNAVAILABLE", message: "Função de pesquisa por placas indisponível" },
          { status: 503 }
        );
      }
    }

    // 5. Simulador (quando WDAPI_TOKEN não está configurado) - Apenas retorna erro limpo conforme solicitado pelo usuário
    console.warn(`[Placa] WDAPI_TOKEN não configurado — retornando erro`);

    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE", message: "API de pesquisa de placa não configurada. Defina a variável WDAPI_TOKEN." },
      { status: 503 }
    );

  } catch (error) {
    console.error("[API Placa]", error);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}
