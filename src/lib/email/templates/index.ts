import { emailProvider } from "../provider";
import { env } from "@/lib/env";

export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #f5b942;">Bem-vindo à Agury Auto!</h1>
      <p>Olá ${name},</p>
      <p>Obrigado por se juntar à melhor plataforma para o setor automotivo.</p>
      <p>Acesse o sistema:</p>
      <a href="${env.NEXT_PUBLIC_APP_URL}/login" style="background: #f5b942; color: #18181b; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Fazer Login</a>
    </div>
  `;

  return emailProvider.send({
    to,
    subject: "Bem-vindo à Agury Auto!",
    html,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${token}`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #f5b942;">Redefinição de Senha</h1>
      <p>Você solicitou a redefinição de sua senha na Agury Auto.</p>
      <p>Clique no botão abaixo para criar uma nova senha (válido por 60 minutos):</p>
      <a href="${resetUrl}" style="background: #f5b942; color: #18181b; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Redefinir Senha</a>
      <p>Se você não solicitou isso, pode ignorar este email com segurança.</p>
    </div>
  `;

  return emailProvider.send({
    to,
    subject: "Instruções para redefinir sua senha",
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
