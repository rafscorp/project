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

// =============================================================================
// Factory
// =============================================================================

function createEmailProvider(): EmailProvider {
  if (env.RESEND_API_KEY) {
    return new ResendEmailProvider();
  }
  
  // Default to console for development or if no keys are set
  return new ConsoleEmailProvider();
}

export const emailProvider = createEmailProvider();
