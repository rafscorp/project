export const welcomeEmail = (name: string, loginUrl: string) => ({
  subject: "Bem-vindo à Agury Auto!",
  html: `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2563eb;">Olá, ${name}!</h2>
      <p>Obrigado por se juntar à <strong>Agury Auto</strong>. Estamos felizes em tê-lo conosco.</p>
      <p>Aqui você pode gerenciar sua garagem virtual, consultar dados detalhados de veículos e se conectar com as melhores oficinas da sua região.</p>
      <br/>
      <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Acessar minha conta</a>
      <br/><br/>
      <p style="font-size: 12px; color: #666;">Se você não se cadastrou em nossa plataforma, por favor ignore este email.</p>
    </div>
  `
});
