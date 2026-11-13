/**
 * DashboardHeader — Cabeçalho da Torre de Controle V1.
 *
 * Implementa as decisões fechadas de Produto (#1, #2, #3 e #9):
 * - Período sempre em mês fechado (sem intervalo personalizado);
 * - Filtro de Agrupamento dinâmico que assume o rótulo do nível mais alto visível
 *   ao perfil do usuário (`Filiais`, `Unidades de Negócio`, `Regionais` ou `Departamentos`),
 *   com opção padrão `"Todos (do meu escopo)"`;
 * - Filtro de Locadora inalterado;
 * - Remoção de "+ Cadastrar" e "Abrir O.S." e inclusão do botão "Relatório Gerencial".
 */

"use client";

import { ChevronDown, FileText, Shield } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import type { FiltrosTorre, NivelAgrupamento } from "@/types/torre-de-controle";
import { FiltroSelect } from "./filtro-select";
import {
  OPCOES_ANO,
  OPCOES_LOCADORA,
  PERFIS_AGRUPAMENTO_DEMO,
  ULTIMO_MES_FECHADO_2026,
  obterConfigPerfilAgrupamento,
  obterOpcoesAgrupamento,
  obterOpcoesMesFechado,
} from "./mock-data";

export type { FiltrosTorre };

const esquemaPerfilDemo = z.enum([
  "filiais",
  "regionais",
  "unidades",
  "departamentos_restrito",
]);

interface DashboardHeaderProps {
  filtros: FiltrosTorre;
  periodoRotulo: string;
  onFiltrosChange: (filtros: FiltrosTorre) => void;
  onAbrirRelatorio: () => void;
}

export function DashboardHeader({
  filtros,
  periodoRotulo,
  onFiltrosChange,
  onAbrirRelatorio,
}: DashboardHeaderProps) {
  const configPerfil = obterConfigPerfilAgrupamento(filtros.perfilDemo);
  const opcoesMes = obterOpcoesMesFechado(filtros.ano);
  const opcoesAgrupamento = obterOpcoesAgrupamento(filtros.perfilDemo);

  function alterarAno(novoAno: string) {
    const mesAjustado =
      novoAno === "2026" && Number(filtros.mes) > ULTIMO_MES_FECHADO_2026
        ? String(ULTIMO_MES_FECHADO_2026)
        : filtros.mes;
    onFiltrosChange({ ...filtros, ano: novoAno, mes: mesAjustado });
  }

  function alterarPerfilDemo(valorBruto: string) {
    const validado = esquemaPerfilDemo.safeParse(valorBruto);
    if (!validado.success) return;
    const novoPerfil: NivelAgrupamento = validado.data;
    onFiltrosChange({
      ...filtros,
      perfilDemo: novoPerfil,
      agrupamento: "todos",
    });
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 xl:flex-nowrap">
      <div className="flex min-w-0 items-center gap-2">
        <div className="min-w-0 shrink-0">
          <h1 className="m-0 whitespace-nowrap text-[18.5px] font-semibold leading-tight tracking-[-0.01em] text-[#1E1B4B]">
            Torre de Controle
          </h1>
          <p className="whitespace-nowrap text-[11px] leading-tight text-[#94A3B8]">
            Visão consolidada ·{" "}
            <span className="font-medium text-[#64748B]">{periodoRotulo}</span>
          </p>
        </div>

        <span className="hidden shrink-0 rounded-full border border-[#E7E7F0] bg-white px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.06em] text-[#94A3B8] 2xl:inline-flex">
          Dados simulados
        </span>

        {/*
         * Simulador discreto de perfil de permissão para validação da regra #2 com PO/CEO.
         * TODO(security): remover na integração real — o nível hierárquico e os itens
         * permitidos devem vir exclusivamente do backend a partir do JWT do usuário.
         */}
        <label
          title={configPerfil.descricaoEscopo}
          className="relative inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-dashed border-[#C7D2FE] bg-[#EEF2FF]/75 pl-2 pr-5.5 text-[10px] text-[#4F46E5] transition-colors hover:border-[#818CF8]"
        >
          <Shield className="h-3 w-3 shrink-0 text-[#4F46E5]" />
          <span className="pointer-events-none select-none font-medium text-[#6366F1]">
            Perfil:
          </span>
          <select
            id="simulador-perfil-agrupamento"
            value={filtros.perfilDemo}
            onChange={(e) => alterarPerfilDemo(e.target.value)}
            aria-label="Simular nível de permissão do usuário"
            className="max-w-[142px] cursor-pointer appearance-none truncate bg-transparent font-semibold text-[#1E1B4B] focus:outline-none"
          >
            {PERFIS_AGRUPAMENTO_DEMO.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.rotuloDemo}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-[#6366F1]" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 xl:flex-nowrap">
        <FiltroSelect
          id="filtro-ano"
          rotulo="Ano de referência"
          opcoes={OPCOES_ANO}
          valor={filtros.ano}
          onChange={alterarAno}
        />
        <FiltroSelect
          id="filtro-mes"
          rotulo="Mês fechado"
          selectClassName="max-w-[106px]"
          opcoes={opcoesMes}
          valor={filtros.mes}
          onChange={(v) => onFiltrosChange({ ...filtros, mes: v })}
        />
        <FiltroSelect
          id="filtro-agrupamento"
          rotulo={`Agrupamento por ${configPerfil.rotuloFiltro} (escopo do perfil)`}
          selectClassName="max-w-[164px]"
          opcoes={opcoesAgrupamento}
          valor={filtros.agrupamento}
          onChange={(v) => onFiltrosChange({ ...filtros, agrupamento: v })}
        />
        <FiltroSelect
          id="filtro-locadora"
          rotulo="Locadora"
          selectClassName="max-w-[146px]"
          opcoes={OPCOES_LOCADORA}
          valor={filtros.locadora}
          onChange={(v) => onFiltrosChange({ ...filtros, locadora: v })}
        />

        <Button
          id="btn-relatorio-gerencial"
          type="button"
          onClick={onAbrirRelatorio}
          className="h-8.5 shrink-0 gap-1.5 whitespace-nowrap rounded-[10px] border border-[#4F46E5] bg-[#4F46E5] px-3 text-[12px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(79,70,229,0.9)] hover:bg-[#4338CA]"
        >
          <FileText className="h-3.5 w-3.5" />
          Relatório Gerencial
        </Button>
      </div>
    </div>
  );
}
