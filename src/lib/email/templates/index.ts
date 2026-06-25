import { emailProvider } from "../provider";
import { env } from "@/lib/env";

export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; background: #09090b; color: #f5f5f5; border-radius: 24px; border: 1px solid #27272a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; padding: 10px 14px; border-radius: 999px; background: #f5b942; color: #18181b; font-weight: 700;">Agury Auto • Plataforma Premium</div>
      </div>
      <h1 style="color: #f5b942; margin-bottom: 12px; font-size: 28px;">Bem-vindo à Agury Auto!</h1>
      <p>Olá ${name},</p>
      <p>Obrigado por se juntar à plataforma que ajuda lojas automotivas a vender mais, organizar melhor e oferecer uma experiência premium para seus clientes.</p>
      <p>Acesse o sistema e aproveite uma operação mais simples para vender e comprar peças com mais rapidez.</p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${env.NEXT_PUBLIC_APP_URL}/login" style="background: #f5b942; color: #18181b; padding: 12px 20px; text-decoration: none; border-radius: 999px; font-weight: bold;">Fazer Login</a>
      </div>
      <p style="font-size: 13px; color: #a1a1aa;">Se tiver qualquer dúvida, nossa equipe está à disposição.</p>
    </div>
  `;

  return emailProvider.send({
    to,
    subject: "Bem-vindo à Agury Auto!",
    html,
  });
}

export async function sendStoreRegistrationEmail(to: string, name: string, storeName: string, accessCode: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; background: #09090b; color: #f5f5f5; border-radius: 24px; border: 1px solid #27272a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; padding: 10px 14px; border-radius: 999px; background: #f5b942; color: #18181b; font-weight: 700;">Agury Auto • Loja criada</div>
      </div>
      <h1 style="color: #f5b942; margin-bottom: 12px; font-size: 28px;">Sua loja já está pronta!</h1>
      <p>Olá ${name},</p>
      <p>Sua loja <strong>${storeName}</strong> foi criada com sucesso na Agury Auto.</p>
      <p>Use o código abaixo para acessar o painel da sua operação:</p>
      <div style="background: #18181b; padding: 20px; border-radius: 16px; margin: 20px 0; text-align: center; border: 1px solid #27272a;">
        <p style="margin: 0; color: #a1a1aa; font-size: 14px;">Código de acesso</p>
        <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 5px; color: #f5b942;">${accessCode}</p>
      </div>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${env.NEXT_PUBLIC_APP_URL}/login" style="background: #f5b942; color: #18181b; padding: 12px 20px; text-decoration: none; border-radius: 999px; font-weight: bold;">Entrar na plataforma</a>
      </div>
    </div>
  `;

  return emailProvider.send({
    to,
    subject: `Sua loja na Agury Auto está pronta!`,
    html,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; background: #09090b; color: #f5f5f5; border-radius: 24px; border: 1px solid #27272a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; padding: 10px 14px; border-radius: 999px; background: #f5b942; color: #18181b; font-weight: 700;">Agury Auto • Segurança</div>
      </div>
      <h1 style="color: #f5b942; margin-bottom: 12px; font-size: 28px;">Redefinição de Senha</h1>
      <p>Você solicitou a redefinição de sua senha na Agury Auto.</p>
      <p>Clique no botão abaixo para criar uma nova senha. Este link é válido por <strong>60 minutos</strong>.</p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${resetUrl}" style="background: #f5b942; color: #18181b; padding: 14px 28px; text-decoration: none; border-radius: 999px; font-weight: bold; font-size: 16px;">Redefinir Minha Senha</a>
      </div>
      <p style="font-size: 13px; color: #a1a1aa;">Se você não solicitou esta redefinição, pode ignorar este email com segurança. Sua senha não será alterada.</p>
      <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
      <p style="font-size: 12px; color: #71717a;">Se o botão não funcionar, copie e cole este link no navegador:</p>
      <p style="font-size: 12px; color: #71717a; word-break: break-all;">${resetUrl}</p>
    </div>
  `;

  return emailProvider.send({
    to,
    subject: "Redefinição de senha — Agury Auto",
    html,
  });
}

export async function sendOrderConfirmedEmail(to: string, orderNumber: string, pickupCode: string, storeName: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #10b981;">Pedido Confirmado!</h1>
      <p>Seu pedido <strong>${orderNumber}</strong> foi recebido pela loja <strong>${storeName}</strong>.</p>
      <div style="background: #f4f4f5; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; color: #71717a; font-size: 14px;">Seu código de retirada</p>
        <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 5px; color: #f5b942;">${pickupCode}</p>
      </div>
      <p>Apresente este código na loja para retirar seus produtos.</p>
    </div>
  `;

  return emailProvider.send({
    to,
    subject: `Pedido Confirmado - ${orderNumber}`,
    html,
  });
}

export async function sendLoginCodeEmail(to: string, name: string, code: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; background: #09090b; color: #f5f5f5; border-radius: 24px; border: 1px solid #27272a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; padding: 10px 14px; border-radius: 999px; background: #f5b942; color: #18181b; font-weight: 700;">Agury Auto • Código de Acesso</div>
      </div>
      <h1 style="color: #f5b942; margin-bottom: 12px; font-size: 28px; text-align: center;">Seu código de acesso</h1>
      <p>Olá ${name},</p>
      <p>Use o código abaixo para acessar sua conta na Agury Auto:</p>
      <div style="background: #18181b; padding: 20px; border-radius: 16px; margin: 20px 0; text-align: center; border: 1px solid #27272a;">
        <p style="margin: 0; color: #a1a1aa; font-size: 14px;">Código de acesso</p>
        <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold; font-family: monospace; letter-spacing: 8px; color: #f5b942;">${code}</p>
      </div>
      <p style="font-size: 13px; color: #a1a1aa;">Este código é válido por 15 minutos. Se você não solicitou este código, pode ignorar este email.</p>
    </div>
  `;

  return emailProvider.send({
    to,
    subject: `${code} — Código de acesso Agury Auto`,
    html,
  });
}
