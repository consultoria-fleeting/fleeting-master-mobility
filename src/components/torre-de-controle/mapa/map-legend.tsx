/**
 * MapLegend — Legenda flutuante do mapa (Macro por região / Micro interativa por status).
 *
 * No modo Micro, clicar em qualquer legenda de status filtra o mapa e a lista
 * para aquele status (mantendo a busca por placa, condutor ou modelo), com
 * validação via Zod antes de atualizar o filtro.
 */

"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import type { RegiaoBrasil, StatusVeiculo } from "@/types/frota-mapa";
import { LISTA_STATUS, ROTULO_REGIAO, STATUS_CONFIG } from "./config";

const esquemaStatusLegenda = z.enum(LISTA_STATUS as [StatusVeiculo, ...StatusVeiculo[]]);

interface ItemRegiao {
  regiao: RegiaoBrasil;
  total: number;
  cor: string;
}

interface MapLegendProps {
  modoMacro: boolean;
  regioes: ItemRegiao[];
  contagemStatus: Record<StatusVeiculo, number>;
  statusAtivo: StatusVeiculo | "todos";
  onAlternarStatus: (status: StatusVeiculo) => void;
}

export function MapLegend({
  modoMacro,
  regioes,
  contagemStatus,
  statusAtivo,
  onAlternarStatus,
}: MapLegendProps) {
  function clicarStatus(status: StatusVeiculo) {
    const validado = esquemaStatusLegenda.safeParse(status);
    if (validado.success) onAlternarStatus(validado.data);
  }

  return (
    <div
      className={cn(
        "absolute bottom-2 left-2 z-[500] flex max-w-[calc(100%-1rem)] flex-wrap items-center gap-x-2.5 gap-y-1 rounded-[9px] bg-white/92 px-2.5 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.04em] text-[#64748B] shadow-sm backdrop-blur",
        modoMacro ? "pointer-events-none" : "pointer-events-auto"
      )}
    >
      {modoMacro
        ? regioes.map((item) => (
            <span key={item.regiao} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: item.cor }} />
              {ROTULO_REGIAO[item.regiao]} · {item.total}
            </span>
          ))
        : LISTA_STATUS.map((status) => {
            const ativo = statusAtivo === status;
            const ehCadastro = status === "no_telemetry";
            const ehSemPosicao = status === "no_position";
            return (
              <button
                key={status}
                type="button"
                aria-pressed={ativo}
                onClick={(e) => {
                  e.stopPropagation();
                  clicarStatus(status);
                }}
                title={`${STATUS_CONFIG[status].label} — ${STATUS_CONFIG[status].regra}`}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-1.5 py-0.5 transition-all",
                  ativo
                    ? "bg-[#1E1B4B] text-white shadow-xs"
                    : "hover:bg-[#EEF2FF] hover:text-[#1E1B4B]"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 shrink-0",
                    ehCadastro ? "rotate-45 rounded-[1.5px]" : "rounded-full",
                    ehSemPosicao && !ativo && "opacity-55"
                  )}
                  style={{ background: STATUS_CONFIG[status].cor }}
                />
                <span>{STATUS_CONFIG[status].labelCurto}</span>
                <span className={cn("tabular-nums", ativo ? "text-[#C7D2FE]" : "text-[#94A3B8]")}>
                  {contagemStatus[status]}
                </span>
              </button>
            );
          })}
    </div>
  );
}
