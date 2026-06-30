import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
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
    default: "ConectaParts — Plataforma para Lojas de Autopeças",
    template: "%s | ConectaParts",
  },
  description:
    "A Plataforma Definitiva para Lojas de Autopeças. Organize orçamentos, vendas e estoque com tecnologia e segurança.",
  keywords: ["autopeças", "peças automotivas", "gestão de loja", "orçamentos", "catálogo", "B2B"],
  authors: [{ name: "ConectaParts" }],
  creator: "ConectaParts",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://conectaparts.com.br",
    title: "ConectaParts — Acelere suas Vendas de Peças",
    description: "Conectando lojas de autopeças e oficinas em um só lugar. Venda mais rápido sem pagar comissões absurdas.",
    siteName: "ConectaParts",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConectaParts — Acelere suas Vendas de Peças",
    description: "Plataforma SaaS de última geração para revolucionar a forma como você gerencia sua loja de autopeças.",
  },
  icons: {
    icon: "/images/icon-conectaparts-transparent.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${dmSans.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-right" toastOptions={{ className: "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700" }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
