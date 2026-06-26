import prisma from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { GodModeClient } from "./GodModeClient";

export default async function GodModePage({ params }: { params: { id: string } }) {
  const store = await prisma.store.findUnique({
    where: { id: params.id },
    include: {
      owner: true,
      subscription: { include: { plan: true } },
      offers: { orderBy: { createdAt: "desc" } },
      _count: { select: { products: { where: { deletedAt: null } } } }
    }
  });

  if (!store) redirect("/admin/lojas");

  return <GodModeClient store={store} />;
}
