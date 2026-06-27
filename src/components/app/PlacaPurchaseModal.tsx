"use client";
import { useState, useEffect } from "react";
import { X, QrCode, Copy, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface PlacaPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PlacaPurchaseModal({ isOpen, onClose, onSuccess }: PlacaPurchaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [purchaseData, setPurchaseData] = useState<{
    purchaseId: string;
    qrCodeBase64: string;
    copiaECola: string;
    amount: number;
  } | null>(null);
  
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "PAID" | "FAILED">("PENDING");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && plans.length === 0) {
      fetch("/api/placa-plans")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPlans(data);
            if (data.length > 0) setSelectedPlan(data[0].id);
          }
        })
        .catch(err => console.error("Error fetching plans:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (purchaseData?.purchaseId && paymentStatus === "PENDING") {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/placa-plans/purchase/${purchaseData.purchaseId}/status`);
          const data = await res.json();
          if (data.status === "PAID") {
            setPaymentStatus("PAID");
            clearInterval(interval);
            setTimeout(() => {
              onSuccess();
            }, 3000);
          }
        } catch (error) {
          console.error("Erro polling status:", error);
        }
      }, 5000); // Poll a cada 5 segundos
    }
    return () => clearInterval(interval);
  }, [purchaseData, paymentStatus]);

  const handlePurchase = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/placa-plans/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erro ao gerar PIX");
      }
      
      setPurchaseData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (purchaseData?.copiaECola) {
      navigator.clipboard.writeText(purchaseData.copiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-panel border border-border-subtle rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
        
        {/* Close Button */}
        {!purchaseData || paymentStatus === "PAID" ? (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-zinc-800/50 hover:bg-zinc-700 rounded-full text-zinc-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        ) : null}

        {/* State 1: Choose Plan */}
        {!purchaseData && (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/40 rounded-2xl flex items-center justify-center mb-6">
              <QrCode className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">Comprar Consultas</h2>
            <p className="text-muted-foreground mb-6">
              Adicione mais consultas à sua conta para descobrir todos os dados dos veículos pela placa.
            </p>

            {error && (
              <div className="w-full bg-red-500/10 border border-red-500/40 p-4 rounded-xl mb-4 flex items-center gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-red-300 font-medium">{error}</p>
              </div>
            )}

            <div className="w-full space-y-3 mb-8">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                    selectedPlan === plan.id 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-border-subtle hover:border-zinc-700'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.credits} consultas ({plan.features[0]})</p>
                  </div>
                  <div className="font-black text-lg text-foreground">
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                  </div>
                </div>
              ))}
              
              {plans.length === 0 && (
                <div className="p-4 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              )}
            </div>

            <button
              onClick={handlePurchase}
              disabled={loading || !selectedPlan}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-4 rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Gerar PIX"}
            </button>
          </div>
        )}

        {/* State 2: PIX Checkout */}
        {purchaseData && paymentStatus === "PENDING" && (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-black text-foreground mb-2">Pague via PIX</h2>
            <p className="text-muted-foreground mb-6">
              Abra o app do seu banco e escaneie o código ou copie o Pix Copia e Cola.
            </p>

            <div className="bg-white p-4 rounded-2xl mb-6">
              <img 
                src={`data:image/png;base64,${purchaseData.qrCodeBase64}`} 
                alt="QR Code PIX" 
                className="w-48 h-48"
              />
            </div>

            <div className="w-full bg-zinc-900 border border-border-subtle p-3 rounded-xl flex items-center gap-3 mb-8 cursor-pointer hover:bg-zinc-800 transition-colors" onClick={copyToClipboard}>
              <div className="truncate flex-1 text-sm text-muted-foreground">
                {purchaseData.copiaECola}
              </div>
              <button className="text-blue-400 p-2 shrink-0 flex items-center gap-2 font-bold">
                {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span className="font-medium">Aguardando pagamento...</span>
            </div>
            <p className="text-xs text-zinc-600 mt-2">
              Seus créditos serão liberados automaticamente.
            </p>
          </div>
        )}

        {/* State 3: Success */}
        {purchaseData && paymentStatus === "PAID" && (
          <div className="flex flex-col items-center text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">Pagamento Confirmado!</h2>
            <p className="text-muted-foreground mb-8">
              Seus créditos já estão disponíveis na sua conta. Boas consultas!
            </p>
            
            <button
              onClick={onSuccess}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors"
            >
              Começar a usar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
