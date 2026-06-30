import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { PerfilForm } from "./PerfilForm";

export default async function ContaPerfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      username: true,
      email: true,
      phone: true,
      avatarUrl: true,
    }
  });

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e foto de perfil</p>
      </div>

      <PerfilForm user={user} />
    </div>
  );
}
