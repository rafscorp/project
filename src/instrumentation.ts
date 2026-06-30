import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1,
      debug: false,
    });

    // Inicializa o agendador de tarefas em background apenas no runtime Node (não-edge)
    const { startCronJobs } = await import('@/lib/cron/cleanup');
    const { startEmailBot } = await import('@/lib/jobs/emailBot');
    startCronJobs();
    startEmailBot();
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1,
      debug: false,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
