/**
 * Performance do Condutor — Página de Detalhe
 *
 * Integrada ao backend `api-driver-scoring` (seção 4.12 da spec) com duas abas:
 * - Ranking: indicadores (KPIs), evolução mensal (12 meses) e eventos paginados (com exceções sinalizadas)
 * - Análise Preditiva: IRC derivado da pontuação real — demais seções desabilitadas (V1)
 *
 * Rota: /ranking-condutores/performance-condutores/[id]
 * O `[id]` é SEMPRE o UUID do condutor (nunca o nome). Ele é validado com Zod antes da requisição.
 * O mês é opcional: com "Todos os meses" os eventos de todos os meses fechados são listados.
 *
 * O documento do condutor (CNH/CPF, dado pessoal) é exibido mascarado.
 */

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DriverEventsTable } from "@/components/driver-performance/driver-events-table";
import { DriverMonthlyScoresChart } from "@/components/driver-performance/driver-monthly-scores-chart";
import { DriverPerformanceKpis } from "@/components/driver-performance/driver-performance-kpis";
import { DriverPredictiveTab } from "@/components/driver-performance/driver-predictive-tab";
import { PeriodoSelector } from "@/components/periodo-selector";
import { ListSkeleton, QueryState } from "@/components/query-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiQuery } from "@/hooks/use-api-query";
import { NOMES_MESES } from "@/hooks/use-ranking-page-filters";
import { useResettablePage } from "@/hooks/use-resettable-page";
import { getDriverPerformanceDetail } from "@/services/driver-scoring.service";
import type { DriverPerformanceDriver } from "@/types/driver-scoring";
import { maskDocument } from "@/utils/driver-scoring-display";
import { displayValue } from "@/utils/driver-scoring-helpers";

const EVENTOS_POR_PAGINA = 10;

/** Função estável (fora do componente), exigida pelo `useApiQuery`. */
const fetchDriverDetail = (params: {
  identifier: string;
  year: number;
  month?: number;
  page: number;
  limit: number;
}) => {
  const { identifier, ...query } = params;
  return getDriverPerformanceDetail(identifier, query);
};

/** Dados cadastrais do condutor exibidos abaixo do título. */
function DriverInfo({ driver }: { driver: DriverPerformanceDriver }) {
  const itens = [
    { rotulo: "Gestor", valor: displayValue(driver.manager) },
    { rotulo: "Centro de Custo", valor: displayValue(driver.cost_center) },
    { rotulo: "Documento", valor: maskDocument(driver.document) },
  ];

  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs mt-2">
      {itens.map((item) => (
        <div key={item.rotulo} className="flex gap-1.5">
          <dt className="text-muted-foreground">{item.rotulo}:</dt>
          <dd className="font-medium text-foreground">{item.valor}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function PerformanceCondutorPage() {
  const params = useParams<{ id: string }>();
  const identifier = params.id;

  /* ---------- Período (mês opcional: "" = todos os meses fechados) ---------- */
  const hoje = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(NOMES_MESES[hoje.getMonth()]);
  const [anoSelecionado, setAnoSelecionado] = useState(hoje.getFullYear());
  const mesNumero = mesSelecionado ? NOMES_MESES.indexOf(mesSelecionado) + 1 : undefined;

  const [pagina, setPagina] = useResettablePage(
    JSON.stringify({ identifier, anoSelecionado, mesNumero }),
  );

  const { data, isLoading, error, refetch } = useApiQuery(fetchDriverDetail, {
    identifier,
    year: anoSelecionado,
    month: mesNumero,
    page: pagina,
    limit: EVENTOS_POR_PAGINA,
  });

  return (
    <div className="animate-fade-in p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl font-bold text-foreground">{data?.driver.name ?? "Condutor"}</h1>
            {data && (
              <>
                <p className="text-sm text-muted-foreground">
                  {displayValue(data.driver.branch)} — {displayValue(data.driver.department)} —{" "}
                  {displayValue(data.driver.unit)}
                </p>
                <DriverInfo driver={data.driver} />
              </>
            )}
          </div>
        </div>

        <PeriodoSelector
          mesSelecionado={mesSelecionado}
          anoSelecionado={anoSelecionado}
          onMesChange={setMesSelecionado}
          onAnoChange={setAnoSelecionado}
          opcaoTodosMeses
        />
      </div>

      <QueryState
        isLoading={isLoading}
        hasData={data !== undefined}
        error={error}
        onRetry={refetch}
        skeleton={<ListSkeleton linhas={6} />}
      >
        {data && (
          <Tabs defaultValue="ranking" className="w-full flex-col">
            <TabsList>
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
              <TabsTrigger value="preditiva">Análise Preditiva</TabsTrigger>
            </TabsList>

            {/* ==================== ABA RANKING ==================== */}
            <TabsContent value="ranking" className="space-y-6 mt-4">
              <DriverPerformanceKpis indicators={data.indicators} />
              <DriverMonthlyScoresChart scores={data.monthly_scores} />
              <DriverEventsTable
                events={data.events.data}
                pagination={data.events.pagination}
                carregando={isLoading}
                onPaginaChange={setPagina}
              />
            </TabsContent>

            {/* ==================== ABA ANÁLISE PREDITIVA ==================== */}
            <TabsContent value="preditiva" className="space-y-6 mt-4">
              <DriverPredictiveTab pontuacao={data.indicators.current_month_score} />
            </TabsContent>
          </Tabs>
        )}
      </QueryState>
    </div>
  );
}
