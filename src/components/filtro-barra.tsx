/**
 * FiltroBarra — Barra de Filtros
 *
 * Componente de filtros reutilizável que inclui:
 * - Input de busca por nome do condutor
 * - Selects para gestor, filial, departamento e unidade
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

import { Filter } from "lucide-react";
import { z } from "zod";
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
    <div className="bg-card rounded-lg border border-border p-4 flex flex-wrap items-center gap-3">
      <Filter className="w-4 h-4 text-muted-foreground shrink-0" />

      <input
        id="filtro-nome-condutor"
        type="text"
        placeholder="Nome do condutor..."
        value={filtros.nome}
        onChange={(e) => handleNomeChange(e.target.value)}
        className="text-xs border border-border rounded-md px-3 py-1.5 bg-background text-foreground w-40 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Filtrar por nome do condutor"
        maxLength={100}
      />

      <select
        id="filtro-gestor"
        value={filtros.gestor}
        onChange={(e) => handleSelectChange("gestor", e.target.value)}
        className="text-xs border border-border rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Filtrar por gestor"
      >
        <option value="">Todos os Gestores</option>
        {opcoes.gestores.map((gestor) => (
          <option key={gestor} value={gestor}>
            {gestor}
          </option>
        ))}
      </select>

      <select
        id="filtro-filial"
        value={filtros.departamento}
        onChange={(e) => handleSelectChange("departamento", e.target.value)}
        className="text-xs border border-border rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Filtrar por filial"
      >
        <option value="">Todas as Filiais</option>
        {opcoes.departamentos.map((depto) => (
          <option key={depto} value={depto}>
            {depto}
          </option>
        ))}
      </select>

      <select
        id="filtro-departamento"
        value={filtros.funcao}
        onChange={(e) => handleSelectChange("funcao", e.target.value)}
        className="text-xs border border-border rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Filtrar por departamento"
      >
        <option value="">Todos os Departamentos</option>
        {opcoes.funcoes.map((funcao) => (
          <option key={funcao} value={funcao}>
            {funcao}
          </option>
        ))}
      </select>

      <select
        id="filtro-unidade"
        value={filtros.negocio}
        onChange={(e) => handleSelectChange("negocio", e.target.value)}
        className="text-xs border border-border rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Filtrar por unidade"
      >
        <option value="">Todas as Unidades</option>
        {opcoes.negocios.map((negocio) => (
          <option key={negocio} value={negocio}>
            {negocio}
          </option>
        ))}
      </select>
    </div>
  );
}
