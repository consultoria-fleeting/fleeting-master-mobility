/**
 * MapFilterBar — Barra de filtros do mapa.
 *
 * Busca (placa / condutor / modelo), select de UF, chips de status e de
 * categoria e contador "N / total". No modo compacto (card da Torre de Controle) mostra
 * apenas busca + chips de status; no modo expandido mostra tudo.
 *
 * Entradas validadas com Zod antes de atualizar o estado.
 */

"use client";

import { Search, X } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import type {
  CategoriaVeiculo,
  ContagemStatus,
  EstadoBrasil,
  FiltrosMapa,
  StatusVeiculo,
} from "@/types/frota-mapa";
import { CATEGORIA_CONFIG, LISTA_CATEGORIAS, LISTA_STATUS, STATUS_CONFIG } from "./config";

/** Busca: até 40 caracteres, apenas letras, números, espaço, ponto e hífen */
const esquemaBusca = z
  .string()
  .max(40)
  .regex(/^[\p{L}\p{N}\s.\-]*$/u);

const esquemaStatus = z.enum(["todos", ...LISTA_STATUS] as [string, ...string[]]);
const esquemaCategoria = z.enum(["todas", ...LISTA_CATEGORIAS] as [string, ...string[]]);

interface MapFilterBarProps {
  filtros: FiltrosMapa;
  onFiltrosChange: (filtros: FiltrosMapa) => void;
  onUfChange: (uf: string) => void;
  estados: EstadoBrasil[];
  contagemStatus: ContagemStatus;
  visiveis: number;
  total: number;
  expandido: boolean;
}

export function MapFilterBar({
  filtros,
  onFiltrosChange,
  onUfChange,
  estados,
  contagemStatus,
  visiveis,
  total,
  expandido,
}: MapFilterBarProps) {
  function alterarBusca(valor: string) {
    if (!esquemaBusca.safeParse(valor).success) return;
    onFiltrosChange({ ...filtros, busca: valor });
  }

  function alterarStatus(status: StatusVeiculo | "todos") {
    if (!esquemaStatus.safeParse(status).success) return;
    onFiltrosChange({ ...filtros, status: filtros.status === status ? "todos" : status });
  }

  function alterarCategoria(categoria: CategoriaVeiculo | "todas") {
    if (!esquemaCategoria.safeParse(categoria).success) return;
    onFiltrosChange({ ...filtros, categoria: filtros.categoria === categoria ? "todas" : categoria });
  }

  const estadosComVeiculos = estados.filter((e) => e.vehicleCount > 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* Busca */}
        <label className="relative flex min-w-0 flex-1 items-center">
          <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#94A3B8]" />
          <input
            id="mapa-busca"
            type="search"
            value={filtros.busca}
            onChange={(e) => alterarBusca(e.target.value)}
            placeholder="Placa, condutor ou modelo…"
            aria-label="Buscar veículo por placa, condutor ou modelo"
            maxLength={40}
            className="h-8 w-full rounded-[9px] border border-[#E7E7F0] bg-[#F8F8FC] pl-8 pr-7 text-[11.5px] text-[#1E1B4B] placeholder:text-[#94A3B8] focus:border-[#C7D2FE] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
          />
          {filtros.busca && (
            <button
              type="button"
              onClick={() => alterarBusca("")}
              className="absolute right-2 text-[#94A3B8] hover:text-[#4F46E5]"
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>

        {expandido && (
          <select
            id="mapa-filtro-uf"
            value={filtros.uf}
            onChange={(e) => onUfChange(e.target.value)}
            aria-label="Filtrar por estado"
            className="h-8 rounded-[9px] border border-[#E7E7F0] bg-white px-2.5 text-[11.5px] font-medium text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
          >
            <option value="">Todas as UFs</option>
            {estadosComVeiculos.map((e) => (
              <option key={e.uf} value={e.uf}>
                {e.uf} · {e.name} ({e.vehicleCount})
              </option>
            ))}
          </select>
        )}

        <span
          className="shrink-0 rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[10.5px] font-semibold tabular-nums text-[#4F46E5]"
          title="Veículos visíveis / total da frota"
        >
          {visiveis} / {total}
        </span>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {LISTA_STATUS.map((status) => {
          const ativo = filtros.status === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => alterarStatus(status)}
              aria-pressed={ativo}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium transition-all",
                ativo
                  ? "border-transparent text-white shadow-sm"
                  : "border-[#E7E7F0] bg-white text-[#334155] hover:border-[#C7D2FE]"
              )}
              style={ativo ? { background: STATUS_CONFIG[status].cor } : undefined}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: ativo ? "#fff" : STATUS_CONFIG[status].cor }}
              />
              {STATUS_CONFIG[status].label}
              <span className={cn("tabular-nums", ativo ? "text-white/80" : "text-[#94A3B8]")}>
                {contagemStatus[status]}
              </span>
            </button>
          );
        })}

        {expandido && (
          <>
            <span className="mx-1 h-4 w-px bg-[#E7E7F0]" />
            {LISTA_CATEGORIAS.map((categoria) => {
              const ativo = filtros.categoria === categoria;
              return (
                <button
                  key={categoria}
                  type="button"
                  onClick={() => alterarCategoria(categoria)}
                  aria-pressed={ativo}
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10.5px] font-medium transition-all",
                    ativo
                      ? "border-[#4F46E5] bg-[#4F46E5] text-white"
                      : "border-[#E7E7F0] bg-white text-[#334155] hover:border-[#C7D2FE]"
                  )}
                >
                  {CATEGORIA_CONFIG[categoria].label}
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
