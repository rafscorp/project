// Force dynamic rendering globally during Docker builds to avoid database dependency
export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Agury Auto — Plataforma para Oficinas e Lojas Automotivas",
    template: "%s | Agury Auto",
  },
  description:
    "Plataforma SaaS estilo Trinks para estética e mecânica automotiva. Sua loja online, pedidos com retirada na loja, assinatura mensal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${dmSans.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
