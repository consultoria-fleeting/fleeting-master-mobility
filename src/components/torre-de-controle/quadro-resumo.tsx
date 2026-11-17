/**
 * QuadroResumo — Cartão operacional independente com 4 contadores clicáveis.
 *
 * Atende ao Parecer do Protótipo (15/11/2026 — Ajustes #1, #3 e #4):
 * - Renderiza cada quadro (Manutenções, Multas & CNH e Sinistros) como um cartão
 *   independente, sem abas, seguindo o mesmo padrão visual dos cartões do modal
 *   do Relatório Gerencial;
 * - Nenhum rótulo de indicador usa reticências (`...`) em telas a partir de 1280px,
 *   permitindo quebra limpa em até 2 linhas;
 * - Cada contador abre o recorte correspondente no módulo legado do Master Mobility.
 */

"use client";

import { ArrowUpRight } from "lucide-react";
import { useAmbiente } from "@/hooks/use-ambiente";
import { cn } from "@/lib/utils";
import type { ItemQuadroResumo, TomQuadroResumo } from "@/types/torre-de-controle";
import { getLegacyUrl } from "@/utils/env-config";

const COR_TOM: Record<TomQuadroResumo, string> = {
  perigo: "text-[#E11D48]",
  alerta: "text-[#D97706]",
  indigo: "text-[#4F46E5]",
  neutro: "text-[#1E1B4B]",
};

export interface QuadroResumoProps {
  titulo: string;
  corIndicador: string;
  /** Caminho principal do módulo no sistema legado (ex.: "/manutencao/") */
  caminhoModulo: string;
  itens: ItemQuadroResumo[];
  className?: string;
}

export function QuadroResumo({
  titulo,
  corIndicador,
  caminhoModulo,
  itens,
  className,
}: QuadroResumoProps) {
  const ambiente = useAmbiente();
  const urlModulo = getLegacyUrl(caminhoModulo, ambiente);

  return (
    <section
      aria-label={titulo}
      className={cn(
        "flex flex-col rounded-2xl border border-[#E7E7F0] bg-white transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(30,27,75,0.18)]",
        className
      )}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 px-4 pb-2.5 pt-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: corIndicador }}
          />
          <h2 className="text-[13px] font-semibold leading-snug text-[#1E1B4B]">
            {titulo}
          </h2>
        </div>

        <a
          href={urlModulo}
          className="shrink-0 whitespace-nowrap text-[11.5px] font-semibold text-[#4F46E5] transition-colors hover:text-[#4338CA] hover:underline"
        >
          Abrir módulo
        </a>
      </header>

      <div className="flex flex-1 flex-col justify-between divide-y divide-[#F1F1F6] px-4 pb-3">
        {itens.map((item) => {
          const urlRecorte = getLegacyUrl(item.caminhoLegado, ambiente);
          return (
            <a
              key={item.id}
              href={urlRecorte}
              title={`Abrir recorte "${item.label}" em ${titulo}`}
              className="group -mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors first:pt-2 last:pb-1.5 hover:bg-[#F8F8FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-start gap-1 text-[12px] font-medium leading-snug text-[#334155] group-hover:text-[#1E1B4B]">
                  <span className="line-clamp-2">{item.label}</span>
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4F46E5] opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                {item.detalhe && (
                  <span className="block text-[10px] leading-tight text-[#94A3B8]">
                    {item.detalhe}
                  </span>
                )}
              </span>

              <span
                className={cn(
                  "shrink-0 whitespace-nowrap text-[15.5px] font-bold tabular-nums",
                  COR_TOM[item.tom]
                )}
              >
                {item.valor}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
