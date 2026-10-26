# INTEGRATION_REPORT — Ranking de Condutores × `api-driver-scoring`

> Relatório para a IA orquestradora. Cobre as **3 etapas** da integração do front (`fleeting-master-mobility`) com o backend `api-driver-scoring`.
> Fonte da verdade do contrato: `API_DRIVER_SCORING_SPEC.md` (raiz). Detalhes de componentes e decisões: `PROJECT.md`.

## 1. Resumo executivo

- **Projeto**: Next.js 16.2.10 (Turbopack), React 19, TypeScript, Tailwind v4, Zod 4, Axios, Recharts, shadcn/ui.
- **Escopo concluído**: 7 telas do módulo `/ranking-condutores` integradas à API real; 3 telas permanecem com mock por falta de endpoints.
- **Validação** (rodada ao fim da Etapa 3): `npx tsc --noEmit` ✅ · `npx next build` ✅ · `eslint` nos arquivos tocados ✅ (só 1 aviso antigo em arquivo protegido).
- **Não validado**: nenhum teste manual no navegador nem contra o backend real foi executado nesta sessão. A conformidade com o contrato foi garantida por tipagem, schemas Zod e leitura da spec.

| Etapa | Entrega | Status |
|---|---|---|
| 1 | Fundação: cliente HTTP, tipos, schemas Zod, service, helpers | ✅ |
| 2 | Visão Geral `/ranking-condutores` (seções 4.1–4.6 e 5.1–5.5) | ✅ |
| 3 | Parâmetros (4.7–4.10) e Performance de Condutores (4.11–4.12) | ✅ |

## 2. Arquitetura (Etapa 1 — fundação)

- **`driverScoringApi`** (`src/services/api.ts`): instância Axios com baseURL `${NEXT_PUBLIC_API_GATEWAY}/api-driver-scoring` (barra final removida; fallback do gateway `https://api.master-mobility.com`).
  - Compartilha com `api` os mesmos interceptors (`Authorization: Bearer`, refresh em 401).
  - O `/auth/refresh` continua em `NEXT_PUBLIC_API_GATEWAY`.
  - Há um único `renewingPromise` (Promise Lock): nunca ocorrem dois refreshes simultâneos.
- **Service** (`src/services/driver-scoring.service.ts`): 12 endpoints do dashboard + 5 selects (company, unit, department, costcenter, manager).
  - Fluxo de cada chamada: `sanitizeParams` → Zod (whitelist + faixas) → `sanitizeParams` → Axios.
  - Motivo: o backend usa `forbidNonWhitelisted` (query desconhecida = 400) e UUID vazio quebra.
  - Selects dependentes (`department`, `costcenter`, `manager`) não disparam requisição sem `company_id` (o backend retornaria `[]`).
- **Tipos**: `src/types/driver-scoring.ts` (espelha o contrato; nomenclatura mista camelCase/snake_case **proposital**).
- **Schemas Zod**: `src/schemas/driver-scoring.ts` (rotas) e `src/schemas/ranking-search-params.ts` (query string do detalhe de parâmetro).
- **Helpers**:
  - `driver-scoring-helpers.ts`: `getEventTypeLabel`, `getClassificationStyle`, `formatScore`, `displayValue`, `getDriverPerformancePath`.
  - `driver-scoring-display.ts`: `formatDate`, `formatDateTime`, `maskDocument`, `EXPOSURE_LEVELS`, `getEventTypeIcon`, `getSeverityClassName`.
  - `csv.ts`, `sanitize-params.ts`, `api-error.ts`, `ranking-filtros.ts`, `ranking-search-params.ts`.
- **Hooks próprios** (sem adicionar React Query, para evitar nova dependência):
  - `useApiQuery`: `data/isLoading/error/refetch`, deduplicação, descarte de respostas atrasadas, `enabled`.
  - `useDebouncedValue`, `useRankingFilterOptions`, `useRankingPageFilters`, `useResettablePage`.
- **Padrões de UI reutilizáveis**: `QueryState` (loading/erro/vazio com "Tentar novamente"), `PaginacaoSimples` (API sem total), `PaginacaoNumerada` (API com total), `ClassificationLabelBadge`, `DriverLink`, `FiltrosHierarquicos`, `GroupBySelector`.

## 3. Mapa tela → endpoint

| Tela | Rota | Endpoints | Etapa |
|---|---|---|---|
| Visão Geral | `/ranking-condutores` | 4.1 ranking, 4.2 categorias, 4.3 distribuição, 4.4 evolução anual, 4.5 top referência, 4.6 menores pontuações, 4.8 volume de eventos, 4.10 fadiga, 5.1–5.5 selects | 2 e 3 |
| Parâmetros | `/ranking-condutores/dashboard-parametros` | 4.7, 4.8, 4.10 | 3 |
| Detalhe do Parâmetro | `/ranking-condutores/dashboard-parametros/[id]` | 4.9 | 3 |
| Performance dos Condutores | `/ranking-condutores/performance-condutores` | 4.11 | 3 |
| Performance do Condutor | `/ranking-condutores/performance-condutores/[id]` | 4.12 | 3 |
| **Matriz de Pontuação** | `/ranking-condutores/matriz-pontuacao` | — (mock) | intocada |
| **Gestão de Exceções** | `/ranking-condutores/gestao-excecoes` | — (mock) | intocada |
| **Análises Preditivas** | `/ranking-condutores/analises-preditivas` | — (mock) | intocada |

As 3 telas em mock não têm endpoints no backend (Seções 0 e 7 da spec). Foi regra explícita **não alterá-las**; `git status` confirma.

## 4. Etapa 2 — Visão Geral

- Filtros em cascata: filial (`/company/select`) → unidade, departamento, centro de custo e gestor. O nome do condutor tem debounce de 400 ms.
- Cards de categorias (4.2), Top 10 (4.5/4.6), ranking Mensal/Anual (4.1), evolução anual (4.4) e distribuição com `groupBy` (4.3).
- **Ranking 4.1** filtra só por período e gestor (`managerId`); os demais filtros dariam 400. A tela exibe um aviso. O endpoint não retorna `total`, então a paginação libera "Próxima" enquanto `items.length === limit` (15).
- Os 3 gráficos mock de Unidade/Departamento/Filial viraram um único card com alternador.
- Evolução anual vazia em janeiro é esperada (sem mês fechado) e não é tratada como erro.

## 5. Etapa 3 — Parâmetros e Performance

### Parâmetros
- **4.7**: grupos `CRITICAL/HIGH/MEDIUM/LOW`, `event_type` traduzido com `getEventTypeLabel`, ordenado por `total` desc. Clique abre o detalhe preservando período, filtros e nível.
- **4.8**: barras horizontais com `event_type` traduzido.
- **4.10**: fadiga aguda × acumulada, lendo a chave dinâmica do `groupBy` (`department`/`unit`/`company`).
- **4.9** (`[id]` = `event_type` ou `all-events`): envia `year`, `month`, `page`, `limit` (15) e filtros hierárquicos.
  - Query string validada com Zod; UUID inválido é descartado.
  - Colunas: data (PT-BR), condutor, gestor, regional, centro de custo, departamento, unidade e classificação.
  - Paginação por `pagination.lastPage`.

### Performance
- **4.11**: tabela paginada (`items/total/page/limit/totalPages`) com todos os filtros.
  - Exportação Excel (CSV) via `export: true`.
  - Navegação **sempre por UUID**: `/ranking-condutores/performance-condutores/${item.id}/`.
- **4.12** (`[id]` = UUID, validado com Zod antes da requisição):
  - Cabeçalho (`driver`), KPIs (`indicators`), gráfico de 12 meses (`monthly_scores`).
  - Tabela `events` com paginação por `totalPages`.
  - Evento com `has_exception === true` aparece riscado, com selo "Desconsiderado" e `exception.justification`.
  - Mês opcional via "Todos os meses" (novo prop `opcaoTodosMeses` no `PeriodoSelector`).
  - A aba "Análise Preditiva" foi extraída para `driver-performance/driver-predictive-tab.tsx` e segue mock, com IRC derivado da pontuação real: `max(5, min(95, 100 - score))`.

## 6. Arquivos

**Criados**
- `src/types/driver-scoring.ts`, `src/types/ranking-filtros.ts`
- `src/schemas/driver-scoring.ts`, `src/schemas/ranking-search-params.ts`
- `src/services/driver-scoring.service.ts`
- `src/hooks/`: `use-api-query`, `use-debounced-value`, `use-ranking-filter-options`, `use-ranking-page-filters`, `use-resettable-page`
- `src/utils/`: `sanitize-params`, `api-error`, `classification-chart-data`, `ranking-filtros`, `driver-scoring-helpers`, `driver-scoring-display`, `csv`, `ranking-search-params`
- `src/components/`: `query-state`, `paginacao-simples`, `paginacao-numerada`, `classification-label-badge`, `driver-link`, `filtros-hierarquicos`, `group-by-selector`, `driver-category-cards`, `annual-evolution-chart`, `top-drivers-card`, `drivers-distribution-chart`, `ranking-parameters-cards`, `events-volume-chart`, `fatigue-distribution-chart`, `parameter-details-table`, `driver-performance-report`
- `src/components/driver-performance/`: `driver-performance-kpis`, `driver-monthly-scores-chart`, `driver-events-table`, `driver-predictive-tab`

**Modificados**
- `src/services/api.ts` (adicionado `driverScoringApi`, `applyAuthInterceptors`, `renewingPromise`)
- `src/components/`: `ranking-condutores`, `top-ranking-list`, `stat-card` (prop `classeCor`), `score-circle` (prop `classificacao`), `periodo-selector` (prop `opcaoTodosMeses`)
- Páginas: `ranking-condutores/page.tsx`, `dashboard-parametros/page.tsx` e `[id]/page.tsx`, `performance-condutores/page.tsx` e `[id]/page.tsx`
- `PROJECT.md`

**Mocks que ficaram sem uso nas páginas integradas, mas foram mantidos** (outras telas ainda usam parte deles): `mock-parametros-ranking`, `mock-eventos-parametro`, `mock-eventos-condutor`, `mock-graficos-dashboard`. Também foram mantidos `FiltroBarra` e `ClassificationBadge`.

## 7. Decisões técnicas relevantes

1. **Sem React Query**: `useApiQuery` próprio, para evitar dependência nova (a skill de segurança exige `scan_dependencies` antes).
2. **Cada seção busca seus dados** e trata seu próprio loading/erro/vazio; uma falha isolada não derruba a página.
3. **Rate limit (20 req/s)**: debounce no nome, deduplicação de requisições e selects dependentes sem chamada desnecessária.
4. **Página volta para 1** quando a "assinatura" dos filtros muda (`useResettablePage`, sem `useEffect`).
5. **URL é entrada não confiável**: validada com Zod; ids inválidos são descartados.
6. **PII**: `driver.document` é sempre exibido com `maskDocument` (`***` + 4 últimos dígitos) e nunca é logado.
7. **CSV seguro**: textos iniciados por `=`, `+`, `-` ou `@` recebem apóstrofo (injeção de fórmula). Números ficam intactos.
8. **Sem `dangerouslySetInnerHTML` e sem `console.log` de dados.**
9. **Cores de classificação** (Referência verde, Baixa azul, Média amarelo, Alta vermelho) via `getClassificationStyle`. Diferem das variáveis CSS do `ClassificationBadge` mock; unificar quando as demais telas migrarem.

## 8. Limitações e pendências (ação sugerida)

| Item | Impacto | Sugestão |
|---|---|---|
| `analises-preditivas` (intocada) linka para o detalhe pelo **nome** | Links dão erro, pois o `[id]` agora exige UUID | Integrar a tela ou ajustar os links quando houver endpoint |
| 4.9 não retorna id do condutor | Linhas do detalhe de parâmetro **não são clicáveis** | Pedir ao backend para incluir `driver_id` |
| 4.1 não retorna `total` | Última página pode vir vazia se o total for múltiplo de 15 | Pedir `total` ao backend |
| Aba "Análise Preditiva" é mock | IRC é heurística, não dado real | Aguardar endpoints preditivos |
| Tokens ainda em `localStorage`/cookie pelo auth legado compartilhado | `TODO(security)` pré-existente | Migrar para cookie `HttpOnly` no legado |
| Listagem 4.11 considera só meses fechados | Mês posterior ao último fechado é substituído pelo backend | Já sinalizado na UI |
| `PeriodoSelector` tem anos fixos (2024–2026) | Precisa de manutenção anual | Gerar a lista dinamicamente |
| Aviso de lint em `analises-preditivas/page.tsx` (`HeatmapGrid` sem uso) | Cosmético | Corrigir quando a tela puder ser editada |
| Erro de lint pré-existente em `charts/gauge-chart.tsx` | Não relacionado a esta integração | Corrigir à parte |

## 9. Como validar

```bash
npx tsc --noEmit
npx eslint src
npx next build
```

Variáveis de ambiente (ver `.env.example`): `NEXT_PUBLIC_API_GATEWAY`, `NEXT_PUBLIC_TOKEN_NAME`, `NEXT_PUBLIC_REFRESH_TOKEN_NAME`. Não existe variável própria do driver-scoring: tudo passa pelo Gateway em `/api-driver-scoring`.

Smoke test manual recomendado, com token válido:
1. `/ranking-condutores`: trocar filial e conferir a cascata e os cards.
2. `/dashboard-parametros`: clicar em um card e verificar o detalhe 4.9 e a paginação.
3. `/performance-condutores`: filtrar, paginar, exportar Excel e abrir um condutor (a URL deve conter UUID).
4. Detalhe do condutor: alternar "Todos os meses" e verificar eventos com exceção.
