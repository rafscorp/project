import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";
import crypto from "crypto";

// Retorna null caso as variáveis não estejam preenchidas (fallback para desenvolvimento local se necessário)
export const s3Client = env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY && env.S3_ENDPOINT
  ? new S3Client({
      region: "auto", // Cloudflare R2 usa "auto"
      endpoint: env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    })
  : null;

/**
 * Gera uma URL assinada (Pre-signed URL) para o cliente fazer o upload direto do navegador para o R2/S3.
 * Evita que o arquivo passe pelo servidor Node.js, economizando banda e RAM.
 */
export async function generateUploadUrl(fileName: string, contentType: string, folder: string = "uploads") {
  if (!s3Client || !env.S3_BUCKET_NAME) {
    throw new Error("S3/R2 não está configurado nas variáveis de ambiente.");
  }

  // Sanitiza nome do arquivo e cria hash para evitar colisões
  const fileHash = crypto.randomBytes(8).toString("hex");
  const extension = fileName.split('.').pop();
  const safeName = `${folder}/${Date.now()}-${fileHash}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: safeName,
    ContentType: contentType,
  });

  // URL expira em 5 minutos
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return {
    signedUrl,
    fileKey: safeName,
    // URL pública final assumindo que o bucket R2 é público e está atrelado a um subdomínio
    publicUrl: `${env.NEXT_PUBLIC_STORAGE_URL}/${safeName}`
  };
}

export async function deleteFileFromStorage(fileKey: string) {
  if (!s3Client || !env.S3_BUCKET_NAME) return false;

  try {
    const command = new DeleteObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: fileKey,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Falha ao deletar arquivo do storage:", error);
    return false;
  }
}
