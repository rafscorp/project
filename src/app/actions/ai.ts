"use server";

import { runAIAgent } from "@/lib/ai/agent";
import { getCurrentSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limiter";
import { headers } from "next/headers";

export async function askConcierge(message: string) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.user) {
      return { success: false, error: "Não autorizado. Faça login primeiro." };
    }

    // 🛡️ SEGURANÇA BÁSICA: Bloquear flood/bots
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
    const userIdentifier = `ai-chat:${session.user.id}:${ip}`;

    // Limite de 15 perguntas por minuto (Free Tier do Gemini). Bloqueia por 5 min se abusar.
    const rateLimit = checkRateLimit(userIdentifier, {
      maxRequests: 15,
      windowSeconds: 60,
      blockSeconds: 300,
    });

    if (!rateLimit.allowed) {
      console.warn(`🚨 [SECURITY] Bloqueio de IP/Usuário por Flood na IA: ${userIdentifier}`);
      return { 
        success: false, 
        error: `Muitas perguntas seguidas. Aguarde ${rateLimit.retryAfterSeconds} segundos para tentar novamente.` 
      };
    }

    const role = session.user.role === "PLATFORM_ADMIN" ? "Admin/CEO" : "Cliente";
    
    // Dispara a Inteligência Artificial
    const aiResponse = await runAIAgent(message, session.user.id, role);
    
    // 🛡️ AUDITORIA MÍNIMA (Em produção, você salvaria isso numa tabela AuditLog)
    console.log(`[AI AUDIT] Usuário ${session.user.id} (IP: ${ip}) usou a IA. Sucesso: ${aiResponse.success}`);

    return aiResponse;
  } catch (error) {
    console.error("Erro na action da IA:", error);
    return { success: false, error: "O servidor de IA está indisponível no momento." };
  }
}

