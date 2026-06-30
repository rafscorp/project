"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import Image from "next/image";

export function CheckoutButton({ planId }: { planId: string }) {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<{ encodedImage: string; payload: string } | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao processar checkout");

      if (data.pixQrCode) {
        setPixData(data.pixQrCode);
        toast.success("PIX gerado com sucesso!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (pixData) {
    return (
      <div className="mt-6 flex flex-col items-center space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
        <h3 className="font-display text-lg font-bold text-amber-400">Escaneie o QR Code</h3>
        <p className="text-sm text-muted-foreground">
          Abra o app do seu banco e escaneie o código abaixo para ativar sua assinatura.
        </p>
        <div className="rounded-lg bg-white p-4">
          <Image
            src={`data:image/png;base64,${pixData.encodedImage}`}
            alt="PIX QR Code"
            width={200}
            height={200}
            className="h-48 w-48"
          />
        </div>
        <div className="flex w-full flex-col gap-2 pt-2">
          <p className="text-xs text-muted-foreground">Ou copie o código PIX Copia e Cola:</p>
          <input
            type="text"
            readOnly
            value={pixData.payload}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 outline-none"
            onClick={(e) => {
              (e.target as HTMLInputElement).select();
              navigator.clipboard.writeText(pixData.payload);
              toast.success("Código PIX copiado!");
            }}
          />
        </div>
        <Button 
          variant="outline" 
          className="mt-2 w-full"
          onClick={() => window.location.reload()}
        >
          Já paguei (Atualizar)
        </Button>
      </div>
    );
  }

  return (
    <Button 
      className="mt-6 w-full" 
      onClick={handleCheckout} 
      disabled={loading}
    >
      {loading ? "Gerando PIX..." : "Ativar Assinatura via PIX"}
    </Button>
  );
}
