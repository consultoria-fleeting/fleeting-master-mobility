/**
 * Performance dos Condutores — Página
 *
 * Integrada ao backend `api-driver-scoring` (seção 4.11 da spec):
 * - Seletor de período (mês/ano) e filtros hierárquicos em cascata
 * - Tabela analítica paginada e exportação para Excel (`DriverPerformanceReport`)
 * - Clique no condutor abre o detalhe individual, sempre pelo UUID
 *
 * Rota: /ranking-condutores/performance-condutores
 */

"use client";

import { DriverPerformanceReport } from "@/components/driver-performance-report";
import { FiltrosHierarquicos } from "@/components/filtros-hierarquicos";
import { PeriodoSelector } from "@/components/periodo-selector";
import { useRankingPageFilters } from "@/hooks/use-ranking-page-filters";

export default function PerformanceCondutoresPage() {
  const {
    anoSelecionado,
    setAnoSelecionado,
    filtros,
    setFiltros,
    opcoesFiltro,
    filtrosApi,
  } = useRankingPageFilters({ apenasAno: true });

  return (
    <div className="animate-fade-in p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Performance dos Condutores</h1>
          <p className="text-sm text-muted-foreground">Relatórios analíticos para gestão de frota</p>
        </div>

        <PeriodoSelector
          anoSelecionado={anoSelecionado}
          onAnoChange={setAnoSelecionado}
          ocultarMes
        />
      </div>

      <FiltrosHierarquicos filtros={filtros} opcoes={opcoesFiltro} onChange={setFiltros} />

      <DriverPerformanceReport ano={anoSelecionado} filtros={filtrosApi} />
    </div>
  );
}
