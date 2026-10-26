/**
 * Matriz de Pontuação — Página
 *
 * Exibe as regras que definem o cálculo do ranking de condutores:
 * 1. Tabela de Pontuação por Evento (Origem, Evento, Pontuação)   — API
 * 2. Classificação dos Condutores (faixas com cores)              — API
 * 3. Fatores de Quilometragem                                     — API
 * 4. Regras de Cálculo do Ranking (lista numerada)                — texto estático
 * 5. Periodicidade de Atualização                                 — texto estático
 *
 * As seções 1 a 3 vêm de `GET /dashboard/scoring-matrix` (sem query params; usa a organização do token).
 * As seções 4 e 5 são textos institucionais que o backend não expõe.
 *
 * Tela apenas visual (V1 — sem edição).
 *
 * Rota: /ranking-condutores/matriz-pontuacao
 */

"use client";

import { ClassificacaoGrid } from "@/components/classificacao-grid";
import { FatoresQuilometragem } from "@/components/fatores-quilometragem";
import { PeriodicidadeSecao } from "@/components/periodicidade-secao";
import { ListSkeleton, QueryState } from "@/components/query-state";
import { RegrasCalculoLista } from "@/components/regras-calculo-lista";
import { TabelaPontuacao } from "@/components/tabela-pontuacao";
import { regrasCalculo, periodicidade } from "@/data/mock-matriz-pontuacao";
import { useApiQuery } from "@/hooks/use-api-query";
import { getScoringMatrix } from "@/services/driver-scoring.service";
import { mapClassificationsToFaixas, mapRulesToEventos } from "@/utils/scoring-matrix-mapper";

/** Função estável (fora do componente), exigida pelo `useApiQuery`. A rota não recebe params. */
const fetchScoringMatrix = () => getScoringMatrix();

export default function MatrizPontuacaoPage() {
  const { data, isLoading, error, refetch } = useApiQuery(fetchScoringMatrix, {});

  return (
    <div className="animate-fade-in p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Matriz de Pontuação</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Critérios, pesos e regras de cálculo do ranking
        </p>
      </div>

      {/* Seções 1 a 3: dados da API */}
      <QueryState
        isLoading={isLoading}
        hasData={data !== undefined}
        error={error}
        isEmpty={data?.rules.length === 0 && data.classifications.length === 0}
        emptyMessage="Nenhuma regra de pontuação configurada para a sua organização."
        onRetry={refetch}
        skeleton={<ListSkeleton linhas={8} />}
      >
        {data && (
          <div className="space-y-6">
            <TabelaPontuacao eventos={mapRulesToEventos(data.rules)} />
            <ClassificacaoGrid classificacoes={mapClassificationsToFaixas(data.classifications)} />
            {data.km_factors.length > 0 && <FatoresQuilometragem fatores={data.km_factors} />}
          </div>
        )}
      </QueryState>

      {/* Seção 4: Regras de Cálculo (estático) */}
      <RegrasCalculoLista regras={regrasCalculo} />

      {/* Seção 5: Periodicidade (estático) */}
      <PeriodicidadeSecao itens={periodicidade} />
    </div>
  );
}
