/**
 * RankingParametersCards — Eventos por nível de exposição (seção 4.7 da spec).
 *
 * `GET /dashboard/ranking-parameters`: grupos `CRITICAL`, `HIGH`, `MEDIUM` e `LOW`.
 * O nome de cada card vem do `label` da API (traduzido pela matriz da organização) e cada grupo é ordenado
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
} from "@/types/driver-scoring";
import { EXPOSURE_LEVELS, getEventTypeIcon } from "@/utils/driver-scoring-display";
import { resolveEventLabel } from "@/utils/driver-scoring-helpers";
import { buildParameterDetailsQuery, getParameterDetailsPath } from "@/utils/ranking-search-params";

interface RankingParametersCardsProps {
  ano: number;
  /** Mês de 1 a 12. */
  mes: number;
  filtros: DashboardHierarchyFilters;
}

/**
 * Grupos visuais de cards na tela de Parâmetros do Ranking (padrão Lovable):
 * 1. Roxo: mais críticos (`CRITICAL`)
 * 2. Vermelho: alta/média exposição (`HIGH`)
 * 3. Amarelo: demais parâmetros (`MEDIUM` e `LOW` unificados no mesmo bloco)
 */
const VISUAL_GROUPS: {
  id: string;
  levels: ExposureLevelBucket[];
  bgClassName: string;
  textClassName: string;
}[] = [
  {
    id: "critico",
    levels: ["CRITICAL"],
    bgClassName: "bg-[#9B23AB]",
    textClassName: "text-white",
  },
  {
    id: "alto",
    levels: ["HIGH"],
    bgClassName: "bg-[#FF0000]",
    textClassName: "text-white",
  },
  {
    id: "demais",
    levels: ["MEDIUM", "LOW"],
    bgClassName: "bg-[#EEDA2B]",
    textClassName: "text-black",
  },
];

/** Ordena do evento com mais ocorrências para o com menos (sem alterar o array original). */
function sortByTotalDesc<T extends { total: number }>(events: T[]): T[] {
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
        {VISUAL_GROUPS.map(({ id, levels, bgClassName, textClassName }) => {
          const events = sortByTotalDesc(
            levels.flatMap((level) =>
              (data?.[level] ?? []).map((event) => ({ ...event, level })),
            ),
          );
          if (events.length === 0) return null;

          return (
            <div
              key={id}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {events.map((event) => (
                <ParametroCard
                  key={event.event_type}
                  label={resolveEventLabel(event.label, event.event_type)}
                  total={event.total}
                  icone={getEventTypeIcon(event.event_type)}
                  bgClasse={bgClassName}
                  textoClasse={textClassName}
                  onClick={() => handleCardClick(event.event_type, event.level)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </QueryState>
  );
}
