/**
 * Parâmetros do Ranking — Página
 *
 * Integrada ao backend `api-driver-scoring` (seções 4.7, 4.8 e 4.10 da spec):
 * - Seletor de período (mês/ano) e filtros hierárquicos em cascata
 * - Cards de eventos por nível de exposição (4.7) — clique abre o detalhe (4.9)
 * - Gráfico de fadiga aguda × acumulada (4.10)
 * - Gráfico de volume de eventos por tipo (4.8)
 *
 * Cada seção busca seus próprios dados e trata loading/erro/vazio de forma independente.
 *
 * Rota: /ranking-condutores/dashboard-parametros
 */

"use client";

import Link from "next/link";
import { ListChecks } from "lucide-react";
import { EventsVolumeChart } from "@/components/events-volume-chart";
import { FatigueDistributionChart } from "@/components/fatigue-distribution-chart";
import { FiltrosHierarquicos } from "@/components/filtros-hierarquicos";
import { PeriodoSelector } from "@/components/periodo-selector";
import { RankingParametersCards } from "@/components/ranking-parameters-cards";
import { useRankingPageFilters } from "@/hooks/use-ranking-page-filters";
import { ALL_EVENTS_IDENTIFIER } from "@/types/driver-scoring";
import { buildParameterDetailsQuery, getParameterDetailsPath } from "@/utils/ranking-search-params";

export default function DashboardParametrosPage() {
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

  const linkTodosEventos = `${getParameterDetailsPath(ALL_EVENTS_IDENTIFIER)}?${buildParameterDetailsQuery(
    anoSelecionado,
    mesNumero,
    filtrosApi,
  )}`;

  return (
    <div className="animate-fade-in p-4 lg:p-6 space-y-6">
      {/* Header com título e seletor de período */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Parâmetros do Ranking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Indicadores agrupados por nível de impacto na pontuação. Clique para ver detalhes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={linkTodosEventos}
            className="inline-flex items-center gap-1.5 text-xs border border-border rounded-md px-3 py-1.5 bg-background hover:bg-muted transition-colors"
          >
            <ListChecks className="w-3.5 h-3.5" aria-hidden="true" />
            Ver todos os eventos
          </Link>

          <PeriodoSelector
            mesSelecionado={mesSelecionado}
            anoSelecionado={anoSelecionado}
            onMesChange={setMesSelecionado}
            onAnoChange={setAnoSelecionado}
          />
        </div>
      </div>

      {/* Barra de filtros */}
      <FiltrosHierarquicos filtros={filtros} opcoes={opcoesFiltro} onChange={setFiltros} />

      {/* Cards agrupados por nível de exposição (4.7) */}
      <RankingParametersCards ano={anoSelecionado} mes={mesNumero} filtros={filtrosApi} />

      {/* Gráficos */}
      <FatigueDistributionChart ano={anoSelecionado} mes={mesNumero} filtros={filtrosApi} />
      <EventsVolumeChart ano={anoSelecionado} mes={mesNumero} filtros={filtrosApi} />
    </div>
  );
}
