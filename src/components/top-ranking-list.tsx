/**
 * TopRankingList — Lista Top 10 Genérica
 *
 * Componente de apresentação que exibe uma lista de condutores em formato de tabela,
 * com estados de loading, erro e vazio. Os dados vêm de quem o utiliza.
 * Configurável para exibir ou ocultar a coluna de classificação.
 *
 * Casos de uso:
 * - Top 10 Condutores Referência (sem coluna de classificação)
 * - 10 Menores Pontuações (com coluna de classificação)
 *
 * O nome do condutor é um link para `/ranking-condutores/performance-condutores/<uuid>/`.
 *
 * @example
 * <TopRankingList
 *   titulo="Top 10 Condutores Referência"
 *   icone={Trophy}
 *   corIcone="text-green-500"
 *   descricao="Os 10 condutores com maior pontuação."
 *   linhas={linhas}
 *   isLoading={isLoading}
 *   erro={error}
 *   onRetry={refetch}
 * />
 */

"use client";

import type { LucideIcon } from "lucide-react";
import { ClassificationLabelBadge } from "@/components/classification-label-badge";
import { DriverLink } from "@/components/driver-link";
import { InfoTooltip } from "@/components/info-tooltip";
import { ListSkeleton, QueryState } from "@/components/query-state";
import { displayValue, formatScore } from "@/utils/driver-scoring-helpers";

/** Linha da lista (já no formato de exibição). */
export interface TopRankingRow {
  /** UUID do condutor (usado no link de detalhe). */
  id: string;
  posicao: number;
  nome: string;
  unidade: string;
  pontuacao: number;
  /** Label da classificação (só exibido com `mostrarClassificacao`). */
  classificacao?: string;
}

interface TopRankingListProps {
  titulo: string;
  icone: LucideIcon;
  corIcone: string;
  descricao: string;
  /** `undefined` enquanto nunca carregou. */
  linhas: TopRankingRow[] | undefined;
  isLoading: boolean;
  erro?: unknown;
  onRetry?: () => void;
  mostrarClassificacao?: boolean;
}

export function TopRankingList({
  titulo,
  icone: Icone,
  corIcone,
  descricao,
  linhas,
  isLoading,
  erro,
  onRetry,
  mostrarClassificacao = false,
}: TopRankingListProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icone className={`w-4 h-4 ${corIcone}`} />
        {titulo}
        <InfoTooltip texto={descricao} />
      </h3>

      <QueryState
        isLoading={isLoading}
        hasData={linhas !== undefined}
        error={erro}
        isEmpty={linhas?.length === 0}
        emptyMessage="Nenhum condutor encontrado para os filtros selecionados."
        onRetry={onRetry}
        skeleton={<ListSkeleton linhas={6} />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left py-2">Nome</th>
                <th className="text-left py-2">Unidade</th>
                <th className="text-right py-2 px-2">Pts</th>
                {mostrarClassificacao && (
                  <th className="text-right py-2 px-2">Classificação</th>
                )}
              </tr>
            </thead>
            <tbody>
              {linhas?.map((linha) => (
                <tr
                  key={linha.id}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-2 px-2 font-medium">{linha.posicao}</td>
                  <td className="py-2">
                    <DriverLink driverId={linha.id} nome={linha.nome} />
                  </td>
                  <td className="py-2 text-muted-foreground">{displayValue(linha.unidade)}</td>
                  <td className="py-2 px-2 text-right font-bold">{formatScore(linha.pontuacao)}</td>
                  {mostrarClassificacao && (
                    <td className="py-2 px-2 text-right">
                      {linha.classificacao && (
                        <ClassificationLabelBadge label={linha.classificacao} />
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </QueryState>
    </div>
  );
}
