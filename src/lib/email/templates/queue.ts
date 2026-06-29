export const o2oCustomerEmail = (customerName: string, storeName: string, code: string, mapsLink: string) => ({
  subject: `Seu Código de Compra - ${storeName}`,
  html: `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #059669;">Olá, ${customerName}!</h2>
      <p>Sua solicitação de peça foi enviada para a loja <strong>${storeName}</strong>.</p>
      <p>Apresente o código abaixo no balcão da loja para finalizar sua compra:</p>
      
      <div style="background-color: #f3f4f6; border: 2px dashed #059669; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
        <span style="font-family: monospace; font-size: 48px; font-weight: 900; letter-spacing: 8px; color: #059669;">${code}</span>
      </div>

      <p><strong>📍 Localização da Loja:</strong></p>
      <a href="${mapsLink}" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin-top: 12px;">Abrir no Google Maps</a>
      
      <br/><br/>
      <p style="font-size: 12px; color: #666;">Este código é único e seguro. Apenas a loja informada pode validá-lo.</p>
    </div>
  `
});

export const o2oStoreEmail = (storeName: string, customerName: string, vehicle: string, part: string) => ({
  subject: `Novo Cliente na Fila! - ${customerName}`,
  html: `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #059669;">Olá, equipe da ${storeName}!</h2>
      <p>Um novo cliente gerou um código de compra e logo irá até a sua loja.</p>
      
      <div style="background-color: #f9fafb; border-left: 4px solid #059669; padding: 16px; margin: 24px 0;">
        <p><strong>Cliente:</strong> ${customerName}</p>
        <p><strong>Veículo:</strong> ${vehicle}</p>
        <p><strong>Peça Solicitada:</strong> ${part}</p>
      </div>

      <p>Acesse o painel da sua loja na aba <strong>Fila de Clientes</strong> para acompanhar e validar o código quando o cliente chegar.</p>
      <br/>
      <p style="font-size: 12px; color: #666;">Agury Auto - Conectando clientes reais à sua loja física.</p>
    </div>
  `
});
