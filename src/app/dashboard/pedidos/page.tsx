import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { Package, MessageCircle, CalendarClock, User, Car } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function PedidosPage() {
  const session = await getSession();
  if (!session || !session.storeId) redirect("/login");

  // Busca orçamentos que foram aceitos (Peças Agendadas/Encomendadas)
  const encomendas = await prisma.quoteRequest.findMany({
    where: { 
      storeId: session.storeId,
      status: "ACCEPTED"
    },
    include: {
      customer: {
        select: {
          name: true,
          email: true,
          phone: true,
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-black text-foreground">Peças Agendadas / Encomendas</h1>
        <p className="text-muted-foreground mt-1">
          Lista de peças reservadas pelos clientes através de orçamentos aceitos.
        </p>
      </div>

      {encomendas.length === 0 ? (
        <div className="bg-panel border border-border-subtle rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Nenhuma peça agendada</h3>
          <p className="text-muted-foreground max-w-md">
            Quando você enviar um preço no chat e o cliente aceitar, a encomenda aparecerá aqui para separação.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {encomendas.map((enc) => (
            <div key={enc.id} className="bg-panel border border-border-subtle rounded-2xl p-5 hover:border-amber-500/30 transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Package className="w-5 h-5 text-amber-500" />
                </div>
                <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">
                  Agendada
                </div>
              </div>

              <div className="mb-4 flex-1">
                <h3 className="text-lg font-bold text-foreground line-clamp-2" title={enc.part}>
                  {enc.part}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1 gap-1.5">
                  <Car className="w-3.5 h-3.5" />
                  <span>{enc.vehicle} {enc.year ? `(${enc.year})` : ""}</span>
                </div>
              </div>

              <div className="bg-background rounded-xl p-3 border border-border-subtle mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-sm text-foreground">{enc.customer.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span className="truncate pr-2">{enc.customer.email}</span>
                  <span className="font-mono text-emerald-400 font-bold whitespace-nowrap">
                    {enc.priceOffer ? `R$ ${enc.priceOffer.toFixed(2)}` : "A combinar"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/dashboard/orcamentos?chat=${enc.id}`} className="flex-1">
                  <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-foreground font-semibold">
                    <MessageCircle className="w-4 h-4 mr-2" /> Falar no Chat
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
