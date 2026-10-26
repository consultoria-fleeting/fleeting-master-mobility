/**
 * TopDriversCard — Lista Top 10 conectada à API (seções 4.5 e 4.6 da spec).
 *
 * - `variante="referencia"`: `GET /dashboard/top-reference-drivers` (Top 10 Referência).
 * - `variante="menores"`: `GET /dashboard/bottom-scoring-drivers` (10 menores pontuações).
 *
 * @example
 * <TopDriversCard variante="referencia" ano={2026} mes={3} filtros={filtros} />
 */

"use client";

import { Trophy, TrendingDown } from "lucide-react";
import { TopRankingList, type TopRankingRow } from "@/components/top-ranking-list";
import { useApiQuery } from "@/hooks/use-api-query";
import { getBottomScoringDrivers, getTopReferenceDrivers } from "@/services/driver-scoring.service";
import type { DashboardHierarchyFilters } from "@/types/driver-scoring";

interface TopDriversCardProps {
  variante: "referencia" | "menores";
  ano: number;
  /** Mês de 1 a 12. */
  mes: number;
  filtros: DashboardHierarchyFilters;
}

export function TopDriversCard({ variante, ano, mes, filtros }: TopDriversCardProps) {
  const params = { year: ano, month: mes, ...filtros };

  // Os dois hooks são chamados sempre (regra dos hooks); só o da variante ativa busca dados.
  const referencia = useApiQuery(getTopReferenceDrivers, params, { enabled: variante === "referencia" });
  const menores = useApiQuery(getBottomScoringDrivers, params, { enabled: variante === "menores" });

  if (variante === "referencia") {
    const linhas: TopRankingRow[] | undefined = referencia.data?.map((condutor) => ({
      id: condutor.id,
      posicao: condutor.position,
      nome: condutor.name,
      unidade: condutor.unit,
      pontuacao: condutor.score,
    }));

    return (
      <TopRankingList
        titulo="Top 10 Condutores Referência"
        icone={Trophy}
        corIcone="text-green-500"
        descricao="Os 10 condutores com maior pontuação no período selecionado, classificados como Referência."
        linhas={linhas}
        isLoading={referencia.isLoading}
        erro={referencia.error}
        onRetry={referencia.refetch}
      />
    );
  }

  const linhas: TopRankingRow[] | undefined = menores.data?.map((condutor) => ({
    id: condutor.id,
    posicao: condutor.position,
    nome: condutor.name,
    unidade: condutor.unit,
    pontuacao: condutor.score,
    classificacao: condutor.classification,
  }));

  return (
    <TopRankingList
      titulo="10 Menores Pontuações"
      icone={TrendingDown}
      corIcone="text-red-500"
      descricao="Os 10 condutores com menor pontuação no período (fora da classificação Referência), que necessitam de atenção imediata."
      linhas={linhas}
      isLoading={menores.isLoading}
      erro={menores.error}
      onRetry={menores.refetch}
      mostrarClassificacao
    />
  );
}
