import { NextRequest, NextResponse } from "next/server";
import { generateUploadUrl } from "@/lib/storage/s3";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth/session";
import { z } from "zod";

const uploadSchema = z.object({
  filename: z.string().min(1, "O nome do arquivo é obrigatório").max(255),
  contentType: z.string().regex(/^(image\/(jpeg|png|webp|gif))|(application\/pdf)$/, "Tipo de arquivo não permitido"),
  folder: z.enum(["avatars", "stores", "documents"]).default("avatars"),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Validar Sessão
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return new NextResponse("Não autorizado", { status: 401 });
    
    const session = await verifySessionToken(token);
    if (!session) return new NextResponse("Sessão inválida", { status: 401 });

    // 2. Validar Input do Cliente
    const body = await req.json();
    const result = uploadSchema.safeParse(body);
    
    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: "Dados inválidos", details: result.error.format() }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { filename, contentType, folder } = result.data;

    // 3. Gerar URL Pré-assinada (Client Direct Upload)
    const uploadData = await generateUploadUrl(filename, contentType, `${folder}/${session.userId}`);

    return new NextResponse(JSON.stringify(uploadData), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("[UPLOAD API ERROR]", error);
    return new NextResponse(JSON.stringify({ error: "Falha ao gerar link de upload seguro" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
