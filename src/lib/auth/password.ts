import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

// =============================================================================
// Password Hashing — bcrypt (Argon2id can be added when @node-rs/argon2 is installed)
// =============================================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// =============================================================================
// Password Strength Validation
// =============================================================================

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

export interface PasswordStrengthResult {
  score: number; // 0-4
  label: "muito-fraca" | "fraca" | "razoavel" | "forte" | "muito-forte";
  suggestions: string[];
  isValid: boolean;
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const suggestions: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else suggestions.push("Use pelo menos 8 caracteres");

  if (password.length >= 12) score++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else {
    if (!/[a-z]/.test(password)) suggestions.push("Adicione letras minúsculas");
    if (!/[A-Z]/.test(password)) suggestions.push("Adicione letras maiúsculas");
  }

  if (/\d/.test(password)) score++;
  else suggestions.push("Adicione números");

  if (/[@$!%*?&]/.test(password)) score++;
  else suggestions.push("Adicione símbolos (@$!%*?&)");

  // Penalise common patterns
  if (/^(123|abc|qwerty|password|senha)/i.test(password)) {
    score = Math.max(0, score - 2);
    suggestions.push("Evite sequências comuns");
  }

  const clampedScore = Math.min(4, Math.max(0, score)) as 0 | 1 | 2 | 3 | 4;

  const labels: Record<number, PasswordStrengthResult["label"]> = {
    0: "muito-fraca",
    1: "fraca",
    2: "razoavel",
    3: "forte",
    4: "muito-forte",
  };

  return {
    score: clampedScore,
    label: labels[clampedScore],
    suggestions,
    isValid: PASSWORD_REGEX.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

export function isUsernameValid(username: string): boolean {
  return USERNAME_REGEX.test(username);
}

export { PASSWORD_REGEX, USERNAME_REGEX };
