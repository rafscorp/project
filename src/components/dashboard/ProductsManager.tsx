"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  active: boolean;
  sku?: string | null;
};

export function ProductsManager({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", stock: "0", sku: "", description: "" });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        sku: form.sku || undefined,
        description: form.description || undefined,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (json.success) {
      setProducts((prev) => [json.data, ...prev]);
      setShowForm(false);
      setForm({ name: "", price: "", stock: "0", sku: "", description: "" });
      router.refresh();
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <p className="text-sm text-muted-foreground">{products.length} produtos cadastrados</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "+ Novo produto"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardBody>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Preço (R$)" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              <Input label="Estoque" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
              <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm text-foreground/80">Descrição</label>
                <textarea className="w-full rounded-xl border border-zinc-700 bg-panel/80 px-4 py-3 text-foreground" rows={2}
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <Button type="submit" loading={loading}>Salvar produto</Button>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="space-y-3">
        {products.map((p) => (
          <Card key={p.id}>
            <CardBody className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">{p.name}</p>
                <p className="text-sm text-muted-foreground">{p.sku || p.slug}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-amber-400">{formatCurrency(p.price)}</span>
                <span className="text-sm text-muted-foreground">Est: {p.stock}</span>
                <Badge variant={p.active ? "success" : "default"}>{p.active ? "Ativo" : "Inativo"}</Badge>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
