import type { Metadata } from "next";
import localFont from "next/font/local";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";
import { cn } from "@/lib/utils";

/**
 * Fontes hospedadas localmente (`src/app/fonts/*.woff2`) via `next/font/local`:
 * elimina requisições externas ao Google Fonts em tempo de build na Vercel
 * (evitando falhas intermitentes de rede e o bug `vercel/next.js#99114` no Turbopack).
 */
const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-inter",
  display: "swap",
});

/** Fonte da nova identidade Índigo (Torre de Controle). Aplicada via classe `.font-poppins`. */
const poppins = localFont({
  src: [
    { path: "./fonts/poppins-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Master Mobility — Gestão de Frotas",
  description:
    "Sistema de gestão de frotas com ranking de condutores, análise de risco e monitoramento de performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={cn("h-full", "antialiased", inter.variable, "font-sans", poppins.variable)}>
      <body className="h-full font-sans">
        <TooltipProvider delay={200}>
          <AppSidebar>{children}</AppSidebar>
        </TooltipProvider>
      </body>
    </html>
  );
}

