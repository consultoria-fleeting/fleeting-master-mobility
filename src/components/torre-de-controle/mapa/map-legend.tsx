/**
 * MapLegend — Legenda flutuante do mapa.
 *
 * Modo Macro: regiões com a cor do coroplético e a contagem de veículos
 * (igual ao rodapé do protótipo: "■ SUDESTE · 26 ■ SUL · 9 …").
 * Modo Micro: cores de status dos pinos.
 */

import type { RegiaoBrasil, StatusVeiculo } from "@/types/frota-mapa";
import { LISTA_STATUS, ROTULO_REGIAO, STATUS_CONFIG } from "./config";

interface ItemRegiao {
  regiao: RegiaoBrasil;
  total: number;
  cor: string;
}

interface MapLegendProps {
  modoMacro: boolean;
  regioes: ItemRegiao[];
  contagemStatus: Record<StatusVeiculo, number>;
}

export function MapLegend({ modoMacro, regioes, contagemStatus }: MapLegendProps) {
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 z-[500] flex max-w-[calc(100%-1rem)] flex-wrap items-center gap-x-3 gap-y-1 rounded-[9px] bg-white/90 px-2.5 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.05em] text-[#64748B] shadow-sm backdrop-blur">
      {modoMacro
        ? regioes.map((item) => (
            <span key={item.regiao} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: item.cor }} />
              {ROTULO_REGIAO[item.regiao]} · {item.total}
            </span>
          ))
        : LISTA_STATUS.map((status) => (
            <span key={status} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_CONFIG[status].cor }} />
              {STATUS_CONFIG[status].label} · {contagemStatus[status]}
            </span>
          ))}
    </div>
  );
}
