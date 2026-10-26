# Relatório de Integração — Ranking de Condutores (Etapa 3)

Integração das telas **Dashboard de Parâmetros** e **Performance de Condutores** com o backend `api-driver-scoring` (seções 4.7 a 4.12 do `API_DRIVER_SCORING_SPEC.md`).

Validação: `npx tsc --noEmit` ✅ · `npx eslint` (arquivos tocados) ✅ · `npx next build` ✅

## Telas integradas

| Tela | Rota | Endpoints | Arquivos |
|---|---|---|---|
| Parâmetros do Ranking | `/ranking-condutores/dashboard-parametros` | 4.7, 4.8, 4.10 | `dashboard-parametros/page.tsx`, `ranking-parameters-cards.tsx`, `fatigue-distribution-chart.tsx`, `events-volume-chart.tsx`, `group-by-selector.tsx` |
| Detalhe do Parâmetro | `/ranking-condutores/dashboard-parametros/[id]` | 4.9 | `dashboard-parametros/[id]/page.tsx`, `parameter-details-table.tsx`, `paginacao-numerada.tsx`, `schemas/ranking-search-params.ts`, `utils/ranking-search-params.ts` |
| Performance dos Condutores | `/ranking-condutores/performance-condutores` | 4.11 | `performance-condutores/page.tsx`, `driver-performance-report.tsx`, `utils/csv.ts` |
| Performance do Condutor | `/ranking-condutores/performance-condutores/[id]` | 4.12 | `performance-condutores/[id]/page.tsx`, `driver-performance/driver-performance-kpis.tsx`, `driver-monthly-scores-chart.tsx`, `driver-events-table.tsx`, `driver-predictive-tab.tsx` |
| Visão Geral (complemento) | `/ranking-condutores` | 4.8, 4.10 | `page.tsx` — os 2 gráficos mock viraram `FatigueDistributionChart` e `EventsVolumeChart` |

Apoio compartilhado: `hooks/use-ranking-page-filters.ts`, `hooks/use-resettable-page.ts`, `utils/driver-scoring-display.ts`, `components/periodo-selector.tsx` (nova prop `opcaoTodosMeses`).

## Telas NÃO alteradas (continuam com mock)

- `/ranking-condutores/matriz-pontuacao`
- `/ranking-condutores/gestao-excecoes`
- `/ranking-condutores/analises-preditivas`

## Pontos de atenção

- **Detalhe 4.9 sem clique por linha**: a API não devolve o id do condutor nessa rota; navegar pelo nome seria frágil (spec 8.2).
- **Links quebrados em `analises-preditivas`**: a tela (intocada) ainda linka para o detalhe pelo **nome**. Como o `[id]` agora exige UUID, esses links exibem erro até a tela ser integrada.
- **Aba "Análise Preditiva"** do detalhe segue mock; o IRC é derivado da pontuação real (`100 - score`, limitado a 5–95).
- **PII**: o `document` do condutor é exibido mascarado (`***` + 4 últimos dígitos).
- **Listagem 4.11** considera só meses fechados (o backend troca um mês posterior ao último fechado).
- **Tokens em `localStorage`**: vêm do auth legado compartilhado (`TODO(security)` pré-existente, fora do escopo).
- **Aviso de lint pré-existente** em `analises-preditivas/page.tsx` (`HeatmapGrid` não usado) — arquivo protegido, não alterado.
