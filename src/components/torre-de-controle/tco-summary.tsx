/**
 * TcoSummary — Card escuro "Resumo do TCO" (Total Cost of Ownership).
 *
 * Valor total, média por veículo, barra empilhada com a proporção de cada
 * custo e o breakdown (Combustível, Manutenção, Aluguel, Multas, Sinistros).
 */

import type { ItemTco } from "@/types/torre-de-controle";
import { cn } from "@/lib/utils";

interface TcoSummaryProps {
  total: string;
  mediaPorVeiculo: string;
  itens: ItemTco[];
  className?: string;
}

/** 52100 → "R$ 52,1 mil" */
function formatarMil(valor: number): string {
  return `R$ ${(valor / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mil`;
}

export function TcoSummary({ total, mediaPorVeiculo, itens, className }: TcoSummaryProps) {
  const soma = itens.reduce((acc, item) => acc + item.valor, 0);

  return (
    <section
      className={cn(
        "@container relative flex min-h-0 flex-col justify-center overflow-hidden rounded-2xl border border-[#312E81] bg-[#1E1B4B] p-4 text-white",
        className
      )}
    >
      {/* Brilhos decorativos */}
      <span className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#4F46E5]/40 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-[#818CF8]/20 blur-3xl" />

      <div className="relative">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#A5B4FC]">Resumo do TCO</p>
        <p className="mt-0.5 text-[10.5px] text-[#C7D2FE]/80">Total Cost of Ownership · Mês Atual</p>

        <p className="mt-3 whitespace-nowrap text-[22px] font-bold leading-none tracking-tight @[210px]:text-[26px]">{total}</p>
        <p className="mt-1.5 text-[11px] text-[#C7D2FE]">
          Média por veículo <span className="font-semibold text-[#A5B4FC]">{mediaPorVeiculo}</span>
        </p>

        {/* Barra empilhada com a proporção dos custos */}
        <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
          {itens.map((item) => (
            <span
              key={item.label}
              className="h-full transition-[width] duration-700"
              style={{ width: `${(item.valor / soma) * 100}%`, background: item.cor }}
            />
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {itens.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-[11px] @[210px]:text-[11.5px]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: item.cor }} />
              <span className="min-w-0 truncate text-[#C7D2FE]">{item.label}</span>
              <span className="ml-auto whitespace-nowrap font-semibold tabular-nums">{formatarMil(item.valor)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
