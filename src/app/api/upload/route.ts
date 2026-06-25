import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    // Apenas donos de loja e equipe podem fazer upload
    if (!session || (session.role !== UserRole.STORE_OWNER && session.role !== UserRole.STORE_STAFF)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Validar tipo de arquivo
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Formato de arquivo inválido. Envie JPG, PNG ou WEBP." }, { status: 400 });
    }

    // Validar tamanho (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "O arquivo deve ter no máximo 5MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Mapeamento estrito de extensão por MIME-type (impede RCE injetando extensões executáveis)
    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };
    const extension = mimeToExt[file.type] || ".jpg";
    const fileName = `${session.storeId}-${crypto.randomBytes(16).toString("hex")}${extension}`;
    
    // Caminho completo
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Garantir que a pasta existe
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignorar se já existir
    }

    const filePath = path.join(uploadDir, fileName);

    // Salvar o arquivo
    await writeFile(filePath, buffer);

    // Retornar a URL pública
    const url = `/uploads/${fileName}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao fazer upload." }, { status: 500 });
  }
}
