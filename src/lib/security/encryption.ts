import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// =============================================================================
// lib/security/encryption.ts
// Criptografia AES-256-GCM com IV aleatório e Auth Tag (autenticado).
//
// Conformidade: LGPD Art. 46 | NIST SP 800-38D
//
// REGRAS DE SEGURANÇA:
//  - A chave (ENCRYPTION_KEY) deve ter exatamente 32 bytes (64 hex chars).
//  - NUNCA exponha a chave em logs, respostas de API ou stack traces.
//  - IV é único por operação (randomBytes) — reutilização = vulnerabilidade crítica.
//  - Auth Tag (GCM) garante integridade: qualquer adulteração rompe a decifragem.
// =============================================================================

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;        // 96 bits — padrão NIST para GCM
const AUTH_TAG_BYTES = 16;  // 128 bits — máximo de segurança GCM
const FIELD_SEPARATOR = ":";

/** Resultado estruturado de uma operação de cifragem */
export interface EncryptedPayload {
  /** IV em hex (12 bytes = 24 chars hex) */
  iv: string;
  /** Auth Tag em hex (16 bytes = 32 chars hex) */
  tag: string;
  /** Ciphertext em hex */
  ciphertext: string;
}

/** Retorna a chave de criptografia a partir da env — falha rápida se ausente */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key || key.length !== 64) {
    // Falha silenciosa: não expõe detalhes ao chamador externo
    throw new Error(
      "[Security] ENCRYPTION_KEY inválida: deve ter 64 caracteres hex (32 bytes). " +
      "Gere com: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }

  return Buffer.from(key, "hex");
}

// ─── Core: Cifrar ─────────────────────────────────────────────────────────────

/**
 * Cifra uma string com AES-256-GCM.
 * @returns EncryptedPayload com iv, tag e ciphertext em hex.
 * @throws Error se ENCRYPTION_KEY estiver ausente/inválida.
 */
export function encrypt(plaintext: string): EncryptedPayload {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_BYTES);

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_BYTES,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return {
    iv: iv.toString("hex"),
    tag: cipher.getAuthTag().toString("hex"),
    ciphertext: encrypted.toString("hex"),
  };
}

// ─── Core: Decifrar ───────────────────────────────────────────────────────────

/**
 * Decifra um EncryptedPayload AES-256-GCM.
 * @throws Error se Auth Tag for inválida (adulteração detectada) ou ENCRYPTION_KEY ausente.
 */
export function decrypt(payload: EncryptedPayload): string {
  const key = getEncryptionKey();

  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(payload.iv, "hex"),
    { authTagLength: AUTH_TAG_BYTES }
  );

  decipher.setAuthTag(Buffer.from(payload.tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

// ─── Helpers: Serialização para String (formato de storage no banco) ──────────

/**
 * Cifra um campo PII e serializa para string de banco:
 * Formato: `<iv_hex>:<authtag_hex>:<ciphertext_hex>`
 *
 * @example
 * const enc = encryptField("9BWZZZ377VT004251");
 * // "a1b2c3d4e5f6...":"deadbeef...":"4d3a2f..."
 */
export function encryptField(plaintext: string): string {
  if (!plaintext || plaintext === "—") return "—";
  const { iv, tag, ciphertext } = encrypt(plaintext);
  return [iv, tag, ciphertext].join(FIELD_SEPARATOR);
}

/**
 * Deserializa e decifra um campo PII armazenado no banco.
 * Retorna "—" se o valor for nulo, vazio ou o placeholder padrão.
 *
 * @throws Error se o formato for inválido ou se a Auth Tag falhar.
 */
export function decryptField(raw: string): string {
  if (!raw || raw === "—") return "—";

  const parts = raw.split(FIELD_SEPARATOR);
  if (parts.length !== 3) {
    // Campo provavelmente veio sem criptografia (migração legada) — retorna como está
    console.warn("[Security] Campo com formato inesperado — retornando valor bruto.");
    return raw;
  }

  const [iv, tag, ciphertext] = parts;
  return decrypt({ iv, tag, ciphertext });
}

// ─── Helper: Verificar se campo está criptografado ────────────────────────────

/**
 * Retorna true se a string parece estar no formato de campo criptografado.
 * Não faz decifragem — uso seguro para validação de campo.
 */
export function isEncryptedField(value: string): boolean {
  if (!value || value === "—") return false;
  const parts = value.split(FIELD_SEPARATOR);
  return (
    parts.length === 3 &&
    parts[0].length === IV_BYTES * 2 &&
    parts[1].length === AUTH_TAG_BYTES * 2
  );
}
