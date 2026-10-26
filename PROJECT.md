# Fleeting Master Mobility

Micro frontend que futuramente absorverá módulos do **Master Mobility** (software de gestão de frotas).

## Stack Tecnológica

- **Framework**: Next.js 16 (App Router) + React 19
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4
- **Componentes UI**: shadcn/ui
- **Ícones**: Lucide React
- **Validação**: Zod
- **Mapas**: Leaflet 1.9 (uso imperativo, sem react-leaflet)
- **HTTP Client**: Axios (instalado, pronto para integrações futuras)

---

## Componentes

### Componentes do Projeto

| Componente | Arquivo | Propósito |
|---|---|---|
| **StatCard** | `src/components/stat-card.tsx` | Card de KPI/Estatística. Exibe métricas com título, valor, subtítulo, ícone e variantes de cor (ou `classeCor` para cor customizada, ex.: vinda de `getClassificationStyle`). Suporta clique e acessibilidade via teclado. |
| **ClassificationBadge** | `src/components/classification-badge.tsx` | Badge de classificação de risco do condutor (Referência, Baixa, Média, Alta). Aceita dois tamanhos (sm/md). |
| **TopRankingList** | `src/components/top-ranking-list.tsx` | Lista Top 10 genérica e apresentacional (recebe `linhas`, `isLoading`, `erro`, `onRetry`). Configurável para exibir ou ocultar coluna de classificação. Nome do condutor linka para o detalhe via UUID. |
| **TopDriversCard** | `src/components/top-drivers-card.tsx` | Conecta a `TopRankingList` à API: `variante="referencia"` (4.5, Top 10 Referência) ou `"menores"` (4.6, 10 menores pontuações). |
| **FiltroBarra** | `src/components/filtro-barra.tsx` | Barra de filtros (mock) com input de busca por nome e selects para gestor, filial, departamento e unidade. Validação com Zod. Ainda usada nas páginas não integradas à API. |
| **FiltrosHierarquicos** | `src/components/filtros-hierarquicos.tsx` | Barra de filtros integrada à API (seção 5): nome + Filial, Unidade, Departamento, Centro de Custo e Gestor em cascata (trocar a filial zera os dependentes). Validação com Zod. |
| **DriverCategoryCards** | `src/components/driver-category-cards.tsx` | Cards de classificação da Visão Geral (4.2), com skeleton/erro/vazio. |
| **DriversDistributionChart** | `src/components/drivers-distribution-chart.tsx` | Gráfico de condutores por classificação com troca de agrupamento Departamento/Unidade/Filial (4.3). |
| **AnnualEvolutionChart** | `src/components/annual-evolution-chart.tsx` | Evolução anual da classificação (4.4). Trata o estado vazio de janeiro (sem meses fechados). |
| **QueryState** / **ListSkeleton** / **ChartSkeleton** | `src/components/query-state.tsx` | Padrão único de loading (skeleton na 1ª carga, conteúdo esmaecido nas recargas), erro (mensagem + "Tentar novamente") e vazio. Reutilizar em toda tela integrada à API. |
| **PaginacaoSimples** | `src/components/paginacao-simples.tsx` | Paginação anterior/próxima para APIs sem `total` (próxima habilitada enquanto a página vier cheia). |
| **ClassificationLabelBadge** | `src/components/classification-label-badge.tsx` | Badge de classificação a partir do label dinâmico da API (cor via `getClassificationStyle`). |
| **DriverLink** | `src/components/driver-link.tsx` | Nome do condutor com link para `/ranking-condutores/performance-condutores/<uuid>/`. |
| **PeriodoSelector** | `src/components/periodo-selector.tsx` | Seletor de período (mês e ano). Fica separado da barra de filtros, na parte superior da página. Prop opcional `opcaoTodosMeses` adiciona "Todos os meses" (valor vazio) para telas com mês opcional. |
| **PaginacaoNumerada** | `src/components/paginacao-numerada.tsx` | Paginação com números de página e "Exibindo X–Y de Z" para APIs que informam o total (`lastPage`/`totalPages`). |
| **GroupBySelector** | `src/components/group-by-selector.tsx` | Alternador Departamento/Unidade/Filial (`groupBy`). Exporta `GROUP_BY_OPTIONS` e `getGroupByLabel`. Usado nos gráficos 4.3 e 4.10. |
| **RankingParametersCards** | `src/components/ranking-parameters-cards.tsx` | Cards de eventos por nível de exposição (4.7): grupos CRITICAL/HIGH/MEDIUM/LOW, nomes traduzidos e ordenados por `total` desc. Clique abre o detalhe (4.9) preservando período e filtros. |
| **EventsVolumeChart** | `src/components/events-volume-chart.tsx` | Barras horizontais com o volume de eventos por tipo (4.8). |
| **FatigueDistributionChart** | `src/components/fatigue-distribution-chart.tsx` | Fadiga aguda × acumulada (4.10) com `groupBy` dinâmico (`department`, `unit` ou `company`). Prop `groupByInicial`. |
| **ParameterDetailsTable** | `src/components/parameter-details-table.tsx` | Drill-down de um evento (4.9): tabela paginada por `lastPage`, data em PT-BR. Linhas **não** são clicáveis (a API não devolve o id do condutor). |
| **DriverPerformanceReport** | `src/components/driver-performance-report.tsx` | Listagem analítica de performance (4.11): tabela paginada, link por UUID e exportação Excel (CSV) com `export: true`. |
| **DriverPerformanceKpis** | `src/components/driver-performance/driver-performance-kpis.tsx` | Cards de indicadores do condutor (4.12): acumulado do ano, último mês fechado (+ classificação) e pontuação do mês. `null` vira "-". |
| **DriverMonthlyScoresChart** | `src/components/driver-performance/driver-monthly-scores-chart.tsx` | Evolução mensal (12 meses) do condutor; mês sem dado (`null`) fica sem barra. |
| **DriverEventsTable** | `src/components/driver-performance/driver-events-table.tsx` | Eventos/infrações do condutor com paginação. Sinaliza `has_exception` (evento riscado + selo "Desconsiderado" com a justificativa). |
| **DriverPredictiveTab** | `src/components/driver-performance/driver-predictive-tab.tsx` | Aba "Análise Preditiva" (mock): IRC derivado da pontuação real e seções em desenvolvimento. |
| **InfoTooltip** | `src/components/info-tooltip.tsx` | Ícone "i" com tooltip explicativo. Usa Tooltip do shadcn/ui. Props opcionais `iconeClassName` e `conteudoClassName` para customizar o visual (usadas no Painel de Gestão). |
| **RankingCondutores** | `src/components/ranking-condutores.tsx` | Tabela de ranking integrada à API (4.1) com abas Mensal/Anual, paginação sem total (`PaginacaoSimples`) e scroll lateral na aba anual (12 meses, "-" quando `null`). Props: `ano`, `mes`, `managerId`. |
| **ScoreCircle** | `src/components/score-circle.tsx` | Indicador circular de pontuação mensal. Prop opcional `classificacao` (label da API) define a cor via `getClassificationStyle`. Usado na aba anual do ranking. |
| **TabelaPontuacao** | `src/components/tabela-pontuacao.tsx` | Tabela de Pontuação por Evento da Matriz. Exibe Origem (badge colorido), Evento e Pontuação. Destaque em vermelho para -100 pts. |
| **ClassificacaoGrid** | `src/components/classificacao-grid.tsx` | Grid de cards coloridos com as faixas de classificação dos condutores (Referência, Baixa, Média, Alta). |
| **RegrasCalculoLista** | `src/components/regras-calculo-lista.tsx` | Lista numerada de regras de cálculo do ranking. Suporta destaques (strong) normais e em cor de perigo. |
| **PeriodicidadeSecao** | `src/components/periodicidade-secao.tsx` | Seção de periodicidade de atualização do ranking. Ícone de relógio e textos com destaques. |
| **ParametroCard** | `src/components/parametro-card.tsx` | Card de indicador de parâmetro do ranking. Cor de fundo, ícone Lucide, label e total de eventos. Clicável com suporte a teclado. |
| **ScrollCarousel** | `src/components/scroll-carousel.tsx` | Carrossel horizontal genérico com drag-to-scroll, setas de navegação no hover e fade visual. Reutilizável para qualquer conteúdo com scroll horizontal. |
| **AppSidebar** | `src/components/app-sidebar.tsx` | Menu lateral de navegação com logo, links com ícones, submenus colapsáveis, estado colapsado/expandido, suporte mobile com overlay e breadcrumb dinâmico no header (seção "Gestão de Frotas" ou "Ranking de Condutores"). Aplica o tema Índigo nas rotas `/painel-de-gestao`. |

### Componentes do Painel de Gestão (`src/components/painel-gestao/`)

Painéis e blocos da tela `/painel-de-gestao` (identidade Índigo, fonte Poppins). Todos recebem os dados via props, então basta trocar os mocks pela API.

- **PainelCard** (`painel-card.tsx`) — Card base do painel (título, contador opcional, ação "Ver Todos"). Reutilizado por tabelas, atividade, KM e manutenção.
- **StatusBadge** (`status-badge.tsx`) — Badge de status em caixa alta (CRÍTICO, ATENÇÃO, CNH VENCIDA…) com variantes de cor.
- **PlacaMercosul** (`placa-mercosul.tsx`) — Placa estilizada no padrão Mercosul (faixa azul + BR). Usada no drawer e na lista de veículos.
- **FiltroSelect** (`filtro-select.tsx`) — Select compacto do cabeçalho; valida o valor escolhido com Zod contra as opções.
- **DashboardHeader** (`dashboard-header.tsx`) — Título "Painel de Gestão", período, selo "Dados simulados", filtros (Mês, Ano, Grupo, Locadora) e botões Cadastrar / Abrir O.S. Exporta `FiltrosPainel` e `rotuloPeriodo`.
- **KpiCards** (`kpi-cards.tsx`) — Linha com os 5 KPIs (Veículos, Condutores, TCO, Custo/km, Abastecimento) com tooltip, badge de variação e drawer (Sheet) de detalhamento ao clicar.
- **VeiculosAtencaoTabela / CondutoresAtencaoTabela** (`attention-tables.tsx`) — Tabelas "que exigem atenção". Clicar numa linha foca o veículo no mapa.
- **RecentActivity** (`recent-activity.tsx`) — Linha do tempo de atividades recentes com marcador colorido por tipo.
- **TcoSummary** (`tco-summary.tsx`) — Card escuro "Resumo do TCO" com barra empilhada e breakdown de custos. Usa container query para se adaptar a colunas estreitas.
- **KmChart** (`km-chart.tsx`) — Barras mensais de KM rodados em CSS puro (sem Recharts), com destaque dourado no mês de pico.
- **MaintenanceSummary** (`maintenance-summary.tsx`) — Grade 2×2 de manutenção (Rev. vencidas, a vencer, em oficina, sinistros).
- **AiFleetAssistant** (`ai-fleet-assistant.tsx`) — Barra de pergunta à IA com chips de sugestões, estado "Analisando dados da frota...", resposta com efeito de digitação, mini-cards de métricas e botões "Focar … no mapa". Pergunta validada com Zod.
- **ai-respostas.ts** — Perguntas sugeridas, etapas da análise e `gerarRespostaIA()` (respostas demonstrativas por intenção ou por placa citada).
- **FleetMap** (`fleet-map.tsx`) — Mapa Leaflet da frota (Client Component). Modo Macro (zoom < 6: bolhas por UF sobre o GeoJSON das UFs) e Micro (clusters em grade até o zoom 14 e pinos com placa a partir do 15). Carrega veículos por viewport, tem filtros, legenda, lista lateral, troca de tiles, modo expandido (Esc fecha) e recebe `comandoFoco` para centralizar um veículo.
- **FleetMapSkeleton** (`fleet-map-skeleton.tsx`) — Skeleton do mapa exibido enquanto o chunk do Leaflet carrega (`next/dynamic`).
- **mapa/MapControls** (`mapa/map-controls.tsx`) — Botões flutuantes: visão Brasil, zoom +/− e troca de tiles (claro/padrão/escuro).
- **mapa/MapFilterBar** (`mapa/map-filter-bar.tsx`) — Busca (placa, condutor, modelo) e chips de status com contagem. Busca validada com Zod.
- **mapa/MapLegend** (`mapa/map-legend.tsx`) — Legenda de status (Micro) ou escala de regiões (Macro).
- **mapa/FleetListSidebar** (`mapa/fleet-list-sidebar.tsx`) — Lista lateral de veículos visíveis no modo expandido (mesma fonte de dados do mapa).
- **mapa/VehicleDrawer** (`mapa/vehicle-drawer.tsx`) — Drawer (Sheet) com detalhes do veículo: placa, condutor (telefone mascarado), telemetria, filial, grupo e alerta.
- **mapa/marcadores.ts** — Fábrica dos `divIcon` (bolhas de UF, clusters e pinos). Monta o DOM com `createElement`/`textContent` (sem `innerHTML`).
- **mapa/cluster.ts** — Agrupamento em grade (pixels) conforme o zoom.
- **mapa/config.ts** — Tiles, limites do Brasil, níveis de zoom e cores/rótulos por status, categoria e região.
- **mapa/dados-frota.ts** — Frota mock (52 veículos) e funções no formato da futura API: `fetchMacro`, `fetchVehiclesByMultipleStates`, `fetchVehicleByPlate`, `obterVeiculoPorPlaca`, `obterResumoFrota`.
- **mapa/estados-brasil.ts** — 27 UFs com centroide e região.
- **mapa/brasil-ufs.geo.json** — Divisas das UFs (malha do IBGE simplificada), carregadas sob demanda.
- **mapa/fleet-map.css** — Estilos dos marcadores, popups e controles do Leaflet (prefixo `fm-`).

### Hooks

- **useEfeitoDigitacao** (`src/hooks/use-efeito-digitacao.ts`) — Revela um texto aos poucos (efeito máquina de escrever). Respeita `prefers-reduced-motion`.
- **useApiQuery** (`src/hooks/use-api-query.ts`) — Busca dados de uma função de service com `data`, `isLoading`, `error` e `refetch`. Refaz a busca quando os params mudam, descarta respostas atrasadas, mantém o último dado durante recargas e deduplica requisições idênticas em andamento. Aceita `enabled`.
- **useDebouncedValue** (`src/hooks/use-debounced-value.ts`) — Atrasa a propagação de um valor (usado no filtro de nome, 400 ms).
- **useRankingFilterOptions** (`src/hooks/use-ranking-filter-options.ts`) — Carrega os combos em cascata (5.1 a 5.5) a partir da filial selecionada.
- **useRankingPageFilters** (`src/hooks/use-ranking-page-filters.ts`) — Estado de período (mês/ano) + filtros hierárquicos + opções dos combos + `filtrosApi` (nome com debounce). Usado por Visão Geral, Parâmetros e Performance. Exporta `NOMES_MESES`.
- **useResettablePage** (`src/hooks/use-resettable-page.ts`) — Página atual de tabelas paginadas que volta para 1 quando a "assinatura" dos filtros muda (sem `useEffect`).

### Utilitários

- **getApiErrorMessage** (`src/utils/api-error.ts`) — Converte erros (Axios/Zod/desconhecido) em mensagens amigáveis em PT-BR.
- **buildClassificationChartData** (`src/utils/classification-chart-data.ts`) — Converte classificações dinâmicas da API em linhas e séries para os gráficos de barras (chaves seguras `c0`, `c1`...).
- **toHierarchyFilters** (`src/utils/ranking-filtros.ts`) — Converte o estado dos filtros da tela para os query params snake_case da API.
- **RANKING_ANNUAL_MONTHS, formatScore, displayValue, getDriverPerformancePath** (`src/utils/driver-scoring-helpers.ts`) — Colunas de meses da visão anual, formatação de pontuação, "-" para nulos e rota do detalhe do condutor.
- **formatDate, formatDateTime, maskDocument, getDynamicGroupName, EXPOSURE_LEVELS, getEventTypeIcon, getSeverityClassName** (`src/utils/driver-scoring-display.ts`) — Datas em PT-BR (fuso America/Sao_Paulo), documento mascarado (`***` + 4 últimos dígitos), nome do grupo dinâmico, níveis de exposição (título e cores), ícone por evento e cor da severidade.
- **buildCsv, downloadCsv, sanitizeCsvCell** (`src/utils/csv.ts`) — Exportação CSV compatível com Excel (BOM UTF-8, `;`), com proteção contra injeção de fórmula (`=`, `+`, `-`, `@` em textos).
- **parseParameterDetailsSearchParams, buildParameterDetailsQuery, getParameterDetailsPath** (`src/utils/ranking-search-params.ts`) — Lê/monta a query string do detalhe de parâmetro. O schema Zod (`src/schemas/ranking-search-params.ts`) descarta ids que não são UUID.

### Componentes de Gráficos Genéricos (`src/components/charts/`)

Componentes de gráfico reutilizáveis baseados em Recharts. Todos são genéricos e aceitam dados e configurações via props, permitindo reutilização para qualquer contexto.

| Componente | Arquivo | Propósito | Cobre (Lovable) |
|---|---|---|---|
| **BarChartVertical** | `src/components/charts/bar-chart-vertical.tsx` | Barras verticais genérico. Suporta múltiplas séries, empilhamento, linha de referência e scroll horizontal. | Evolução do Comportamento — Ano, Registros de Fadiga por Filial, Evolução do IRC no Ano |
| **BarChartHorizontal** | `src/components/charts/bar-chart-horizontal.tsx` | Barras horizontais genérico. Suporta séries empilhadas e barra única, com labels configuráveis. | Condutores por Unidade/Departamento/Filial x Comportamento, Eventos por Parâmetro |
| **GaugeChart** | `src/components/charts/gauge-chart.tsx` | Gauge/medidor radial semicircular. Faixas de cores e labels configuráveis via array. | IRC da Frota |
| **HeatmapGrid** | `src/components/charts/heatmap-grid.tsx` | Grid de calor (matriz). Labels de eixo, faixas de cor e tooltips configuráveis. | Heatmap de risco por dia × hora |

> **Barrel export**: `import { BarChartVertical, GaugeChart, ... } from "@/components/charts"`

### Componentes shadcn/ui

| Componente | Arquivo |
|---|---|
| Tooltip | `src/components/ui/tooltip.tsx` |
| Tabs | `src/components/ui/tabs.tsx` |
| Button | `src/components/ui/button.tsx` |
| Sheet (drawer lateral) | `src/components/ui/sheet.tsx` |
| Skeleton | `src/components/ui/skeleton.tsx` |

---

## Tipos

| Tipo | Arquivo | Propósito |
|---|---|---|
| `ClassificacaoType` | `src/types/condutor.ts` | Union type para classificação de risco |
| `Condutor` | `src/types/condutor.ts` | Interface principal do condutor no ranking |
| `OpcoesFiltro` | `src/types/condutor.ts` | Opções disponíveis para filtros |
| `FiltrosState` | `src/types/condutor.ts` | Estado atual dos filtros |
| `OrigemEvento` | `src/types/matriz-pontuacao.ts` | Union type para origens de eventos (Telemetria, Multa, Registro) |
| `EventoPontuacao` | `src/types/matriz-pontuacao.ts` | Linha da tabela de pontuação (origem + evento + pontuação) |
| `ClassificacaoFaixa` | `src/types/matriz-pontuacao.ts` | Faixa de classificação com cor e intervalo de pontuação |
| `RegraCalculo` | `src/types/matriz-pontuacao.ts` | Regra de cálculo numerada com destaques |
| `ItemPeriodicidade` | `src/types/matriz-pontuacao.ts` | Item descritivo de periodicidade |
| `GrupoImpacto` | `src/types/parametro-ranking.ts` | Union type para grupos de impacto (alta, media, baixa) |
| `ParametroRanking` | `src/types/parametro-ranking.ts` | Parâmetro/indicador do ranking (id, label, total, icone, grupo) |
| `GrupoImpactoConfig` | `src/types/parametro-ranking.ts` | Configuração visual de um grupo de impacto (cor, label) |
| `KpiGestao`, `VeiculoAtencao`, `CondutorAtencao`, `AtividadeRecente`, `ItemTco`, `ItemManutencao`, `BarraKm` | `src/types/painel-gestao.ts` | Tipos dos blocos do Painel de Gestão |
| `StatusVeiculo`, `CategoriaVeiculo`, `EstadoBrasil`, `VeiculoFrota`, `ItemCluster`, `FiltrosMapa`, `ComandoFocoMapa` | `src/types/frota-mapa.ts` | Contratos do mapa da frota (macro por UF, micro por veículo, filtros e comando de foco) |
| Tipos de Request/Response do `api-driver-scoring` (ranking, categorias, distribuição, parâmetros, performance, selects) | `src/types/driver-scoring.ts` | Contrato fiel do backend de Ranking de Condutores (spec `API_DRIVER_SCORING_SPEC.md`) |

---

## Camada de Serviços (Ranking de Condutores)

Integração com o backend `api-driver-scoring` (spec: `API_DRIVER_SCORING_SPEC.md`).

- **`driverScoringApi`** (`src/services/api.ts`) — Instância Axios com baseURL `NEXT_PUBLIC_API_DRIVER_SCORING` (fallback `https://api-driver-scoring.master-mobility.com`). Usa os mesmos interceptors da `api` (token Bearer + refresh em 401 com Promise Lock).
- **`driver-scoring.service.ts`** (`src/services/`) — Funções dos 12 endpoints do dashboard (`getRanking`, `getDriverCategories`, `getDriversDistribution`, `getAnnualClassificationEvolution`, `getTopReferenceDrivers`, `getBottomScoringDrivers`, `getRankingParameters`, `getEventsVolume`, `getRankingParameterDetails`, `getFatigueDistribution`, `getDriverPerformanceList`, `getDriverPerformanceDetail`) e dos 5 selects (`getCompanyOptions`, `getUnitOptions`, `getDepartmentOptions`, `getCostCenterOptions`, `getManagerOptions`).
- **`schemas/driver-scoring.ts`** (`src/schemas/`) — Schemas Zod de cada rota. Validam e fazem whitelist dos query params (chaves fora da matriz da seção 3 da spec são descartadas).
- **`sanitizeParams`** (`src/utils/sanitize-params.ts`) — Remove chaves `undefined`, `null` e `""` antes do envio.
- **`EVENT_TYPE_LABELS` / `getEventTypeLabel`** (`src/utils/driver-scoring-helpers.ts`) — Traduz códigos de evento para PT-BR (fallback: `SNAKE_CASE` -> Title Case).
- **`getClassificationStyle`** (`src/utils/driver-scoring-helpers.ts`) — Cor semântica (hex + classes Tailwind) a partir do texto da classificação: Referência = verde, Baixa = azul, Média/Moderada = amarelo, Alta/Crítica = vermelho, outro = cinza.

---

## Dados Mock

| Arquivo | Propósito |
|---|---|
| `src/data/mock-condutores.ts` | Dados fictícios de 30 condutores com pontuações fixas e pontuações mensais determinísticas. Inclui função `getClassificacao()`, constante `MESES` e listas de opções para filtros. |
| `src/data/mock-matriz-pontuacao.ts` | Dados da Matriz de Pontuação: eventos com pontuação, classificações, regras de cálculo e periodicidade. |
| `src/data/mock-parametros-ranking.ts` | 19 indicadores do ranking agrupados por nível de impacto + configuração de cores dos grupos. |
| `src/data/mock-eventos-parametro.ts` | Eventos detalhados por parâmetro. Função `gerarEventosPorParametro()` com datas determinísticas. Interface `EventoDetalhe`. |
| `src/data/mock-eventos-condutor.ts` | Eventos individuais de um condutor. Função `gerarEventosCondutor()` determinística por nome. Interface `EventoCondutor`. |
| `src/components/painel-gestao/mock-data.ts` | Dados do Painel de Gestão (KPIs, tabelas de atenção, atividades, TCO, KM, manutenção, opções dos filtros e paleta Índigo). Fonte: `PAINEL_GESTAO_REF.md`. |
| `src/components/painel-gestao/mapa/dados-frota.ts` | Frota simulada de 52 veículos (placas Mercosul, grupos Comgás/Vivo/Coprel), gerada de forma determinística. |

---

## Páginas

| Página | Rota | Propósito |
|---|---|---|
| Painel de Gestão (protótipo) | `/painel-de-gestao` | Visão consolidada da frota: filtros, assistente de IA, 5 KPIs, veículos/condutores que exigem atenção, mapa Leaflet (Macro/Micro), atividade recente, resumo do TCO, KMs rodados e manutenção. Dados 100% mockados e sem exigência de token. |
| Dashboard Geral do Ranking | `/ranking-condutores` | **Integrada ao `api-driver-scoring`** (4.1 a 4.8, 4.10 e 5.1 a 5.5): filtros em cascata, cards de classificação, Top 10 Referência / 10 menores pontuações, Ranking completo (Mensal/Anual), Evolução Anual, Distribuição por Departamento/Unidade/Filial, Fadiga e Volume de Eventos. |
| Matriz de Pontuação | `/ranking-condutores/matriz-pontuacao` | **Mock** (sem endpoint no backend). Critérios, pesos e regras de cálculo do ranking. |
| Parâmetros do Ranking | `/ranking-condutores/dashboard-parametros` | **Integrada** (4.7, 4.8 e 4.10): eventos por nível de exposição, fadiga aguda × acumulada e volume por tipo. Cards clicáveis abrem o detalhe; botão "Ver todos os eventos" abre `all-events`. |
| Detalhamento de Parâmetro | `/ranking-condutores/dashboard-parametros/[id]` | **Integrada** (4.9): eventos paginados de um `event_type` (ou `all-events`). Período e filtros vêm da query string, validados com Zod. |
| Performance do Condutor | `/ranking-condutores/performance-condutores/[id]` | **Integrada** (4.12): `[id]` é o UUID. Cabeçalho, KPIs, evolução mensal e eventos paginados (com exceções sinalizadas). Aba Análise Preditiva segue mock (IRC derivado da pontuação real). |
| Performance dos Condutores | `/ranking-condutores/performance-condutores` | **Integrada** (4.11): listagem paginada com filtros hierárquicos, exportação Excel e navegação por UUID. |
| Gestão de Exceções | `/ranking-condutores/gestao-excecoes` | **Mock** (sem endpoint no backend). Histórico de exceções ao ranking. |
| Análises Preditivas | `/ranking-condutores/analises-preditivas` | **Mock** (sem endpoint no backend). IRC gauge, evolução mensal, top 10 IRC, zonas de risco, probabilidade e heatmap. |
| Demo de Gráficos | `/ranking-condutores/demo-graficos` | Demonstração dos componentes de gráficos genéricos (Sprint Review) |

---

## Decisões Técnicas

1. **Pontuações fixas nos dados mock**: Usamos valores pré-definidos ao invés de `Math.random()` em runtime para evitar hydration mismatch entre SSR e client-side no Next.js.

2. **Tailwind CSS v4**: Utilizamos a nova sintaxe do Tailwind v4 com `@import "tailwindcss"` e `@theme inline` para definir tokens de cor a partir de CSS custom properties.

3. **Componente TopRankingList genérico**: Criamos um único componente para ambas as listas Top 10 (Referência e Críticos) com a prop `mostrarClassificacao` controlando a exibição da coluna extra.

4. **Seletor de período separado**: Mês e ano ficam na parte superior (header da página), separados da barra de filtros de dados, conforme orientação do usuário.

5. **Validação com Zod**: Inputs da barra de filtros são validados com Zod antes de atualizar o estado, garantindo sanitização dos dados de entrada.

6. **Memoização**: Dados filtrados e contagens são calculados com `useMemo` para evitar recalculos desnecessários.

7. **Acessibilidade**: StatCard com `role="button"`, `tabIndex` e `onKeyDown` quando clicável. Selects e inputs com `aria-label`. InfoTooltip com `aria-label` no botão.

8. **Aba Anual com scroll lateral**: A aba anual tem colunas dinâmicas (uma por mês disponível), que podem exceder a largura da tela. Usamos `overflow-x-auto` com `minWidth` calculado para garantir scroll horizontal suave.

9. **Paginação inteligente**: Quando há muitas páginas, exibe reticências (…) para não poluir a UI, inspirado no padrão do Google.

10. **Pontuações mensais determinísticas**: Variações fixas são aplicadas à pontuação base de cada condutor para gerar dados mensais sem usar `Math.random()`, evitando hydration mismatch.

9. **Multi-Zone com o legado (`front-master-mobility`)**: Este projeto roda sob o mesmo domínio via Rewrite da Vercel. Todas as páginas ficam em `src/app/ranking-condutores/` para casar com a URL `/ranking-condutores`. O `assetPrefix: "/fleeting-static"` (em `next.config.ts`) evita conflito de chunks `/_next/static` com o legado.

10. **Autenticação compartilhada com o legado**: Cookies e `localStorage` já são compartilhados no navegador. Arquivos:
    - `src/utils/tokens.ts` — `getTokens`, `setTokens`, `resetTokens` (cookies via `js-cookie`).
    - `src/utils/auth.ts` — `redirectToLogin` (hard navigation, pois `/login` é do legado) e `getCurrentUser`.
    - `src/services/api.ts` — instância Axios com token no header e refresh automático em 401 (Promise Lock para evitar refresh simultâneo; falha => `resetTokens` + `redirectToLogin`). Resposta do refresh validada com Zod.
    - Variáveis de ambiente documentadas em `.env.example`.

### Painel de Gestão

- **Leaflet imperativo (sem react-leaflet)**: o mapa é criado com `useRef` + `L.map()`. Dá controle total de marcadores, animações e camadas, e evita conflito de peerDependencies do react-leaflet com o React 19.
- **SSR desligado só para o mapa**: o Leaflet acessa `window` ao ser importado. A página (Client Component) importa o `FleetMap` com `next/dynamic` e `{ ssr: false }`, mostrando o `FleetMapSkeleton` enquanto carrega (no Next 16, `ssr: false` só é permitido em Client Components).
- **Metadata em layout de servidor**: como a `page.tsx` é Client Component, o `title`/`description` ficam em `src/app/painel-de-gestao/layout.tsx`.
- **Fonte única de dados do mapa**: bolhas por UF, clusters, lista lateral e KPI "Veículos ativos" (52) derivam do mesmo array, então os números sempre batem.
- **GeoJSON das UFs embutido**: malha do IBGE simplificada (~88 KB), importada dinamicamente apenas pelo chunk do mapa.
- **DOM seguro nos marcadores**: os `divIcon` são montados com `createElement`/`textContent`, sem `innerHTML`, para evitar XSS quando os dados vierem da API.
- **`isolate` no container do mapa**: os panes do Leaflet usam z-index altos (400+). O `isolation: isolate` cria um novo contexto de empilhamento para o mapa não sobrepor drawers, tooltips e o painel da IA.
- **Tema Índigo escopado**: a classe `.tema-indigo` (em `globals.css`) sobrescreve as variáveis da sidebar apenas em `/painel-de-gestao`. Para torná-lo global, basta mover os valores para `:root`.
- **Poppins via `next/font`**: carregada em `src/app/layout.tsx` como variável `--font-poppins` e aplicada com a classe `.font-poppins` (drawers e popovers renderizam em portal, por isso também recebem a classe).
- **Tiles do OpenStreetMap apenas para demo**: em produção, trocar por um provedor com SLA/chave (a política de uso do OSM não permite tráfego intenso).
- **Correção no shadcn**: o `sheet.tsx` gerado vinha com `import { cn } from "cn"`; foi corrigido para `@/lib/utils`.
- **Rota fora de `/ranking-condutores`**: o painel funciona direto na URL da Vercel. No domínio principal (Multi-Zone), `/painel-de-gestao` hoje pertence ao legado. Será preciso um rewrite específico (ou mover a rota) antes de publicar ali.

### Integração com `api-driver-scoring`

- **Backend com baseURL própria**: o Ranking não passa pelo Gateway; já o `/auth/refresh` continua em `NEXT_PUBLIC_API_GATEWAY`. Por isso `api.ts` expõe `api` e `driverScoringApi`, ambas com `applyAuthInterceptors` e um único `renewingPromise` (nunca há dois refreshes simultâneos).
- **Sanitizar antes de validar**: o `ValidationPipe` do backend usa `forbidNonWhitelisted: true` (query desconhecida => 400) e UUID vazio quebra. Fluxo de cada chamada: `sanitizeParams` -> Zod (whitelist + faixas) -> `sanitizeParams` -> Axios.
- **`/dashboard/ranking` é especial**: aceita só `period, year, month, page, limit, managerId, export`. `month` é obrigatório no mensal (senão 500 no backend) e removido no anual. `manager_id` é convertido para `managerId`.
- **Selects dependentes**: `department`, `costcenter` e `manager` retornam `[]` sem `company_id`; o service nem faz a requisição (economiza rate limit de 20 req/s).
- **Cores de classificação**: seguem o pedido da tarefa (Referência verde, Baixa azul, Média amarelo, Alta vermelho) e diferem das variáveis CSS do `ClassificationBadge` atual (mock). Na Visão Geral, cards, badges e gráficos usam `getClassificationStyle`, então ficam consistentes entre si. Unificar com o `ClassificationBadge` quando as demais telas migrarem para a API.

### Visão Geral integrada à API

- **Sem biblioteca de cache**: em vez de adicionar React Query, criamos o `useApiQuery` (pequeno e sem dependências). Ele deduplica requisições idênticas em andamento (cobre o duplo efeito do StrictMode) e descarta respostas atrasadas.
- **Cada seção busca seus dados**: cards, listas, ranking e gráficos são componentes independentes (`QueryState` em cada um). Uma falha ou lentidão em um endpoint não derruba a página; cada seção tem seu "Tentar novamente".
- **Rate limit (20 req/s)**: o nome do condutor usa debounce de 400 ms; selects dependentes da filial não fazem requisição sem `company_id`; a página dispara ~8 requisições na abertura, bem abaixo do limite.
- **Tabela de ranking filtra só por período e gestor**: o endpoint 4.1 não aceita os demais filtros (400). A tabela exibe um aviso e os demais componentes aplicam todos os filtros.
- **Paginação sem total**: `PaginacaoSimples` habilita "Próxima" enquanto `items.length === limit` (15). Se o total for exato múltiplo de 15, a última página aparecerá vazia (limitação do contrato).
- **Página resetada por assinatura**: a página volta para 1 quando aba, período ou gestor mudam, guardando a assinatura junto da página (sem `useEffect` para sincronizar estado).
- **Gráficos de classificação dinâmicos**: as séries vêm dos próprios dados (`buildClassificationChartData`), pois as classificações são configuradas por organização. As chaves `c0`, `c1`... evitam que o Recharts interprete "." no label como caminho.
- **Um gráfico com `groupBy`**: os três gráficos mock (Unidade/Departamento/Filial) viraram um único card com alternador, usando o endpoint 4.3 (uma requisição em vez de três).
- **Evolução anual vazia em janeiro**: `[]` é esperado (regra de mês fechado) e exibe mensagem explicativa, não erro.
- **Botão Exportar**: o service suporta `export: true`; na tela de Performance dos Condutores o botão Excel já está ligado (ver Etapa 3).

### Parâmetros e Performance integrados (Etapa 3)

- **Telas que seguem mock (regra de ouro)**: `matriz-pontuacao`, `gestao-excecoes` e `analises-preditivas` não têm endpoints no backend (Seções 0 e 7 da spec) e não foram alteradas.
- **Navegação por UUID**: o detalhe do condutor usa sempre `item.id` na rota (`getDriverPerformancePath`), nunca o nome (armadilha da seção 8.2 da spec). O `identifier` também é validado com Zod no service.
- **4.9 sem navegação por linha**: `RankingParameterDetailRow` não traz o id do condutor, então as linhas do detalhe de parâmetro deixaram de ser clicáveis (antes, o mock navegava pelo nome).
- **URL como entrada não confiável**: o detalhe de parâmetro lê `year`, `month`, ids hierárquicos e `level` da query string. O schema Zod descarta UUIDs inválidos (`.catch(undefined)`) e usa o mês/ano atuais se vierem inválidos.
- **PII mascarada**: o `document` (CNH/CPF) do condutor é exibido com `maskDocument` (`***` + 4 últimos dígitos) e nunca é logado.
- **CSV seguro**: textos iniciados por `=`, `+`, `-` ou `@` recebem apóstrofo (injeção de fórmula no Excel). Números não são alterados.
- **Mês opcional no detalhe do condutor**: "Todos os meses" omite `month`; o backend lista eventos de todos os meses fechados e `current_month_score` passa a ser o do último mês fechado.
- **Listagem 4.11 considera só meses fechados**: o backend substitui um mês posterior ao último fechado pelo último fechado; a tela avisa isso quando não há dados.
- **Filtros e período compartilhados**: `useRankingPageFilters` evita repetir o estado de período/filtros em cada página; `useResettablePage` reaproveita a regra "volta para a página 1 quando os filtros mudam".
- **Links quebrados no mock `analises-preditivas`**: essa tela (não alterada) ainda linka para o detalhe pelo nome; como o `[id]` agora espera UUID, esses links mostram erro até a tela ser integrada.
