import { env } from "@/lib/env";

// =============================================================================
// Abstract Email Provider
// =============================================================================

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<boolean>;
}

// =============================================================================
// Implementations
// =============================================================================

class ConsoleEmailProvider implements EmailProvider {
  async send(options: EmailOptions) {
    console.log("==================== EMAIL ====================");
    console.log(`TO:      ${options.to}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`BODY:`);
    console.log(options.html);
    console.log("===============================================");
    return true;
  }
}

// Mock Resend/SendGrid/SES implementations for now, would use actual SDKs
class ResendEmailProvider implements EmailProvider {
  async send(options: EmailOptions) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });
      return res.ok;
    } catch (e) {
      console.error("Resend error:", e);
      return false;
    }
  }
}

import nodemailer from "nodemailer";

// =============================================================================
// Factory
// =============================================================================

class NodemailerEmailProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async send(options: EmailOptions) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || "noreply@agury.com.br",
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (e) {
      console.error("Nodemailer error:", e);
      return false;
    }
  }
}

function createEmailProvider(): EmailProvider {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return new NodemailerEmailProvider();
  }
  
  if (env.RESEND_API_KEY) {
    return new ResendEmailProvider();
  }
  
  // Default to console for development or se não tiver chaves
  return new ConsoleEmailProvider();
}

export const emailProvider = createEmailProvider();
