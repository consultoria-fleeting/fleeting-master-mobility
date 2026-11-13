/**
 * MapFilterBar — Barra de filtros e legendas clicáveis do mapa (V1).
 *
 * Exibe busca (placa / condutor / modelo), contador "visíveis / total da frota"
 * e as 5 legendas de status na ordem oficial:
 *   Em Rota · Parado · Em Oficina · Sem posição (há mais de 7 dias) · Sem telemetria.
 *
 * Clicar numa legenda filtra o mapa e a lista para aquele status, mantendo a busca.
 * Todas as entradas são validadas com Zod antes de atualizar o estado.
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
  expandido: boolean;
}

export function MapFilterBar({
  filtros,
  onFiltrosChange,
  onUfChange,
  estados,
  contagemStatus,
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
            placeholder="Buscar por placa, condutor ou modelo…"
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
      </div>

      {/* Legendas clicáveis dos 5 status oficiais (na ordem fechada pelo Produto) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {LISTA_STATUS.map((status) => {
          const ativo = filtros.status === status;
          const config = STATUS_CONFIG[status];
          const ehCadastro = status === "no_telemetry";
          const ehSemPosicao = status === "no_position";
          return (
            <button
              key={status}
              type="button"
              onClick={() => alterarStatus(status)}
              aria-pressed={ativo}
              title={`${config.regra} (Origem: ${config.origemPadrao})`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium transition-all",
                ativo
                  ? "border-transparent text-white shadow-sm"
                  : "border-[#E7E7F0] bg-white text-[#334155] hover:border-[#C7D2FE]"
              )}
              style={ativo ? { background: config.cor } : undefined}
            >
              <span
                className={cn(
                  "h-2 w-2 shrink-0",
                  ehCadastro ? "rotate-45 rounded-[2px]" : "rounded-full",
                  ehSemPosicao && !ativo && "opacity-55"
                )}
                style={{ background: ativo ? "#fff" : config.cor }}
              />
              {config.label}
              <span className={cn("font-semibold tabular-nums", ativo ? "text-white/90" : "text-[#64748B]")}>
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
