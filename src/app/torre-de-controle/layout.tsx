/**
 * Layout da rota /torre-de-controle.
 *
 * Existe apenas para exportar a metadata (SEO), já que a página é um
 * Client Component (necessário para usar `next/dynamic` com `ssr: false`).
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Torre de Controle | Master Mobility",
  description:
    "Visão consolidada da frota: KPIs, veículos e condutores que exigem atenção, mapa interativo, TCO, KMs rodados, manutenção e assistente de IA.",
};

export default function TorreDeControleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
