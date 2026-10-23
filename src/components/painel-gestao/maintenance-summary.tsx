/**
 * MaintenanceSummary — Card "Manutenção da Frota" (grade 2×2).
 *
 * Tiles: Rev. Vencidas, Rev. a Vencer, Em Oficina, Sinistros.
 * O número é colorido conforme o tom (perigo, alerta, neutro).
 */

import { cn } from "@/lib/utils";
import type { ItemManutencao, TomManutencao } from "@/types/painel-gestao";
import { PainelCard } from "./painel-card";

const COR_TOM: Record<TomManutencao, string> = {
  perigo: "text-[#E11D48]",
  alerta: "text-[#D97706]",
  neutro: "text-[#1E1B4B]",
};

interface MaintenanceSummaryProps {
  itens: ItemManutencao[];
  className?: string;
}

export function MaintenanceSummary({ itens, className }: MaintenanceSummaryProps) {
  return (
    <PainelCard titulo="Manutenção da Frota" className={className} corpoClassName="grid grid-cols-2 gap-2 px-4 pb-3.5">
      {itens.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between rounded-xl border border-[#EEF0F6] bg-[#F8F8FC] px-3 py-2 transition-colors hover:border-[#C7D2FE] hover:bg-[#EEF2FF]/60"
        >
          <span className="text-[11px] font-medium text-[#64748B]">{item.label}</span>
          <span className={cn("text-[18px] font-bold tabular-nums", COR_TOM[item.tom])}>{item.quantidade}</span>
        </div>
      ))}
    </PainelCard>
  );
}
