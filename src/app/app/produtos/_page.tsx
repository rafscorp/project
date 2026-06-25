import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ProductService } from "@/services/product.service";
import { ProductsManager } from "@/components/dashboard/ProductsManager";

export default async function ProductsPage() {
  const session = await getSession();
  if (!session?.storeId) redirect("/login");

  const products = await ProductService.listForDashboard(session.storeId);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Produtos</h1>
      <p className="mt-1 text-sm text-zinc-400">Gerencie o catálogo da sua loja online</p>
      <div className="mt-6">
        <ProductsManager initialProducts={JSON.parse(JSON.stringify(products))} />
      </div>
    </div>
  );
}
