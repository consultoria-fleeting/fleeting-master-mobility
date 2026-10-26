/**
 * KpiCards — Linha com os 5 cards de KPI do topo da Torre de Controle.
 *
 * Cada card: label em caixa alta + ícone "i" (tooltip com a composição),
 * valor em destaque, complemento opcional, badge de variação e legenda.
 * Clicar no card abre um drawer (Sheet do shadcn/ui) com o detalhamento.
 */

"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { InfoTooltip } from "@/components/info-tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { KpiTorre } from "@/types/torre-de-controle";

/* ---------- Badge de variação ---------- */

function DeltaBadge({ delta, bom }: Pick<KpiTorre, "delta" | "bom">) {
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
        bom === null && "bg-[#F1F5F9] text-[#64748B]",
        bom === true && "bg-[#059669]/10 text-[#059669]",
        bom === false && "bg-[#E11D48]/10 text-[#E11D48]"
      )}
    >
      {delta}
    </span>
  );
}

/* ---------- Card individual ---------- */

interface KpiCardProps {
  kpi: KpiTorre;
  indice: number;
  onAbrir: (kpi: KpiTorre) => void;
}

function KpiCard({ kpi, indice, onAbrir }: KpiCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      id={`kpi-${kpi.id}`}
      onClick={() => onAbrir(kpi)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAbrir(kpi);
        }
      }}
      className="group relative cursor-pointer overflow-hidden rounded-[14px] border border-[#E7E7F0] bg-white px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C7D2FE] hover:shadow-[0_10px_30px_-14px_rgba(79,70,229,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] animate-fade-in"
      style={{ animationDelay: `${indice * 60}ms`, animationFillMode: "backwards" }}
    >
      {/* Brilho sutil no hover */}
      <span className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#4F46E5]/0 blur-2xl transition-colors duration-300 group-hover:bg-[#4F46E5]/10" />

      <div className="flex items-center gap-1">
        <span className="truncate text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
          {kpi.label}
        </span>
        <InfoTooltip
          texto={kpi.tip}
          iconeClassName="h-3 w-3 text-[#A5B4FC]"
          conteudoClassName="bg-[#1E1B4B] text-[#E0E7FF] leading-relaxed"
        />
        <ChevronRight className="ml-auto h-3.5 w-3.5 -translate-x-1 text-[#C7D2FE] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-1.5">
        <span className="whitespace-nowrap text-[20px] font-bold leading-tight tracking-tight text-[#1E1B4B] 2xl:text-[23px]">{kpi.valor}</span>
        {kpi.sub && <span className="whitespace-nowrap text-[11px] font-medium text-[#94A3B8]">{kpi.sub}</span>}
        <DeltaBadge delta={kpi.delta} bom={kpi.bom} />
      </div>

      <p className="mt-0.5 truncate text-[10.5px] text-[#94A3B8]">{kpi.legenda}</p>
    </div>
  );
}

/* ---------- Drawer de detalhamento ---------- */

function KpiDrawer({ kpi, onFechar }: { kpi: KpiTorre | null; onFechar: () => void }) {
  return (
    <Sheet open={kpi !== null} onOpenChange={(aberto) => !aberto && onFechar()}>
      <SheetContent side="right" className="font-poppins w-full gap-0 border-[#E7E7F0] bg-white p-0 sm:max-w-[380px]">
        {kpi && (
          <>
            <SheetHeader className="gap-1 bg-[#1E1B4B] p-5 pr-12 text-white">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#A5B4FC]">Detalhamento</span>
              <SheetTitle className="text-[16px] font-semibold text-white">{kpi.label}</SheetTitle>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-bold">{kpi.valor}</span>
                {kpi.sub && <span className="text-[12px] text-[#A5B4FC]">{kpi.sub}</span>}
                <DeltaBadge delta={kpi.delta} bom={kpi.bom} />
              </div>
              <SheetDescription className="text-[11.5px] text-[#C7D2FE]">{kpi.legenda}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-4 p-5">
              <p className="rounded-xl border border-[#E0E7FF] bg-[#EEF2FF]/60 p-3 text-[12px] leading-relaxed text-[#334155]">
                {kpi.tip}
              </p>
              <ul className="divide-y divide-[#F1F1F6] rounded-xl border border-[#E7E7F0]">
                {kpi.detalhes.map((detalhe) => (
                  <li key={detalhe.label} className="flex items-center justify-between px-3 py-2.5 text-[12px]">
                    <span className="text-[#64748B]">{detalhe.label}</span>
                    <span className="font-semibold text-[#1E1B4B]">{detalhe.valor}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[10.5px] text-[#94A3B8]">Dados simulados para validação interna.</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ---------- Linha de KPIs ---------- */

interface KpiCardsProps {
  kpis: KpiTorre[];
}

export function KpiCards({ kpis }: KpiCardsProps) {
  const [kpiAberto, setKpiAberto] = useState<KpiTorre | null>(null);

  return (
    <>
      <div className="grid shrink-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi, indice) => (
          <KpiCard key={kpi.id} kpi={kpi} indice={indice} onAbrir={setKpiAberto} />
        ))}
      </div>
      <KpiDrawer kpi={kpiAberto} onFechar={() => setKpiAberto(null)} />
    </>
  );
}
