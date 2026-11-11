import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

/** Fonte da nova identidade Índigo (Torre de Controle). Aplicada via classe `.font-poppins`. */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

