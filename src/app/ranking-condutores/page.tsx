/**
 * Dashboard Geral do Ranking — Página Principal (Visão Geral)
 *
 * Integrada ao backend `api-driver-scoring` (seções 4.1 a 4.6 e 5.1 a 5.5 da spec):
 * - Seletor de período (mês/ano) na parte superior
 * - Barra de filtros em cascata (filial, unidade, departamento, centro de custo, gestor, nome)
 * - Cards de classificação (4.2)
 * - Listas Top 10 Referência (4.5) e 10 Menores Pontuações (4.6)
 * - Ranking completo Mensal/Anual (4.1)
 * - Análises gráficas: evolução anual (4.4), distribuição por agrupamento (4.3),
 *   fadiga (4.10) e volume de eventos (4.8)
 *
 * Cada seção busca seus próprios dados e trata seus loading/erro/vazio de forma independente.
 */

"use client";

import { AnnualEvolutionChart } from "@/components/annual-evolution-chart";
import { DriverCategoryCards } from "@/components/driver-category-cards";
import { DriversDistributionChart } from "@/components/drivers-distribution-chart";
import { EventsVolumeChart } from "@/components/events-volume-chart";
import { FatigueDistributionChart } from "@/components/fatigue-distribution-chart";
import { FiltrosHierarquicos } from "@/components/filtros-hierarquicos";
import { PeriodoSelector } from "@/components/periodo-selector";
import { RankingCondutores } from "@/components/ranking-condutores";
import { TopDriversCard } from "@/components/top-drivers-card";
import { useRankingPageFilters } from "@/hooks/use-ranking-page-filters";

export default function DashboardRankingPage() {
  const {
    mesSelecionado,
    setMesSelecionado,
    anoSelecionado,
    setAnoSelecionado,
    mesNumero,
    filtros,
    setFiltros,
    opcoesFiltro,
    filtrosApi,
  } = useRankingPageFilters();

  return (
    <div className="animate-fade-in p-4 lg:p-6 space-y-6">
      {/* Header com título e seletor de período */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Dashboard Geral do Ranking
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão consolidada de performance dos condutores
          </p>
        </div>

        <PeriodoSelector
          mesSelecionado={mesSelecionado}
          anoSelecionado={anoSelecionado}
          onMesChange={setMesSelecionado}
          onAnoChange={setAnoSelecionado}
        />
      </div>

      {/* Barra de filtros */}
      <FiltrosHierarquicos filtros={filtros} opcoes={opcoesFiltro} onChange={setFiltros} />

      {/* Cards de classificação */}
      <DriverCategoryCards ano={anoSelecionado} mes={mesNumero} filtros={filtrosApi} />

      {/* Listas Top 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopDriversCard variante="referencia" ano={anoSelecionado} mes={mesNumero} filtros={filtrosApi} />
        <TopDriversCard variante="menores" ano={anoSelecionado} mes={mesNumero} filtros={filtrosApi} />
      </div>

      {/* Ranking dos Condutores — Tabela completa com abas Mensal/Anual (filtra só por período e gestor) */}
      <RankingCondutores ano={anoSelecionado} mes={mesNumero} managerId={filtros.managerId} />

      {/* ==================== ANÁLISES GRÁFICAS ==================== */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Análises Gráficas
        </h2>
      </div>

      {/* Evolução do Comportamento — Ano */}
      <AnnualEvolutionChart ano={anoSelecionado} filtros={filtrosApi} />

      {/* Distribuição por Departamento / Unidade / Filial */}
      <DriversDistributionChart ano={anoSelecionado} mes={mesNumero} filtros={filtrosApi} />

      {/* Registros de Fadiga por Filial (4.10) */}
      <FatigueDistributionChart
        ano={anoSelecionado}
        mes={mesNumero}
        filtros={filtrosApi}
        groupByInicial="company"
      />

      {/* Quantidade de Eventos por Parâmetro do Ranking (4.8) */}
      <EventsVolumeChart ano={anoSelecionado} mes={mesNumero} filtros={filtrosApi} />
    </div>
  );
}
