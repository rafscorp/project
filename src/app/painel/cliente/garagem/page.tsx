import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { decryptField } from "@/lib/security/encryption";
import { Shield, Car } from "lucide-react";
import { GarageClient } from "./GarageClient";

export default async function GaragePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const rawVehicles = await prisma.vehicle.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  // Decifra os campos PII no servidor (nunca expõe dados criptografados ao cliente)
  const vehicles = rawVehicles.map((v) => ({
    id: v.id,
    placa: v.placa,
    marca: v.marca,
    modelo: v.modelo,
    ano: v.ano,
    cor: v.cor,
    combustivel: v.combustivel,
    versao: v.versao,
    cidade: v.cidade,
    chassi: decryptField(v.chassiEnc),
    motor: decryptField(v.motorEnc),
    ownerName: decryptField(v.ownerNameEnc),
    createdAt: v.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-black text-foreground flex items-center gap-3">
          <Car className="w-8 h-8 text-violet-400" />
          Minha Garagem Virtual
        </h1>
        <p className="text-muted-foreground mt-2">
          Seus veículos salvos para orçamentos rápidos. Dados protegidos por criptografia AES-256.
        </p>
      </div>

      {/* Banner de segurança */}
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
        <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
        <p className="text-sm text-muted-foreground">
          Chassi, motor e demais dados PII são cifrados com{" "}
          <span className="text-emerald-400 font-semibold">AES-256-GCM</span>{" "}
          e nunca são armazenados em texto claro no banco de dados.
        </p>
      </div>

      <GarageClient initialVehicles={vehicles} />
    </div>
  );
}
