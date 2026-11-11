/**
 * RankingCondutores — Tabela de Ranking com abas Mensal/Anual (seção 4.1 da spec).
 *
 * Conectada a `GET /dashboard/ranking`:
 * - Aba Mensal (`period: 'monthly'`): pontuação e classificação do mês.
 * - Aba Anual (`period: 'annual'`): acumulado do ano + 12 colunas de meses (`months.jan` ... `months.dec`),
 *   exibindo "-" quando o mês é `null` (mês não fechado ou anterior à admissão).
 * - Responde aos filtros hierárquicos (`company_id`, `unit_id`, `department_id`, `cost_center_id`, `manager_id`, `driver_name`).
 *
 * @example
 * <RankingCondutores ano={2026} mes={3} filtros={filtrosApi} />
 */

"use client";

import { useState } from "react";
import { ClassificationLabelBadge } from "@/components/classification-label-badge";
import { DriverLink } from "@/components/driver-link";
import { InfoTooltip } from "@/components/info-tooltip";
import { PaginacaoNumerada } from "@/components/paginacao-numerada";
import { PaginacaoSimples } from "@/components/paginacao-simples";
import { ListSkeleton, QueryState } from "@/components/query-state";
import { ScoreCircle } from "@/components/score-circle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiQuery } from "@/hooks/use-api-query";
import {
  getDriverCategories,
  getRanking,
  type GetRankingInput,
} from "@/services/driver-scoring.service";
import type {
  DashboardHierarchyFilters,
  RankingAnnualItem,
  RankingMonthlyItem,
} from "@/types/driver-scoring";
import { displayValue, formatScore, RANKING_ANNUAL_MONTHS } from "@/utils/driver-scoring-helpers";

/** Quantidade de itens por página (padrão do backend). */
const ITENS_POR_PAGINA = 15;

type Aba = "monthly" | "annual";

/** Funções estáveis (fora do componente), exigidas pelo `useApiQuery`. */
const fetchMonthlyRanking = (params: GetRankingInput & { period: "monthly" }) => getRanking(params);
const fetchAnnualRanking = (params: GetRankingInput & { period: "annual" }) => getRanking(params);

interface RankingCondutoresProps {
  ano: number;
  /** Mês de 1 a 12 (usado só na aba mensal). */
  mes: number;
  filtros: DashboardHierarchyFilters;
}

export function RankingCondutores({ ano, mes, filtros }: RankingCondutoresProps) {
  const [aba, setAba] = useState<Aba>("monthly");

  /* ---------- Página atual (volta para 1 quando aba, período ou filtros mudam) ---------- */
  const assinatura = JSON.stringify({ aba, ano, mes, filtros });
  const [paginaSalva, setPaginaSalva] = useState({ assinatura, pagina: 1 });
  const pagina = paginaSalva.assinatura === assinatura ? paginaSalva.pagina : 1;

  function handlePaginaChange(novaPagina: number) {
    setPaginaSalva({ assinatura, pagina: novaPagina });
  }

  /* ---------- Busca (só a aba ativa dispara requisição) ---------- */
  const comumParams = { year: ano, page: pagina, limit: ITENS_POR_PAGINA, ...filtros };

  const mensal = useApiQuery(
    fetchMonthlyRanking,
    { period: "monthly", month: mes, ...comumParams },
    { enabled: aba === "monthly" },
  );
  const anual = useApiQuery(
    fetchAnnualRanking,
    { period: "annual", ...comumParams },
    { enabled: aba === "annual" },
  );

  const consultaAtiva = aba === "monthly" ? mensal : anual;
  const quantidadeItens = consultaAtiva.data?.length ?? 0;

  /* ---------- Total de condutores para paginação numerada ---------- */
  const categorias = useApiQuery(getDriverCategories, {
    year: ano,
    month: mes,
    ...filtros,
  });

  const totalCondutores =
    categorias.data?.find((card) => card.category === "total")?.count ?? 0;
  const totalPaginas = Math.max(
    pagina,
    Math.ceil(totalCondutores / ITENS_POR_PAGINA),
  );

  return (
    <div className="bg-card rounded-lg border border-border p-5 overflow-hidden">
      <Tabs
        value={aba}
        onValueChange={(valor) => setAba(valor as Aba)}
        className="flex-col min-w-0"
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2 leading-tight">
            Ranking dos Condutores
            <InfoTooltip texto="Classificação geral de todos os condutores com base na pontuação do período selecionado." />
          </h3>
          <TabsList>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
            <TabsTrigger value="annual">Anual</TabsTrigger>
          </TabsList>
        </div>

        {/* ==================== ABA MENSAL ==================== */}
        <TabsContent value="monthly">
          <QueryState
            isLoading={mensal.isLoading}
            hasData={mensal.data !== undefined}
            error={mensal.error}
            isEmpty={mensal.data?.length === 0}
            emptyMessage="Nenhum condutor encontrado para os filtros selecionados."
            onRetry={mensal.refetch}
            skeleton={<ListSkeleton linhas={8} />}
          >
            <RankingMensalTabela itens={mensal.data ?? []} />
          </QueryState>
        </TabsContent>

        {/* ==================== ABA ANUAL ==================== */}
        <TabsContent value="annual">
          <QueryState
            isLoading={anual.isLoading}
            hasData={anual.data !== undefined}
            error={anual.error}
            isEmpty={anual.data?.length === 0}
            emptyMessage="Nenhum dado anual disponível."
            emptyHint="O ranking anual considera apenas meses já encerrados e fica disponível a partir de fevereiro do ano corrente."
            onRetry={anual.refetch}
            skeleton={<ListSkeleton linhas={8} />}
          >
            <RankingAnualTabela itens={anual.data ?? []} />
            <p className="text-[10px] text-muted-foreground mt-2">
              Arraste horizontalmente para visualizar todos os meses
            </p>
          </QueryState>
        </TabsContent>

        {totalCondutores > 0 ? (
          <PaginacaoNumerada
            pagina={pagina}
            totalPaginas={totalPaginas}
            totalItens={totalCondutores}
            itensPorPagina={ITENS_POR_PAGINA}
            rotuloItens="condutores"
            desabilitado={consultaAtiva.isLoading}
            mostrarSempre
            onPaginaChange={handlePaginaChange}
          />
        ) : (
          <PaginacaoSimples
            pagina={pagina}
            temProximaPagina={quantidadeItens === ITENS_POR_PAGINA}
            desabilitado={consultaAtiva.isLoading}
            onPaginaChange={handlePaginaChange}
          />
        )}
      </Tabs>
    </div>
  );
}

/* ==================== TABELAS INTERNAS ==================== */

/** Colunas de identificação compartilhadas pelas duas tabelas. */
function CabecalhoInfo() {
  return (
    <>
      <th className="text-left py-2.5 px-3 whitespace-nowrap">Condutor</th>
      <th className="text-left py-2.5 px-3 whitespace-nowrap">Gestor</th>
      <th className="text-left py-2.5 px-3 whitespace-nowrap">C. Custo</th>
      <th className="text-left py-2.5 px-3 whitespace-nowrap">Filial</th>
      <th className="text-left py-2.5 px-3 whitespace-nowrap">Departamento</th>
      <th className="text-left py-2.5 px-3 whitespace-nowrap">Unidade</th>
    </>
  );
}

/** Células de identificação compartilhadas (nome com link + dados organizacionais). */
function CelulasInfo({ item }: { item: RankingMonthlyItem | RankingAnnualItem }) {
  return (
    <>
      <td className="py-2.5 px-3 whitespace-nowrap">
        <DriverLink driverId={item.id} nome={item.driver} />
      </td>
      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{displayValue(item.manager)}</td>
      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{displayValue(item.costCenter)}</td>
      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{displayValue(item.branch)}</td>
      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{displayValue(item.department)}</td>
      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{displayValue(item.unit)}</td>
    </>
  );
}

function RankingMensalTabela({ itens }: { itens: RankingMonthlyItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-xs">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="text-left py-2.5 px-3 whitespace-nowrap">#</th>
            <CabecalhoInfo />
            <th className="text-right py-2.5 px-3 whitespace-nowrap">Pontuação</th>
            <th className="text-right py-2.5 px-3 whitespace-nowrap">Classificação</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr
              key={item.id}
              className="border-b last:border-0 hover:bg-muted/50 transition-colors"
            >
              <td className="py-2.5 px-3 font-medium whitespace-nowrap">{item.pos}</td>
              <CelulasInfo item={item} />
              <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">{formatScore(item.score)}</td>
              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                <ClassificationLabelBadge label={item.classification} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RankingAnualTabela({ itens }: { itens: RankingAnnualItem[] }) {
  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="text-xs w-max min-w-full">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="text-left py-2 px-2 sticky left-0 bg-card z-10">Pos.</th>
            <CabecalhoInfo />
            <th className="text-center py-2 px-2 font-bold border-l border-border">Acum. Ano</th>
            {RANKING_ANNUAL_MONTHS.map((mes) => (
              <th key={mes.key} className="text-center py-2 min-w-12.5">
                {mes.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr
              key={item.id}
              className="border-b last:border-0 hover:bg-muted/50 transition-colors"
            >
              <td className="py-2 px-2 font-medium sticky left-0 bg-card z-10">{item.pos}</td>
              <CelulasInfo item={item} />
              <td className="py-2 px-2 text-center font-bold border-l border-border">
                {formatScore(item.accumYear)}
              </td>
              {RANKING_ANNUAL_MONTHS.map((mes) => {
                const celula = item.months[mes.key];
                return (
                  <td key={mes.key} className="py-2 text-center">
                    {celula ? (
                      <ScoreCircle pontuacao={celula.score} classificacao={celula.classification} />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
