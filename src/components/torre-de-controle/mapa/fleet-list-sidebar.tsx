/**
 * FleetListSidebar — Lista lateral sincronizada com os filtros do mapa (V1).
 *
 * Alimentada pela mesma coleção filtrada por escopo, status, UF e busca
 * (placa, condutor ou modelo), funcionando tanto no modo Macro quanto no Micro.
 */

"use client";

import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VeiculoFrota } from "@/types/frota-mapa";
import { STATUS_CONFIG } from "./config";

interface FleetListSidebarProps {
  veiculos: VeiculoFrota[];
  selecionadoId: string | null;
  onSelecionar: (veiculo: VeiculoFrota) => void;
  compacta?: boolean;
}

/** Ordena: crítico → atenção → demais, e depois por placa */
function ordenarPorPrioridade(a: VeiculoFrota, b: VeiculoFrota): number {
  const peso = (v: VeiculoFrota) => (v.alerta?.nivel === "critico" ? 0 : v.alerta ? 1 : 2);
  return peso(a) - peso(b) || a.plate.localeCompare(b.plate);
}

export function FleetListSidebar({
  veiculos,
  selecionadoId,
  onSelecionar,
  compacta = false,
}: FleetListSidebarProps) {
  const ordenados = [...veiculos].sort(ordenarPorPrioridade);

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-l border-[#E7E7F0] bg-white",
        compacta ? "w-60" : "w-72"
      )}
    >
      <div className="flex items-center justify-between border-b border-[#E7E7F0] px-3 py-2.5">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
          Veículos filtrados
        </span>
        <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10.5px] font-semibold tabular-nums text-[#4F46E5]">
          {ordenados.length}
        </span>
      </div>

      <ul className="rolagem-suave flex-1 overflow-y-auto">
        {ordenados.length === 0 && (
          <li className="px-4 py-8 text-center text-[11.5px] leading-relaxed text-[#94A3B8]">
            Nenhum veículo corresponde aos filtros selecionados.
          </li>
        )}

        {ordenados.map((veiculo) => {
          const ehCadastro = veiculo.origemPosicao === "cadastro";
          const ehSemPosicao = veiculo.status === "no_position";
          return (
            <li key={veiculo.id}>
              <button
                type="button"
                onClick={() => onSelecionar(veiculo)}
                className={cn(
                  "flex w-full items-start gap-2.5 border-b border-[#F1F1F6] px-3 py-2.5 text-left transition-colors hover:bg-[#F8F8FC]",
                  selecionadoId === veiculo.id && "bg-[#EEF2FF] hover:bg-[#EEF2FF]"
                )}
              >
                <span
                  className={cn(
                    "mt-1 h-2.5 w-2.5 shrink-0 ring-2 ring-white",
                    ehCadastro ? "rotate-45 rounded-[2px]" : "rounded-full",
                    ehSemPosicao && "opacity-55"
                  )}
                  style={{ background: STATUS_CONFIG[veiculo.status].cor }}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[12px] font-bold tracking-wider text-[#1E1B4B]">
                      {veiculo.plate}
                    </span>
                    <span className="truncate text-[10px] font-medium text-[#64748B]">
                      {veiculo.status === "in_transit"
                        ? `${veiculo.speed} km/h`
                        : STATUS_CONFIG[veiculo.status].labelCurto}
                    </span>
                  </span>
                  <span className="block truncate text-[11px] text-[#334155]">
                    {veiculo.model} · {veiculo.driver}
                  </span>
                  <span className="block truncate text-[10px] text-[#94A3B8]">
                    {veiculo.origemPosicao === "telemetria"
                      ? `Telemetria · ${veiculo.dataHoraUltimaPosicao ?? ""}`
                      : `Cadastro · ${veiculo.cidadeAlocacao}`}
                  </span>
                  {veiculo.alerta && (
                    <span
                      className={cn(
                        "mt-1 inline-flex items-center gap-1 text-[10px] font-semibold",
                        veiculo.alerta.nivel === "critico" ? "text-[#E11D48]" : "text-[#B45309]"
                      )}
                    >
                      <TriangleAlert className="h-3 w-3 shrink-0" />
                      <span className="truncate">{veiculo.alerta.descricao}</span>
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
