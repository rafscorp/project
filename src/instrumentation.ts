export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Inicializa o agendador de tarefas em background apenas no runtime Node (não-edge)
    const { startCronJobs } = await import('@/lib/cron/cleanup');
    startCronJobs();
  }
}
