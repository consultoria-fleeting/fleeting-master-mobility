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

import { ChevronDown, Filter } from "lucide-react";
import { z } from "zod";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { RankingFilterOptions } from "@/hooks/use-ranking-filter-options";
import {
  CLASSE_OPCAO_SELECT_FILTRO,
  obterClasseContainerFiltro,
  obterClasseControleFiltro,
  obterClasseIconeFiltro,
  obterClasseSelectFiltro,
  obterClasseSetaSelectFiltro,
  useStickyColado,
} from "@/hooks/use-sticky-colado";
import type { SelectOption } from "@/types/driver-scoring";
import type { RankingFiltersState } from "@/types/ranking-filtros";

/** Schema Zod para o input de texto do nome */
const nomeSchema = z.string().max(100, "Nome muito longo");

/** Schema Zod para os valores dos selects (UUID vindo da API ou vazio). */
const selectSchema = z.string().max(100);

const AVISO_FILIAL_OBRIGATORIA =
  "Selecione uma filial para filtrar por departamento, centro de custo e gestor.";

interface FiltrosHierarquicosProps {
  filtros: RankingFiltersState;
  opcoes: RankingFilterOptions;
  onChange: (filtros: RankingFiltersState) => void;
}

export function FiltrosHierarquicos({ filtros, opcoes, onChange }: FiltrosHierarquicosProps) {
  const { ref, colado } = useStickyColado<HTMLDivElement>();
  const semFilial = filtros.companyId === "";
  const classeInput = obterClasseControleFiltro(colado);
  const classeSelect = obterClasseSelectFiltro(colado);

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
    <div ref={ref} className={obterClasseContainerFiltro(colado)}>
      <Filter className={obterClasseIconeFiltro(colado)} />

      <input
        id="filtro-nome-condutor"
        type="text"
        placeholder="Nome do condutor..."
        value={filtros.driverName}
        onChange={(e) => handleNomeChange(e.target.value)}
        className={`${classeInput} w-40`}
        aria-label="Filtrar por nome do condutor"
        maxLength={100}
      />

      <FiltroSelect
        id="filtro-filial"
        rotulo="Filtrar por filial"
        placeholder="Todas as Filiais"
        valor={filtros.companyId}
        consulta={opcoes.companies}
        classeSelect={classeSelect}
        colado={colado}
        onChange={handleFilialChange}
      />

      <FiltroSelect
        id="filtro-unidade"
        rotulo="Filtrar por unidade"
        placeholder="Todas as Unidades"
        valor={filtros.unitId}
        consulta={opcoes.units}
        classeSelect={classeSelect}
        colado={colado}
        onChange={(valor) => handleSelectChange("unitId", valor)}
      />

      <FiltroSelect
        id="filtro-departamento"
        rotulo="Filtrar por departamento"
        placeholder="Todos os Departamentos"
        valor={filtros.departmentId}
        consulta={opcoes.departments}
        classeSelect={classeSelect}
        colado={colado}
        desabilitado={semFilial}
        motivoDesabilitado={AVISO_FILIAL_OBRIGATORIA}
        onChange={(valor) => handleSelectChange("departmentId", valor)}
      />

      <FiltroSelect
        id="filtro-centro-custo"
        rotulo="Filtrar por centro de custo"
        placeholder="Todos os Centros de Custo"
        valor={filtros.costCenterId}
        consulta={opcoes.costCenters}
        classeSelect={classeSelect}
        colado={colado}
        desabilitado={semFilial}
        motivoDesabilitado={AVISO_FILIAL_OBRIGATORIA}
        onChange={(valor) => handleSelectChange("costCenterId", valor)}
      />

      <FiltroSelect
        id="filtro-gestor"
        rotulo="Filtrar por gestor"
        placeholder="Todos os Gestores"
        valor={filtros.managerId}
        consulta={opcoes.managers}
        classeSelect={classeSelect}
        colado={colado}
        desabilitado={semFilial}
        motivoDesabilitado={AVISO_FILIAL_OBRIGATORIA}
        onChange={(valor) => handleSelectChange("managerId", valor)}
      />
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
  classeSelect: string;
  colado: boolean;
  desabilitado?: boolean;
  motivoDesabilitado?: string;
  onChange: (valor: string) => void;
}

/** Select alimentado por uma consulta da API, com textos de "Carregando...", erro e tooltip quando desabilitado. */
function FiltroSelect({
  id,
  rotulo,
  placeholder,
  valor,
  consulta,
  classeSelect,
  colado,
  desabilitado = false,
  motivoDesabilitado,
  onChange,
}: FiltroSelectProps) {
  const opcoes = consulta.data ?? [];
  const textoPadrao = consulta.error
    ? "Erro ao carregar"
    : consulta.isLoading && !desabilitado
      ? "Carregando..."
      : placeholder;

  const select = (
    <div className="relative inline-flex items-center">
      <select
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        disabled={desabilitado}
        className={classeSelect}
        aria-label={rotulo}
      >
        <option value="" className={CLASSE_OPCAO_SELECT_FILTRO}>
          {textoPadrao}
        </option>
        {opcoes.map((opcao) => (
          <option key={opcao.id} value={opcao.id} className={CLASSE_OPCAO_SELECT_FILTRO}>
            {opcao.name}
          </option>
        ))}
      </select>
      <ChevronDown
        className={obterClasseSetaSelectFiltro(colado, desabilitado)}
        aria-hidden="true"
      />
    </div>
  );

  if (!desabilitado || !motivoDesabilitado) {
    return select;
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={<span tabIndex={0} aria-label={`${rotulo}: ${motivoDesabilitado}`} />}
        className="inline-block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {select}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {motivoDesabilitado}
      </TooltipContent>
    </Tooltip>
  );
}
