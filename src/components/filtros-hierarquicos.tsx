/**
 * FiltrosHierarquicos — Barra de filtros conectada à API (seções 5.1 a 5.5 da spec).
 *
 * - Busca por nome do condutor (o debounce é aplicado por quem usa o valor, ex.: página).
 * - Combos em cascata: Filial -> Unidade, Departamento, Centro de Custo e Gestor.
 *   Escolher uma Filial zera os filtros dependentes; Departamento, Centro de Custo
 *   e Gestor só habilitam depois que uma Filial é escolhida.
 *
 * Inputs validados com Zod antes de atualizar o estado.
 *
 * @example
 * const options = useRankingFilterOptions(filtros.companyId);
 * <FiltrosHierarquicos filtros={filtros} opcoes={options} onChange={setFiltros} />
 */

"use client";

import { Filter } from "lucide-react";
import { z } from "zod";
import type { RankingFilterOptions } from "@/hooks/use-ranking-filter-options";
import type { SelectOption } from "@/types/driver-scoring";
import type { RankingFiltersState } from "@/types/ranking-filtros";

/** Schema Zod para o input de texto do nome */
const nomeSchema = z.string().max(100, "Nome muito longo");

/** Schema Zod para os valores dos selects (UUID vindo da API ou vazio). */
const selectSchema = z.string().max(100);

const ESTILO_CONTROLE =
  "text-xs border border-border rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed";

interface FiltrosHierarquicosProps {
  filtros: RankingFiltersState;
  opcoes: RankingFilterOptions;
  onChange: (filtros: RankingFiltersState) => void;
}

export function FiltrosHierarquicos({ filtros, opcoes, onChange }: FiltrosHierarquicosProps) {
  const semFilial = filtros.companyId === "";

  function handleNomeChange(valor: string) {
    const resultado = nomeSchema.safeParse(valor);
    if (resultado.success) onChange({ ...filtros, driverName: resultado.data });
  }

  /** Trocar a filial invalida todos os filtros que dependem dela. */
  function handleFilialChange(valor: string) {
    const resultado = selectSchema.safeParse(valor);
    if (!resultado.success) return;

    onChange({
      ...filtros,
      companyId: resultado.data,
      unitId: "",
      departmentId: "",
      costCenterId: "",
      managerId: "",
    });
  }

  function handleSelectChange(campo: "unitId" | "departmentId" | "costCenterId" | "managerId", valor: string) {
    const resultado = selectSchema.safeParse(valor);
    if (resultado.success) onChange({ ...filtros, [campo]: resultado.data });
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4 flex flex-wrap items-center gap-3">
      <Filter className="w-4 h-4 text-muted-foreground shrink-0" />

      <input
        id="filtro-nome-condutor"
        type="text"
        placeholder="Nome do condutor..."
        value={filtros.driverName}
        onChange={(e) => handleNomeChange(e.target.value)}
        className={`${ESTILO_CONTROLE} w-40`}
        aria-label="Filtrar por nome do condutor"
        maxLength={100}
      />

      <FiltroSelect
        id="filtro-filial"
        rotulo="Filtrar por filial"
        placeholder="Todas as Filiais"
        valor={filtros.companyId}
        consulta={opcoes.companies}
        onChange={handleFilialChange}
      />

      <FiltroSelect
        id="filtro-unidade"
        rotulo="Filtrar por unidade"
        placeholder="Todas as Unidades"
        valor={filtros.unitId}
        consulta={opcoes.units}
        onChange={(valor) => handleSelectChange("unitId", valor)}
      />

      <FiltroSelect
        id="filtro-departamento"
        rotulo="Filtrar por departamento"
        placeholder="Todos os Departamentos"
        valor={filtros.departmentId}
        consulta={opcoes.departments}
        desabilitado={semFilial}
        onChange={(valor) => handleSelectChange("departmentId", valor)}
      />

      <FiltroSelect
        id="filtro-centro-custo"
        rotulo="Filtrar por centro de custo"
        placeholder="Todos os Centros de Custo"
        valor={filtros.costCenterId}
        consulta={opcoes.costCenters}
        desabilitado={semFilial}
        onChange={(valor) => handleSelectChange("costCenterId", valor)}
      />

      <FiltroSelect
        id="filtro-gestor"
        rotulo="Filtrar por gestor"
        placeholder="Todos os Gestores"
        valor={filtros.managerId}
        consulta={opcoes.managers}
        desabilitado={semFilial}
        onChange={(valor) => handleSelectChange("managerId", valor)}
      />

      {semFilial && (
        <p className="text-[11px] text-muted-foreground">
          Selecione uma filial para filtrar por departamento, centro de custo e gestor.
        </p>
      )}
    </div>
  );
}

/* ==================== SELECT INTERNO ==================== */

interface FiltroSelectProps {
  id: string;
  rotulo: string;
  placeholder: string;
  valor: string;
  consulta: { data: SelectOption[] | undefined; isLoading: boolean; error: unknown };
  desabilitado?: boolean;
  onChange: (valor: string) => void;
}

/** Select alimentado por uma consulta da API, com textos de "Carregando..." e erro. */
function FiltroSelect({
  id,
  rotulo,
  placeholder,
  valor,
  consulta,
  desabilitado = false,
  onChange,
}: FiltroSelectProps) {
  const opcoes = consulta.data ?? [];
  const textoPadrao = consulta.error
    ? "Erro ao carregar"
    : consulta.isLoading && !desabilitado
      ? "Carregando..."
      : placeholder;

  return (
    <select
      id={id}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      disabled={desabilitado}
      className={ESTILO_CONTROLE}
      aria-label={rotulo}
    >
      <option value="">{textoPadrao}</option>
      {opcoes.map((opcao) => (
        <option key={opcao.id} value={opcao.id}>
          {opcao.name}
        </option>
      ))}
    </select>
  );
}
