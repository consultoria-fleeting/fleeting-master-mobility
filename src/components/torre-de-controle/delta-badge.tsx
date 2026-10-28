/**
 * DeltaBadge — Selo de variação (ex.: "▲ 3%") da Torre de Controle.
 *
 * - `bom = true`  → verde (variação favorável)
 * - `bom = false` → vermelho (variação desfavorável)
 * - `bom = null`  → cinza (neutra / sem comparação)
 *
 * Usado nos cards de KPI, no drawer de detalhamento e na composição do TCO.
 * Para custos, use `variacaoDeCusto` (aumento = ruim, queda = bom).
 *
 * @example
 * <DeltaBadge delta="▲ 3%" bom={false} />
 * <DeltaBadge {...variacaoDeCusto(2.9)} />
 */

import { cn } from "@/lib/utils";

interface DeltaBadgeProps {
  delta: string;
  bom: boolean | null;
  className?: string;
}

export function DeltaBadge({ delta, bom, className }: DeltaBadgeProps) {
  return (
    <span
      className={cn(
        "whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
        bom === null && "bg-[#F1F5F9] text-[#64748B]",
        bom === true && "bg-[#059669]/10 text-[#059669]",
        bom === false && "bg-[#E11D48]/10 text-[#E11D48]",
        className
      )}
    >
      {delta}
    </span>
  );
}

const formatoPercentual = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/**
 * Converte a variação percentual de um custo nas props do `DeltaBadge`.
 * Custo subindo é ruim (vermelho); custo caindo é bom (verde).
 */
export function variacaoDeCusto(percentual: number | null): DeltaBadgeProps {
  if (percentual === null || Math.abs(percentual) < 0.05) return { delta: "—", bom: null };
  const seta = percentual > 0 ? "▲" : "▼";
  return { delta: `${seta} ${formatoPercentual.format(Math.abs(percentual))}%`, bom: percentual < 0 };
}

