import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from "otplib";
import QRCode from "qrcode";
import { encryptField, decryptField } from "@/lib/security/encryption";

// =============================================================================
// lib/auth/2fa.ts
// Autenticação de Dois Fatores — TOTP (RFC 6238)
//
// Compatível com: Google Authenticator, Authy, Microsoft Authenticator, 1Password.
//
// SEGURANÇA:
//  - O secret TOTP é salvo ENCRIPTADO no banco (AES-256-GCM via encryptField).
//  - Window de validação = 1 (30s anterior + 30s atual + 30s seguinte).
//    Isso compensa clock drift de dispositivos sem tornar o sistema inseguro.
//  - NUNCA logue o secret em produção.
// =============================================================================

const APP_NAME = "Agury Auto";

// Configura otplib para comportamento seguro
const totp = new TOTP({
  digits: 6,
  window: 1, // Permite 30s de tolerância para clock drift
  algorithm: "sha1",
  period: 30,
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin()
});

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface TwoFactorSetupResult {
  /** Secret TOTP em base32 — NUNCA retorne ao cliente após confirmação */
  secret: string;
  /** Data URI do QR Code para renderizar direto no <img> */
  qrCodeDataUrl: string;
  /** URI OTP para apps manuais */
  otpAuthUrl: string;
}

// ─── Geração ──────────────────────────────────────────────────────────────────

/**
 * Gera um novo secret TOTP e retorna o QR Code para o usuário escanear.
 * Deve ser chamado apenas no server-side (API Route / Server Action).
 *
 * @param userEmail - Email do usuário (exibido no app autenticador)
 * @returns TwoFactorSetupResult com secret, QR Code e URI OTP
 */
export async function generate2FASecret(
  userEmail: string
): Promise<TwoFactorSetupResult> {
  // Gera secret aleatório criptograficamente seguro (base32, ~20 bytes)
  const secret = totp.generateSecret(20);

  // Monta o URI padrão RFC 6238 (keyuri)
  const otpAuthUrl = totp.toURI({ label: userEmail, issuer: APP_NAME, secret });

  // Gera QR Code como Data URL (png base64) — renderizável direto em <img>
  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl, {
    width: 256,
    margin: 2,
    color: {
      dark: "#ffffff",  // Módulos brancos (legível em dark mode)
      light: "#09090b", // Fundo dark da marca
    },
    errorCorrectionLevel: "H", // Máxima tolerância a erros
  });

  return { secret, qrCodeDataUrl, otpAuthUrl };
}

// ─── Verificação ──────────────────────────────────────────────────────────────

/**
 * Valida um token TOTP de 6 dígitos contra o secret do usuário.
 *
 * @param secret  - Secret TOTP em base32 (PLAINTEXT, já decifrado)
 * @param token   - Código de 6 dígitos fornecido pelo usuário
 * @returns true se o token for válido dentro da janela de tempo
 */
export async function verify2FAToken(secret: string, token: string): Promise<boolean> {
  try {
    // Remove espaços e caracteres não-numéricos que o usuário possa ter digitado
    const cleanToken = token.replace(/\s/g, "").trim();

    if (!/^\d{6}$/.test(cleanToken)) return false;

    const result = await totp.verify(cleanToken, { secret });
    return result.valid;
  } catch (error) {
    console.error("[2FA] Erro ao verificar token:", error);
    return false;
  }
}

// ─── Criptografia do Secret ───────────────────────────────────────────────────

/**
 * Encripta o secret TOTP para persistência no banco de dados.
 * Deve ser chamado ANTES de salvar no campo `twoFactorSecret`.
 *
 * @param plaintextSecret - Secret em base32 gerado por generate2FASecret
 * @returns String encriptada no formato `iv:tag:ciphertext`
 */
export function encrypt2FASecret(plaintextSecret: string): string {
  return encryptField(plaintextSecret);
}

/**
 * Decifra o secret TOTP armazenado no banco.
 * Deve ser chamado ANTES de passar para verify2FAToken.
 *
 * @param encryptedSecret - String encriptada do banco (`iv:tag:ciphertext`)
 * @returns Secret TOTP em base32 (plaintext)
 * @throws Error se a decifragem falhar (Auth Tag inválida = adulteração)
 */
export function decrypt2FASecret(encryptedSecret: string): string {
  return decryptField(encryptedSecret);
}

// ─── Helper: Gerar código de recuperação ─────────────────────────────────────

/**
 * Gera N códigos de recuperação para backup (caso o usuário perca o dispositivo).
 * Cada código é hexadecimal de 10 bytes (20 chars), salvo como hash no banco.
 *
 * @param count - Número de códigos a gerar (padrão: 8)
 */
export function generateRecoveryCodes(count = 8): string[] {
  const { randomBytes } = require("crypto") as typeof import("crypto");
  return Array.from({ length: count }, () =>
    randomBytes(10).toString("hex").toUpperCase()
  );
}
