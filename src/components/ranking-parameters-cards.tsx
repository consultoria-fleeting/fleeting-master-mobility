/**
 * RankingParametersCards — Eventos por nível de exposição (seção 4.7 da spec).
 *
 * `GET /dashboard/ranking-parameters`: grupos `CRITICAL`, `HIGH`, `MEDIUM` e `LOW`.
 * Os códigos `event_type` são traduzidos com `getEventTypeLabel` e cada grupo é ordenado
 * por `total` decrescente. Clicar em um card abre o detalhe (4.9) preservando período e filtros.
 *
 * @example
 * <RankingParametersCards ano={2026} mes={3} filtros={filtros} />
 */

"use client";

import { useRouter } from "next/navigation";
import { ParametroCard } from "@/components/parametro-card";
import { ListSkeleton, QueryState } from "@/components/query-state";
import { useApiQuery } from "@/hooks/use-api-query";
import { getRankingParameters } from "@/services/driver-scoring.service";
import type {
  DashboardHierarchyFilters,
  ExposureLevelBucket,
  RankingParameterEvent,
} from "@/types/driver-scoring";
import { EXPOSURE_LEVELS, getEventTypeIcon } from "@/utils/driver-scoring-display";
import { getEventTypeLabel } from "@/utils/driver-scoring-helpers";
import { buildParameterDetailsQuery, getParameterDetailsPath } from "@/utils/ranking-search-params";

interface RankingParametersCardsProps {
  ano: number;
  /** Mês de 1 a 12. */
  mes: number;
  filtros: DashboardHierarchyFilters;
}

/** Ordena do evento com mais ocorrências para o com menos (sem alterar o array original). */
function sortByTotalDesc(events: RankingParameterEvent[]): RankingParameterEvent[] {
  return [...events].sort((a, b) => b.total - a.total);
}

export function RankingParametersCards({ ano, mes, filtros }: RankingParametersCardsProps) {
  const router = useRouter();

  const { data, isLoading, error, refetch } = useApiQuery(getRankingParameters, {
    year: ano,
    month: mes,
    ...filtros,
  });

  const isEmpty = data !== undefined && EXPOSURE_LEVELS.every(({ level }) => data[level].length === 0);

  /** Navega para o detalhe do evento mantendo período, filtros e nível de origem. */
  function handleCardClick(eventType: string, level: ExposureLevelBucket) {
    const query = buildParameterDetailsQuery(ano, mes, filtros, level);
    router.push(`${getParameterDetailsPath(eventType)}?${query}`);
  }

  return (
    <QueryState
      isLoading={isLoading}
      hasData={data !== undefined}
      error={error}
      isEmpty={isEmpty}
      emptyMessage="Nenhum parâmetro de ranking configurado para esta organização."
      onRetry={refetch}
      skeleton={<ListSkeleton linhas={6} />}
    >
      <div className="space-y-6">
        {EXPOSURE_LEVELS.map(({ level, label, bgClassName, textClassName }) => {
          const events = sortByTotalDesc(data?.[level] ?? []);
          if (events.length === 0) return null;

          return (
            <section key={level} className="space-y-3" aria-label={label}>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className={`inline-block w-3 h-3 rounded-sm ${bgClassName}`} aria-hidden="true" />
                {label}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {events.map((event) => (
                  <ParametroCard
                    key={event.event_type}
                    label={getEventTypeLabel(event.event_type)}
                    total={event.total}
                    icone={getEventTypeIcon(event.event_type)}
                    bgClasse={bgClassName}
                    textoClasse={textClassName}
                    onClick={() => handleCardClick(event.event_type, level)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </QueryState>
  );
}
