/**
 * DashboardHeader — Cabeçalho da Torre de Controle.
 *
 * Título + subtítulo com o período, selo "Dados simulados", filtros
 * (mês, ano, grupo, locadora) e ações "+ Cadastrar" / "Abrir O.S.".
 */

"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FiltroSelect } from "./filtro-select";
import { OPCOES_ANO, OPCOES_GRUPO, OPCOES_LOCADORA, OPCOES_MES } from "./mock-data";

export interface FiltrosTorre {
  mes: string;
  ano: string;
  grupo: string;
  locadora: string;
}

interface DashboardHeaderProps {
  filtros: FiltrosTorre;
  onFiltrosChange: (filtros: FiltrosTorre) => void;
}

/** "Mês Atual · 2026" ou "Julho · 2026" */
export function rotuloPeriodo({ mes, ano }: FiltrosTorre): string {
  const opcao = OPCOES_MES.find((o) => o.valor === mes);
  return `${opcao?.label ?? "Mês Atual"} · ${ano}`;
}

export function DashboardHeader({ filtros, onFiltrosChange }: DashboardHeaderProps) {
  function alterar<K extends keyof FiltrosTorre>(campo: K, valor: FiltrosTorre[K]) {
    onFiltrosChange({ ...filtros, [campo]: valor });
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2.5">
      <div className="mr-1.5">
        <h1 className="m-0 text-[19px] font-semibold tracking-[-0.01em] text-[#1E1B4B]">Torre de Controle</h1>
        <p className="text-[11.5px] text-[#94A3B8]">Visão consolidada · {rotuloPeriodo(filtros)}</p>
      </div>
      <span className="rounded-full border border-[#E7E7F0] bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
        Dados simulados
      </span>

      <div className="flex-1" />

      <div className="flex flex-wrap items-center gap-2">
        <FiltroSelect id="filtro-mes" rotulo="Mês" opcoes={OPCOES_MES} valor={filtros.mes} onChange={(v) => alterar("mes", v)} />
        <FiltroSelect id="filtro-ano" rotulo="Ano" opcoes={OPCOES_ANO} valor={filtros.ano} onChange={(v) => alterar("ano", v)} />
        <FiltroSelect id="filtro-grupo" rotulo="Grupo" opcoes={OPCOES_GRUPO} valor={filtros.grupo} onChange={(v) => alterar("grupo", v)} />
        <FiltroSelect id="filtro-locadora" rotulo="Locadora" opcoes={OPCOES_LOCADORA} valor={filtros.locadora} onChange={(v) => alterar("locadora", v)} />

        {/* TODO(backend): ligar às telas de cadastro e de abertura de O.S. do legado */}
        <Button
          id="btn-cadastrar"
          variant="outline"
          className="h-9 rounded-[10px] border-[#C7D2FE] bg-white px-3.5 text-[12.5px] font-semibold text-[#4F46E5] hover:bg-[#EEF2FF] hover:text-[#4338CA]"
        >
          <Plus className="h-3.5 w-3.5" />
          Cadastrar
        </Button>
        <Button
          id="btn-abrir-os"
          className="h-9 rounded-[10px] border border-[#4F46E5] bg-[#4F46E5] px-3.5 text-[12.5px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(79,70,229,0.9)] hover:bg-[#4338CA]"
        >
          Abrir O.S.
        </Button>
      </div>
    </div>
  );
}
