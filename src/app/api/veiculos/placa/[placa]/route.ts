import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limiter";
import { checkServiceStatus, recordSuccess, recordFailure } from "@/lib/security/circuit-breaker";


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

    // 5. Simulador (quando WDAPI_TOKEN não está configurado)
    console.warn(`[Placa] WDAPI_TOKEN não configurado — retornando simulação para ${cleanPlaca}`);

    const sim: Record<string, object> = {
      A: { marca: "HONDA",      modelo: "CIVIC EXL 2.0",       cor: "PRATA",    chassi: "9BWZZZ377VT004251", motor: "20T4AB123456", anoFabricacao: "2022", anoModelo: "2023" },
      B: { marca: "TOYOTA",     modelo: "COROLLA XEI",          cor: "BRANCO",   chassi: "9BRXE69S0D3456789", motor: "2ZRFE987654",  anoFabricacao: "2021", anoModelo: "2022" },
      C: { marca: "VOLKSWAGEN", modelo: "GOL 1.6 COMFORTLINE",  cor: "PRATA",    chassi: "9BWZZZ377VT012345", motor: "EA211001122",  anoFabricacao: "2020", anoModelo: "2020" },
      D: { marca: "CHEVROLET",  modelo: "ONIX PLUS PREMIER",    cor: "PRETO",    chassi: "9BGXT69X0LG112233", motor: "SDFGH23456F",  anoFabricacao: "2023", anoModelo: "2024" },
      E: { marca: "FORD",       modelo: "RANGER LIMITED 4X4",   cor: "CINZA",    chassi: "8AFES7KP0GJ334455", motor: "RANGER2200DT", anoFabricacao: "2022", anoModelo: "2023" },
      F: { marca: "HYUNDAI",    modelo: "HB20 VISION 1.0",      cor: "VERMELHO", chassi: "93HBF2AG4EE556677", motor: "KAPPA10001A",  anoFabricacao: "2021", anoModelo: "2021" },
      G: { marca: "RENAULT",    modelo: "KWID INTENSE 1.0",     cor: "AZUL",     chassi: "9FB4AE3W4HC778899", motor: "BR10SCE002",   anoFabricacao: "2023", anoModelo: "2023" },
      H: { marca: "JEEP",       modelo: "COMPASS LIMITED",      cor: "BRANCO",   chassi: "9C4MJDAG6FT990011", motor: "TIGSHARK22FL", anoFabricacao: "2022", anoModelo: "2022" },
      I: { marca: "FIAT",       modelo: "PULSE DRIVE 1.3",      cor: "VERDE",    chassi: "9BD195BX6KZ112244", motor: "GSE13TC0050",  anoFabricacao: "2022", anoModelo: "2023" },
      J: { marca: "NISSAN",     modelo: "KICKS ADVANCE CVT",    cor: "PRATA",    chassi: "3N6AD33A5XK334466", motor: "HR16DE55512",  anoFabricacao: "2021", anoModelo: "2022" },
    };

    const vehicleRaw = sim[cleanPlaca[0]] ?? sim["C"];
    const vehicle = normalizeVehicle(vehicleRaw, cleanPlaca);

    return NextResponse.json({
      ...vehicle,
      _simulado: true,
    }, {
      headers: { "X-RateLimit-Remaining": String(rateLimit.remaining) },
    });

  } catch (error) {
    console.error("[API Placa]", error);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}
