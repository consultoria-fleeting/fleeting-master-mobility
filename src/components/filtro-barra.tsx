/**
 * FiltroBarra — Barra de Filtros
 *
 * Componente de filtros reutilizável que inclui:
 * - Input de busca por nome do condutor
 * - Selects para gestor, centro de custo, filial, departamento e unidade
 *
 * Validação de inputs com Zod para sanitização.
 *
 * @example
 * <FiltroBarra
 *   filtros={filtros}
 *   opcoes={opcoesFiltro}
 *   onFiltroChange={handleFiltroChange}
 * />
 */

"use client";

import { ChevronDown, Filter } from "lucide-react";
import { z } from "zod";
import {
  CLASSE_OPCAO_SELECT_FILTRO,
  obterClasseContainerFiltro,
  obterClasseControleFiltro,
  obterClasseIconeFiltro,
  obterClasseSelectFiltro,
  obterClasseSetaSelectFiltro,
  useStickyColado,
} from "@/hooks/use-sticky-colado";
import type { FiltrosState, OpcoesFiltro } from "@/types/condutor";

interface FiltroBarraProps {
  filtros: FiltrosState;
  opcoes: OpcoesFiltro;
  onFiltroChange: <K extends keyof FiltrosState>(
    campo: K,
    valor: FiltrosState[K]
  ) => void;
}

/** Schema Zod para validar o input de texto do filtro de nome */
const nomeSchema = z
  .string()
  .max(100, "Nome muito longo")
  .transform((val) => val.trim());

/** Schema Zod para validar valores de select */
const selectSchema = z.string().max(100);

export function FiltroBarra({
  filtros,
  opcoes,
  onFiltroChange,
}: FiltroBarraProps) {
  const { ref, colado } = useStickyColado<HTMLDivElement>();
  const classeInput = obterClasseControleFiltro(colado);
  const classeSelect = obterClasseSelectFiltro(colado);
  const classeSeta = obterClasseSetaSelectFiltro(colado);

  /**
   * Valida e aplica o filtro de nome usando Zod.
   * Se a validação falhar, o valor não é aplicado.
   */
  function handleNomeChange(valor: string) {
    const resultado = nomeSchema.safeParse(valor);
    if (resultado.success) {
      onFiltroChange("nome", resultado.data);
    }
  }

  /**
   * Valida e aplica o filtro de select usando Zod.
   */
  function handleSelectChange(campo: keyof FiltrosState, valor: string) {
    const resultado = selectSchema.safeParse(valor);
    if (resultado.success) {
      onFiltroChange(campo, resultado.data);
    }
  }

  return (
    <div ref={ref} className={obterClasseContainerFiltro(colado)}>
      <Filter className={obterClasseIconeFiltro(colado)} />

      <input
        id="filtro-nome-condutor"
        type="text"
        placeholder="Nome do condutor..."
        value={filtros.nome}
        onChange={(e) => handleNomeChange(e.target.value)}
        className={`${classeInput} w-40`}
        aria-label="Filtrar por nome do condutor"
        maxLength={100}
      />

      <div className="relative inline-flex items-center">
        <select
          id="filtro-gestor"
          value={filtros.gestor}
          onChange={(e) => handleSelectChange("gestor", e.target.value)}
          className={classeSelect}
          aria-label="Filtrar por gestor"
        >
          <option value="" className={CLASSE_OPCAO_SELECT_FILTRO}>
            Todos os Gestores
          </option>
          {opcoes.gestores.map((gestor) => (
            <option key={gestor} value={gestor} className={CLASSE_OPCAO_SELECT_FILTRO}>
              {gestor}
            </option>
          ))}
        </select>
        <ChevronDown className={classeSeta} aria-hidden="true" />
      </div>

      <div className="relative inline-flex items-center">
        <select
          id="filtro-centro-custo"
          value={filtros.centroCusto}
          onChange={(e) => handleSelectChange("centroCusto", e.target.value)}
          className={classeSelect}
          aria-label="Filtrar por centro de custo"
        >
          <option value="" className={CLASSE_OPCAO_SELECT_FILTRO}>
            Todos os Centros de Custo
          </option>
          {opcoes.centrosCusto.map((cc) => (
            <option key={cc} value={cc} className={CLASSE_OPCAO_SELECT_FILTRO}>
              {cc}
            </option>
          ))}
        </select>
        <ChevronDown className={classeSeta} aria-hidden="true" />
      </div>

      <div className="relative inline-flex items-center">
        <select
          id="filtro-filial"
          value={filtros.departamento}
          onChange={(e) => handleSelectChange("departamento", e.target.value)}
          className={classeSelect}
          aria-label="Filtrar por filial"
        >
          <option value="" className={CLASSE_OPCAO_SELECT_FILTRO}>
            Todas as Filiais
          </option>
          {opcoes.departamentos.map((depto) => (
            <option key={depto} value={depto} className={CLASSE_OPCAO_SELECT_FILTRO}>
              {depto}
            </option>
          ))}
        </select>
        <ChevronDown className={classeSeta} aria-hidden="true" />
      </div>

      <div className="relative inline-flex items-center">
        <select
          id="filtro-departamento"
          value={filtros.funcao}
          onChange={(e) => handleSelectChange("funcao", e.target.value)}
          className={classeSelect}
          aria-label="Filtrar por departamento"
        >
          <option value="" className={CLASSE_OPCAO_SELECT_FILTRO}>
            Todos os Departamentos
          </option>
          {opcoes.funcoes.map((funcao) => (
            <option key={funcao} value={funcao} className={CLASSE_OPCAO_SELECT_FILTRO}>
              {funcao}
            </option>
          ))}
        </select>
        <ChevronDown className={classeSeta} aria-hidden="true" />
      </div>

      <div className="relative inline-flex items-center">
        <select
          id="filtro-unidade"
          value={filtros.negocio}
          onChange={(e) => handleSelectChange("negocio", e.target.value)}
          className={classeSelect}
          aria-label="Filtrar por unidade"
        >
          <option value="" className={CLASSE_OPCAO_SELECT_FILTRO}>
            Todas as Unidades
          </option>
          {opcoes.negocios.map((negocio) => (
            <option key={negocio} value={negocio} className={CLASSE_OPCAO_SELECT_FILTRO}>
              {negocio}
            </option>
          ))}
        </select>
        <ChevronDown className={classeSeta} aria-hidden="true" />
      </div>
    </div>
  );
}
