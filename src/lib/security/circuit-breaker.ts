import prisma from "@/lib/db/prisma";

// Configurações do Circuit Breaker
const MAX_FAILURES = 3; // Número máximo de falhas consecutivas
const COOLDOWN_SECONDS = 900; // Tempo em segundos para tentar novamente (15 minutos)

export interface ServiceStatus {
  available: boolean;
  reason?: string;
}

/**
 * Verifica o status de um serviço externo.
 * Se o serviço estiver inativo mas o tempo de cooldown passou,
 * o status é resetado para ativo (circuito meio-aberto).
 */
export async function checkServiceStatus(serviceName: string): Promise<ServiceStatus> {
  try {
    const status = await prisma.apiServiceStatus.findUnique({
      where: { serviceName },
    });

    if (!status) {
      // Cria o registro inicial do serviço se não existir
      await prisma.apiServiceStatus.create({
        data: {
          serviceName,
          isAvailable: true,
          failureCount: 0,
        },
      });
      return { available: true };
    }

    if (status.isAvailable) {
      return { available: true };
    }

    // Se o serviço está marcado como indisponível, verifica se passou o tempo de cooldown
    if (status.autoDisabledUntil && new Date() > status.autoDisabledUntil) {
      // Cooldown expirado -> reativa temporariamente (meio-aberto)
      await prisma.apiServiceStatus.update({
        where: { serviceName },
        data: {
          isAvailable: true,
          failureCount: 0,
          autoDisabledUntil: null,
          errorMessage: null,
        },
      });
      return { available: true };
    }

    return {
      available: false,
      reason: status.errorMessage || "Serviço temporariamente indisponível.",
    };
  } catch (error) {
    console.error(`[CircuitBreaker] Erro ao verificar status de ${serviceName}:`, error);
    // Em caso de falha no banco de dados, assumimos que o serviço está disponível
    return { available: true };
  }
}

/**
 * Registra um sucesso no serviço, zerando o contador de falhas e reabrindo o circuito.
 */
export async function recordSuccess(serviceName: string): Promise<void> {
  try {
    await prisma.apiServiceStatus.upsert({
      where: { serviceName },
      update: {
        isAvailable: true,
        failureCount: 0,
        autoDisabledUntil: null,
        errorMessage: null,
      },
      create: {
        serviceName,
        isAvailable: true,
        failureCount: 0,
      },
    });
  } catch (error) {
    console.error(`[CircuitBreaker] Erro ao registrar sucesso para ${serviceName}:`, error);
  }
}

/**
 * Registra uma falha no serviço.
 * Se atingir o limite ou se for uma falha crítica (plano esgotado, erro de auth),
 * o circuito é aberto (serviço marcado como indisponível) e o tempo de cooldown é definido.
 */
export async function recordFailure(
  serviceName: string,
  errorMsg: string,
  isQuotaOrAuth = false
): Promise<void> {
  try {
    const status = await prisma.apiServiceStatus.findUnique({
      where: { serviceName },
    });

    const currentFailures = (status?.failureCount || 0) + 1;
    const shouldDisable = isQuotaOrAuth || currentFailures >= MAX_FAILURES;
    const cooldownDate = shouldDisable
      ? new Date(Date.now() + COOLDOWN_SECONDS * 1000)
      : null;

    await prisma.apiServiceStatus.upsert({
      where: { serviceName },
      update: {
        failureCount: currentFailures,
        lastFailure: new Date(),
        isAvailable: !shouldDisable,
        errorMessage: shouldDisable ? errorMsg : status?.errorMessage,
        autoDisabledUntil: cooldownDate,
      },
      create: {
        serviceName,
        failureCount: 1,
        lastFailure: new Date(),
        isAvailable: !shouldDisable,
        errorMessage: shouldDisable ? errorMsg : null,
        autoDisabledUntil: cooldownDate,
      },
    });

    console.warn(
      `[CircuitBreaker] Falha registrada para ${serviceName}. Total falhas consecutivas: ${currentFailures}. ` +
      `Estado: ${shouldDisable ? "BLOQUEADO (Indisponível)" : "ABERTO (Disponível)"}`
    );
  } catch (error) {
    console.error(`[CircuitBreaker] Erro ao registrar falha para ${serviceName}:`, error);
  }
}
