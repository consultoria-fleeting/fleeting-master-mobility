import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="pt-BR" suppressHydrationWarning className={cn("h-full", "antialiased", inter.variable, "font-sans", geist.variable)}>
      <body className="h-full font-sans">
        <TooltipProvider delay={200}>
          <AppSidebar>{children}</AppSidebar>
        </TooltipProvider>
      </body>
    </html>
  );
}

