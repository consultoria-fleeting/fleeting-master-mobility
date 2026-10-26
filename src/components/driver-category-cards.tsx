/**
 * DriverCategoryCards — Cards de classificação da Visão Geral (seção 4.2 da spec).
 *
 * `GET /dashboard/driver-categories`: o 1º card é sempre o total de condutores e os
 * demais são as classificações cadastradas na organização (títulos e faixas dinâmicos).
 *
 * @example
 * <DriverCategoryCards ano={2026} mes={3} filtros={filtros} />
 */

"use client";

import { Trophy, Users } from "lucide-react";
import { QueryState } from "@/components/query-state";
import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/use-api-query";
import { getDriverCategories } from "@/services/driver-scoring.service";
import type { DashboardHierarchyFilters } from "@/types/driver-scoring";
import { getClassificationStyle } from "@/utils/driver-scoring-helpers";

/** Categoria que o backend usa para o card de total. */
const TOTAL_CATEGORY = "total";

const GRID_CLASSES = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3";

interface DriverCategoryCardsProps {
  ano: number;
  /** Mês de 1 a 12. */
  mes: number;
  filtros: DashboardHierarchyFilters;
}

export function DriverCategoryCards({ ano, mes, filtros }: DriverCategoryCardsProps) {
  const { data, isLoading, error, refetch } = useApiQuery(getDriverCategories, {
    year: ano,
    month: mes,
    ...filtros,
  });

  return (
    <QueryState
      isLoading={isLoading}
      hasData={data !== undefined}
      error={error}
      isEmpty={data?.length === 0}
      emptyMessage="Nenhuma categoria encontrada para o período selecionado."
      onRetry={refetch}
      skeleton={
        <div className={GRID_CLASSES} aria-hidden="true">
          {Array.from({ length: 5 }, (_, indice) => (
            <Skeleton key={indice} className="h-26 rounded-lg" />
          ))}
        </div>
      }
    >
      <div className={GRID_CLASSES}>
        {data?.map((card) => {
          const isTotal = card.category === TOTAL_CATEGORY;
          const estilo = getClassificationStyle(card.title);

          return (
            <StatCard
              key={card.category}
              titulo={card.title}
              valor={card.count}
              subtitulo={card.subtitle}
              icone={isTotal ? Users : estilo.level === "referencia" ? Trophy : undefined}
              variante={isTotal ? "primary" : "default"}
              classeCor={isTotal ? undefined : estilo.badgeClassName}
            />
          );
        })}
      </div>
    </QueryState>
  );
}
