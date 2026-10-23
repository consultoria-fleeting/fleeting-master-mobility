/**
 * Layout da rota /painel-de-gestao.
 *
 * Existe apenas para exportar a metadata (SEO), já que a página é um
 * Client Component (necessário para usar `next/dynamic` com `ssr: false`).
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel de Gestão | Master Mobility",
  description:
    "Visão consolidada da frota: KPIs, veículos e condutores que exigem atenção, mapa interativo, TCO, KMs rodados, manutenção e assistente de IA.",
};

export default function PainelDeGestaoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
