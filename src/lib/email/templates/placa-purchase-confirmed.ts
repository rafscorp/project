export const placaPurchaseConfirmed = (name: string, credits: number, dashboardUrl: string) => ({
  subject: "Pagamento Confirmado - Agury Auto",
  html: `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #10b981;">Pagamento Confirmado! 🎉</h2>
      <p>Olá, <strong>${name}</strong>. Seu pagamento via PIX foi processado com sucesso.</p>
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 18px;"><strong>${credits} créditos de consulta de placa</strong> foram adicionados à sua conta.</p>
      </div>
      <p>Você já pode utilizar seus novos créditos para descobrir histórico completo, chassi e motor de qualquer veículo pela placa na base nacional.</p>
      <br/>
      <a href="${dashboardUrl}" style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Consultar Placas Agora</a>
      <br/><br/>
      <p style="font-size: 12px; color: #666;">Obrigado por confiar na Agury Auto.</p>
    </div>
  `
});
