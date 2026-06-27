export const subscriptionConfirmedEmail = (name: string, dashboardUrl: string) => ({
  subject: "Assinatura Ativada - Agury Auto",
  html: `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #10b981;">Assinatura Ativada! 🚀</h2>
      <p>Olá, <strong>${name}</strong>. O pagamento da sua assinatura foi aprovado com sucesso e sua loja já está com os benefícios ativos.</p>
      
      <div style="background-color: #eff6ff; padding: 16px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 24px 0;">
        <h4 style="margin-top: 0; color: #1d4ed8;">Aproveite também! 🚘</h4>
        <p style="margin-bottom: 0; font-size: 14px; color: #1e3a8a;">
          Além dos recursos de loja, nós possuímos pacotes de Consultas de Placas com desconto. Seus clientes ou você podem pesquisar qualquer placa do Brasil e obter todos os dados instantaneamente.
        </p>
      </div>

      <br/>
      <a href="${dashboardUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Acessar Meu Painel</a>
      <br/><br/>
      <p style="font-size: 12px; color: #666;">Seja bem-vindo(a) ao próximo nível do seu negócio automobilístico.</p>
    </div>
  `
});
