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
| **DriverPerformanceReport** | `src/components/driver-performance-report.tsx` | Listagem analítica de performance (4.11): tabela paginada, link por UUID e exportação Excel (CSV) com `export: true`. Prop opcional `classificacao` (`todos`/`referencia`/`baixa`/`media`/`alta`) filtra a listagem e a exportação (Tela 2). |
| **DriverPerformanceKpis** | `src/components/driver-performance/driver-performance-kpis.tsx` | Cards de indicadores do condutor (4.12): acumulado do ano, último mês fechado (+ classificação) e pontuação do mês. `null` vira "-". |
| **DriverMonthlyScoresChart** | `src/components/driver-performance/driver-monthly-scores-chart.tsx` | Evolução mensal (12 meses) do condutor; mês sem dado (`null`) fica sem barra. |
| **DriverEventsTable** | `src/components/driver-performance/driver-events-table.tsx` | Eventos/infrações do condutor com paginação. Sinaliza `has_exception` (evento riscado + selo "Desconsiderado" com a justificativa). Coluna **Ações** com "Aplicar exceção": habilitado só se `eligible === true` e o perfil for gestor (`canManageExceptions`); senão desabilitado com `ineligible_reason` no tooltip. Props: `driverId` (UUID), `events`, `pagination`, `onPaginaChange`, `onExceptionApplied` (refetch). |
| **ApplyExceptionDialog** | `src/components/driver-performance/apply-exception-dialog.tsx` | Modal para aplicar exceção (`POST /drivers/:driverId/events/:eventId/exceptions`). Justificativa 10–500 caracteres validada com Zod, contador, loading, erro por status HTTP (400/403/404/409/422) e resultado `scoreBefore → scoreAfter`. Usar com `key={evento.id}`. |
| **ExceptionsHistoryTable** | `src/components/exceptions/exceptions-history-table.tsx` | Histórico de exceções (`GET /exceptions`): busca por condutor (debounce 400 ms), `PaginacaoNumerada`, link por UUID e botão "Revogar" (só gestores). |
| **RevokeExceptionDialog** | `src/components/exceptions/revoke-exception-dialog.tsx` | Confirmação de revogação (`DELETE /exceptions/:id`); mostra a pontuação restaurada. Usar com `key={excecao.id}`. |
| **FatoresQuilometragem** | `src/components/fatores-quilometragem.tsx` | Tabela de fatores de quilometragem da Matriz de Pontuação (`km_factors`). |
| **DriverPredictiveTab** | `src/components/driver-performance/driver-predictive-tab.tsx` | Aba "Análise Preditiva" (mock): IRC derivado da pontuação real e seções em desenvolvimento. |
| **InfoTooltip** | `src/components/info-tooltip.tsx` | Ícone "i" com tooltip explicativo. Usa Tooltip do shadcn/ui. Props opcionais `iconeClassName` e `conteudoClassName` para customizar o visual (usadas na Torre de Controle). |
| **RankingCondutores** | `src/components/ranking-condutores.tsx` | Tabela de ranking integrada à API (4.1) com abas Mensal/Anual, paginação sem total (`PaginacaoSimples`) e scroll lateral na aba anual (12 meses, "-" quando `null`). Props: `ano`, `mes`, `managerId`. |
| **ScoreCircle** | `src/components/score-circle.tsx` | Indicador circular de pontuação mensal. Prop opcional `classificacao` (label da API) define a cor via `getClassificationStyle`. Usado na aba anual do ranking. |
| **TabelaPontuacao** | `src/components/tabela-pontuacao.tsx` | Tabela de Pontuação por Evento da Matriz. Exibe Origem (badge colorido, com estilo neutro para origens desconhecidas), Evento e Pontuação. Destaque em vermelho para -100 pts. |
| **ClassificacaoGrid** | `src/components/classificacao-grid.tsx` | Grid de cards coloridos com as faixas de classificação dos condutores (Referência, Baixa, Média, Alta). |
| **RegrasCalculoLista** | `src/components/regras-calculo-lista.tsx` | Lista numerada de regras de cálculo do ranking. Suporta destaques (strong) normais e em cor de perigo. |
| **PeriodicidadeSecao** | `src/components/periodicidade-secao.tsx` | Seção de periodicidade de atualização do ranking. Ícone de relógio e textos com destaques. |
| **ParametroCard** | `src/components/parametro-card.tsx` | Card de indicador de parâmetro do ranking. Cor de fundo, ícone Lucide, label e total de eventos. Clicável com suporte a teclado. |
| **ScrollCarousel** | `src/components/scroll-carousel.tsx` | Carrossel horizontal genérico com drag-to-scroll, setas de navegação no hover e fade visual. Reutilizável para qualquer conteúdo com scroll horizontal. |
| **AreaRolagemSuave** | `src/components/area-rolagem-suave.tsx` | Container com rolagem discreta: barra escondida até o hover (fina, índigo translúcida), degradê na base enquanto houver itens abaixo e `data-rolado` para sombra em cabeçalhos fixos. Usado pelo `TorreCard` com a prop `rolavel`. |
| **LogoMenu** | `src/components/logo-menu.tsx` | Logo do topo do menu lateral. Regras: menu recolhido => `iconeSite.png`; menu expandido => `logo.png`; rotas `/ranking-condutores*` com menu expandido => `DriverScore_Horizontal_Negativo.svg` (cores originais). Os PNGs (azuis) ficam brancos via `brightness-0 invert`. Props: `colapsado` e `ehRankingCondutores`. |
| **AppSidebar** | `src/components/app-sidebar.tsx` | Menu lateral de navegação com logo e itens definidos em `src/config/menu-navegacao.ts`: links do sistema legado (URL do ambiente atual via `getLegacyUrl`), links internos e grupos expansíveis não clicáveis (Ranking de Condutores, Cadastros). Botão **Sair** (só ícone, com `title`/`aria-label`) na mesma linha das informações do usuário no rodapé (`logout()`); recolhido, aparece só o ícone. Inclui estado colapsado/expandido, suporte mobile com overlay e barra compacta com botão de menu apenas no mobile (o breadcrumb do topo foi removido em todas as páginas; a navegação é feita só pelo menu). Aplica o tema Índigo nas rotas `/torre-de-controle`. |

### Componentes da Torre de Controle (`src/components/torre-de-controle/`)

Painéis e blocos da tela `/torre-de-controle` (identidade Índigo, fonte Poppins). Todos recebem os dados via props, então basta trocar os mocks pela API.

- **TorreCard** (`torre-card.tsx`) — Card base da Torre de Controle (título, contador opcional, ação "Ver Todos"). Reutilizado por tabelas, atividade, KM e manutenção. Com `rolavel`, o corpo usa o `AreaRolagemSuave`.
- **StatusBadge** (`status-badge.tsx`) — Badge de status em caixa alta (CRÍTICO, ATENÇÃO, CNH VENCIDA…) com variantes de cor.
- **PlacaMercosul** (`placa-mercosul.tsx`) — Placa estilizada no padrão Mercosul (faixa azul + BR). Usada no drawer e na lista de veículos.
- **FiltroSelect** (`filtro-select.tsx`) — Select compacto do cabeçalho; valida o valor escolhido com Zod contra as opções.
- **DashboardHeader** (`dashboard-header.tsx`) — Título "Torre de Controle", período, selo "Dados simulados", filtros (Mês, Ano, Grupo, Locadora) e botões Cadastrar / Abrir O.S. Exporta `FiltrosTorre` e `rotuloPeriodo`.
- **KpiCards** (`kpi-cards.tsx`) — Linha com os 5 KPIs (Veículos, Condutores, TCO, Custo/km, Abastecimento) com tooltip, badge de variação e drawer (Sheet) de detalhamento ao clicar. Prop opcional `conteudosPersonalizados` (`{ [idDoKpi]: ReactNode }`) troca a lista padrão do drawer por um conteúdo rico e alarga o drawer para 640px (usado no TCO).
- **DeltaBadge** (`delta-badge.tsx`) — Selo de variação (verde/vermelho/cinza). Exporta `variacaoDeCusto(percentual)`, que converte a variação de um custo nas props do selo (custo subindo = vermelho). Usado nos KPIs e no drawer do TCO.
- **SegmentedControl** (`segmented-control.tsx`) — Alternador em "pílula" com opções exclusivas (genérico, acessível com `radiogroup`). Valida o valor com Zod. Usado nos filtros do gráfico do TCO.
- **tco/TcoDetalhe** (`tco/tco-detalhe.tsx`) — Conteúdo do drawer "TCO do Mês": junta a evolução mensal e a composição; clicar em um mês do gráfico troca o mês da composição.
- **tco/TcoEvolucao** (`tco/tco-evolucao.tsx`) — Seção "Evolução do TCO" com filtros (6/12 meses, Composição/Tendência, chips de categoria) e resumo do período (média, maior, menor e variação).
- **tco/TcoEvolucaoChart** (`tco/tco-evolucao-chart.tsx`) — Gráfico Recharts do custo mês a mês: barras empilhadas por categoria ou área do total, linha de média, mês selecionado em destaque e tooltip escuro com o detalhamento.
- **tco/TcoComposicao** (`tco/tco-composicao.tsx`) — Composição do TCO de um mês (substitui o antigo card "Resumo do TCO"): total, média por veículo, variação vs. mês anterior, barra empilhada e detalhamento por categoria (valor, % e variação).
- **tco/tco-utils.ts** — Funções puras do TCO: `formatarMoedaCompacta`, `formatarMoeda`, `formatarEixoMil`, `formatarPercentual`, `totalDoMes`, `variacaoPercentual`.
- **VeiculosAtencaoTabela / CondutoresAtencaoTabela** (`attention-tables.tsx`) — Tabelas "que exigem atenção". Clicar numa linha foca o veículo no mapa.
- **RecentActivity** (`recent-activity.tsx`) — Linha do tempo de atividades recentes com marcador colorido por tipo.
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
- **useAmbiente** (`src/hooks/use-ambiente.ts`) — Ambiente atual (dev/demo/prod) pelo hostname, via `useSyncExternalStore` (no servidor devolve `prod`, evitando hydration mismatch em links que dependem do ambiente).

### Configuração

- **ITENS_MENU** (`src/config/menu-navegacao.ts`) — Fonte única dos itens do menu lateral. Cada link tem `destino: "legado"` (sistema principal, URL por ambiente) ou `"interno"` (rota deste projeto). Grupos têm `filhos` e, opcionalmente, `prefixoAtivo`. Para adicionar uma rota ao menu, basta incluí-la aqui. A Torre de Controle fica fora do menu (acesso só pela URL).
- **useApiQuery** (`src/hooks/use-api-query.ts`) — Busca dados de uma função de service com `data`, `isLoading`, `error` e `refetch`. Refaz a busca quando os params mudam, descarta respostas atrasadas, mantém o último dado durante recargas e deduplica requisições idênticas em andamento. Aceita `enabled`.
- **useDebouncedValue** (`src/hooks/use-debounced-value.ts`) — Atrasa a propagação de um valor (usado no filtro de nome, 400 ms).
- **useRankingFilterOptions** (`src/hooks/use-ranking-filter-options.ts`) — Carrega os combos em cascata (5.1 a 5.5) a partir da filial selecionada.
- **useRankingPageFilters** (`src/hooks/use-ranking-page-filters.ts`) — Estado de período (mês/ano) + filtros hierárquicos + opções dos combos + `filtrosApi` (nome com debounce). Usado por Visão Geral, Parâmetros e Performance. Exporta `NOMES_MESES`.
- **useResettablePage** (`src/hooks/use-resettable-page.ts`) — Página atual de tabelas paginadas que volta para 1 quando a "assinatura" dos filtros muda (sem `useEffect`).

### Utilitários

- **getApiErrorMessage, getExceptionActionErrorMessage** (`src/utils/api-error.ts`) — Converte erros (Axios/Zod/desconhecido) em mensagens amigáveis em PT-BR. 401 (sessão) e 403 (escopo/perfil) têm mensagens distintas; `getExceptionActionErrorMessage` trata 400/403/404/409/422 ao aplicar/revogar exceções.
- **canManageExceptions** (`src/utils/permissions.ts`) — Lê a claim `permission` do JWT (sem validar assinatura) e informa se o perfil é de gestor (FLEETING, ADMIN, MANAGER, SUPERADMIN, GESTOR). É só conveniência de UI: o backend é a autoridade (403). Se não conseguir determinar, retorna `true`.
- **mapRulesToEventos, mapClassificationsToFaixas** (`src/utils/scoring-matrix-mapper.ts`) — Adaptam `GET /dashboard/scoring-matrix` aos componentes `TabelaPontuacao` e `ClassificacaoGrid` (regras agrupadas Telemetria → Multa → Registro).
- **buildClassificationChartData** (`src/utils/classification-chart-data.ts`) — Converte classificações dinâmicas da API em linhas e séries para os gráficos de barras (chaves seguras `c0`, `c1`...).
- **toHierarchyFilters** (`src/utils/ranking-filtros.ts`) — Converte o estado dos filtros da tela para os query params snake_case da API.
- **RANKING_ANNUAL_MONTHS, formatScore, displayValue, getDriverPerformancePath, getCategoryFilter** (`src/utils/driver-scoring-helpers.ts`) — Colunas de meses da visão anual, formatação de pontuação, "-" para nulos, rota do detalhe do condutor e conversão do card (4.2) no filtro `classification` do 4.11.
- **formatDate, formatDateTime, maskDocument, getDynamicGroupName, EXPOSURE_LEVELS, getEventTypeIcon, getSeverityClassName** (`src/utils/driver-scoring-display.ts`) — Datas em PT-BR (fuso America/Sao_Paulo), documento mascarado (`***` + 4 últimos dígitos), nome do grupo dinâmico, níveis de exposição (título e cores), ícone por evento e cor da severidade.
- **buildCsv, downloadCsv, sanitizeCsvCell** (`src/utils/csv.ts`) — Exportação CSV compatível com Excel (BOM UTF-8, `;`), com proteção contra injeção de fórmula (`=`, `+`, `-`, `@` em textos).
- **parseParameterDetailsSearchParams, buildParameterDetailsQuery, getParameterDetailsPath, getCategoryPath** (`src/utils/ranking-search-params.ts`) — Lê/monta a query string do detalhe de parâmetro e a rota de Condutores por Categoria (reaproveitando período e filtros). Os schemas Zod (`src/schemas/ranking-search-params.ts`) descartam ids que não são UUID e validam o segmento `[categoria]`.

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
| Dialog (modal) | `src/components/ui/dialog.tsx` |
| Textarea | `src/components/ui/textarea.tsx` |

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
| `KpiTorre`, `VeiculoAtencao`, `CondutorAtencao`, `AtividadeRecente`, `CategoriaTco`, `CategoriaTcoId`, `MesTco`, `ItemManutencao`, `BarraKm` | `src/types/torre-de-controle.ts` | Tipos dos blocos da Torre de Controle |
| `StatusVeiculo`, `CategoriaVeiculo`, `EstadoBrasil`, `VeiculoFrota`, `ItemCluster`, `FiltrosMapa`, `ComandoFocoMapa` | `src/types/frota-mapa.ts` | Contratos do mapa da frota (macro por UF, micro por veículo, filtros e comando de foco) |
| Tipos de Request/Response do `api-driver-scoring` (ranking, categorias, distribuição, parâmetros, performance, selects) | `src/types/driver-scoring.ts` | Contrato fiel do backend de Ranking de Condutores (spec `API_DRIVER_SCORING_SPEC.md`) |
| `ExceptionItem`, `ExceptionsListResponse`, `ExceptionsQueryParams`, `CreateExceptionBody/Response`, `DeleteExceptionResponse` | `src/types/driver-scoring.ts` | Contrato da Gestão de Exceções (`frontend-integration-guide.md`, FLEET-2301) |
| `ScoringMatrixResponse`, `ScoringMatrixRule`, `ScoringMatrixClassification`, `ScoringMatrixKmFactor` | `src/types/driver-scoring.ts` | Contrato de `GET /dashboard/scoring-matrix` |
| `DriverClassificationFilter`, `DriverEventStatus` | `src/types/driver-scoring.ts` | Filtro `classification` do 4.11 e status do evento (`Confirmado`/`Desconsiderado`) |

---

## Camada de Serviços (Ranking de Condutores)

Integração com o backend `api-driver-scoring` (spec: `API_DRIVER_SCORING_SPEC.md`).

- **`driverScoringApi`** (`src/services/api.ts`) — Instância Axios com baseURL `${NEXT_PUBLIC_API_GATEWAY}/api-driver-scoring` (barra final da variável removida; fallback do gateway `https://api.master-mobility.com`). Usa os mesmos interceptors da `api` (token Bearer + refresh em 401 com Promise Lock).
- **`driver-scoring.service.ts`** (`src/services/`) — Funções dos 12 endpoints do dashboard (`getRanking`, `getDriverCategories`, `getDriversDistribution`, `getAnnualClassificationEvolution`, `getTopReferenceDrivers`, `getBottomScoringDrivers`, `getRankingParameters`, `getEventsVolume`, `getRankingParameterDetails`, `getFatigueDistribution`, `getDriverPerformanceList`, `getDriverPerformanceDetail`), dos 5 selects (`getCompanyOptions`, `getUnitOptions`, `getDepartmentOptions`, `getCostCenterOptions`, `getManagerOptions`) e, a partir da Etapa 4, da matriz (`getScoringMatrix`) e das exceções (`getExceptions`, `getException`, `createException`, `deleteException`).
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
| `src/components/torre-de-controle/mock-data.ts` | Dados da Torre de Controle (KPIs, tabelas de atenção, atividades, TCO (`CATEGORIAS_TCO` + `HISTORICO_TCO` com 12 meses), KM, manutenção, opções dos filtros e paleta Índigo). Fonte: `PAINEL_GESTAO_REF.md`. |
| `src/components/torre-de-controle/mapa/dados-frota.ts` | Frota simulada de 52 veículos (placas Mercosul, grupos Comgás/Vivo/Coprel), gerada de forma determinística. |

---

## Páginas

| Página | Rota | Propósito |
|---|---|---|
| Torre de Controle (protótipo) | `/torre-de-controle` | Visão consolidada da frota: filtros, assistente de IA, 5 KPIs, veículos/condutores que exigem atenção, mapa Leaflet (Macro/Micro), atividade recente, KMs rodados e manutenção. O KPI "TCO do Mês" abre um drawer com a evolução mensal do custo da frota (gráfico com filtros) e a composição do mês. Dados 100% mockados e sem exigência de token. |
| Dashboard Geral do Ranking | `/ranking-condutores` | **Integrada ao `api-driver-scoring`** (4.1 a 4.8, 4.10 e 5.1 a 5.5): filtros em cascata, cards de classificação, Top 10 Referência / 10 menores pontuações, Ranking completo (Mensal/Anual), Evolução Anual, Distribuição por Departamento/Unidade/Filial, Fadiga e Volume de Eventos. |
| Matriz de Pontuação | `/ranking-condutores/matriz-pontuacao` | **Integrada** (`GET /dashboard/scoring-matrix`): regras por evento, classificações e fatores de km vêm da API. Regras de cálculo e periodicidade seguem como texto estático. |
| Parâmetros do Ranking | `/ranking-condutores/dashboard-parametros` | **Integrada** (4.7, 4.8 e 4.10): eventos por nível de exposição, fadiga aguda × acumulada e volume por tipo. Cards clicáveis abrem o detalhe; botão "Ver todos os eventos" abre `all-events`. |
| Detalhamento de Parâmetro | `/ranking-condutores/dashboard-parametros/[id]` | **Integrada** (4.9): eventos paginados de um `event_type` (ou `all-events`). Período e filtros vêm da query string, validados com Zod. |
| Performance do Condutor | `/ranking-condutores/performance-condutores/[id]` | **Integrada** (4.12): `[id]` é o UUID. Cabeçalho, KPIs, evolução mensal e eventos paginados (com exceções sinalizadas). Aba Análise Preditiva segue mock (IRC derivado da pontuação real). |
| Performance dos Condutores | `/ranking-condutores/performance-condutores` | **Integrada** (4.11): listagem paginada com filtros hierárquicos, exportação Excel e navegação por UUID. |
| Condutores por Categoria | `/ranking-condutores/condutores-categoria/[categoria]` | **Integrada** (4.11 com `classification`): `[categoria]` = `todos`/`referencia`/`baixa`/`media`/`alta`. Aberta ao clicar nos cards da Visão Geral; período e filtros vêm na query string (validados com Zod). |
| Gestão de Exceções | `/ranking-condutores/gestao-excecoes` | **Integrada** (`GET /exceptions`, `DELETE /exceptions/:id`): histórico paginado com busca por condutor e revogação. A criação acontece no detalhe do condutor. Acesso restrito a perfis de gestor (403 para os demais). |
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
    - `src/utils/tokens.ts` — `getTokens`, `setTokens`, `resetTokens` (cookies via `js-cookie`). `resetTokens` limpa localStorage, sessionStorage e os cookies de token em todas as variantes de domínio (sem domain, host atual, `master-mobility.com` e `.master-mobility.com`), pois o js-cookie só remove com o mesmo `domain` da gravação.
    - `src/utils/auth.ts` — `logout()` (botão Sair): `resetTokens()` + `window.location.replace` para `/login/` do legado no ambiente atual.
    - `src/utils/env-config.ts` — além dos tokens e do Gateway, define a URL do front legado por ambiente (`getLegacyAppUrl`, `getLegacyUrl(path)`): `dev.master-mobility.com`, `demo.master-mobility.com` e `master-mobility.com`. Em `localhost` vale `dev`.
    - `src/utils/auth.ts` — `redirectToLogin` (sessão expirada; hard navigation para o `/login/` do legado no ambiente atual via `getLegacyUrl`, mantendo `callbackUrl`) e `getCurrentUser`.
    - `src/services/api.ts` — instância Axios com token no header e refresh automático em 401 (Promise Lock para evitar refresh simultâneo; falha => `resetTokens` + `redirectToLogin`). Resposta do refresh validada com Zod.
    - Variáveis de ambiente documentadas em `.env.example`.
    - `src/utils/env-config.ts` — **ambiente dinâmico (dev × demo × prod) pelo hostname**: o deploy é único (variáveis de produção) e atende `master-mobility.com`, `demo.master-mobility.com` e `dev.master-mobility.com` via Rewrite. Espelha as variáveis reais do legado:
      - **dev** (`dev.*`, `*-dev*` ou `localhost`): `token-mm-dev`, `refresh-token-mm-dev`, `https://dev-api.master-mobility.com`.
      - **demo** (`demo.*` ou `*-demo*`): `token-mm-demo`, `refresh-token-mm-new-demo`, `https://demo-api.master-mobility.com`.
      - **prod** (padrão): `NEXT_PUBLIC_*` com fallback `token-mm`, `refresh-token-mm`, `https://api.master-mobility.com`.
      - Exporta `getEnvironment`, `getTokenCookieName`, `getRefreshTokenCookieName`, `getApiGatewayUrl`, `getDriverScoringBaseUrl` e as listas `ACCESS_TOKEN_COOKIES`, `REFRESH_TOKEN_COOKIES`, `LEGACY_TOKEN_COOKIES`. Os Request Interceptors de `api` e `driverScoringApi` recalculam o `baseURL` a cada requisição (o valor do `axios.create` é só inicial). No servidor (sem `window`) vale sempre prod.
    - `getTokens` faz fallback (dev -> demo -> prod) **dentro do mesmo tipo de token**: access só busca access e refresh só busca refresh. `resetTokens` limpa access, refresh e legacy de todos os ambientes.

11. **Logos do menu via import estático**: o `LogoMenu` importa as imagens de `public/` (`import logo from "../../public/logo.png"`) em vez de usar `"/logo.png"`. No Multi-Zone, um caminho absoluto de `public/` seria resolvido pelo legado; o import estático gera a URL com o `assetPrefix` (`/fleeting-static`). Usa `unoptimized` para não depender do `/_next/image`. A cor branca vem de filtro CSS, sem arquivos extras. Menu expandido com `w-68` (272px) para a logo caber; no menu recolhido (`70px`) o ícone fica menor (`w-6`) para caber ao lado da seta de expandir, na mesma linha.

### Torre de Controle

- **Leaflet imperativo (sem react-leaflet)**: o mapa é criado com `useRef` + `L.map()`. Dá controle total de marcadores, animações e camadas, e evita conflito de peerDependencies do react-leaflet com o React 19.
- **SSR desligado só para o mapa**: o Leaflet acessa `window` ao ser importado. A página (Client Component) importa o `FleetMap` com `next/dynamic` e `{ ssr: false }`, mostrando o `FleetMapSkeleton` enquanto carrega (no Next 16, `ssr: false` só é permitido em Client Components).
- **Metadata em layout de servidor**: como a `page.tsx` é Client Component, o `title`/`description` ficam em `src/app/torre-de-controle/layout.tsx`.
- **Fonte única de dados do mapa**: bolhas por UF, clusters, lista lateral e KPI "Veículos ativos" (52) derivam do mesmo array, então os números sempre batem.
- **GeoJSON das UFs embutido**: malha do IBGE simplificada (~88 KB), importada dinamicamente apenas pelo chunk do mapa.
- **DOM seguro nos marcadores**: os `divIcon` são montados com `createElement`/`textContent`, sem `innerHTML`, para evitar XSS quando os dados vierem da API.
- **`isolate` no container do mapa**: os panes do Leaflet usam z-index altos (400+). O `isolation: isolate` cria um novo contexto de empilhamento para o mapa não sobrepor drawers, tooltips e o painel da IA.
- **Tema Índigo escopado**: a classe `.tema-indigo` (em `globals.css`) sobrescreve as variáveis da sidebar apenas em `/torre-de-controle`. Para torná-lo global, basta mover os valores para `:root`.
- **Poppins via `next/font`**: carregada em `src/app/layout.tsx` como variável `--font-poppins` e aplicada com a classe `.font-poppins` (drawers e popovers renderizam em portal, por isso também recebem a classe).
- **Tiles do OpenStreetMap apenas para demo**: em produção, trocar por um provedor com SLA/chave (a política de uso do OSM não permite tráfego intenso).
- **Correção no shadcn**: o `sheet.tsx` gerado vinha com `import { cn } from "cn"`; foi corrigido para `@/lib/utils`.
- **Rolagem discreta em vez da barra nativa**: listas com scroll (tabelas de atenção, atividade, painel da IA, drawer) usam a classe `.rolagem-suave` (barra invisível até o hover) e, nos cards, o `AreaRolagemSuave` (degradê na base + sombra no cabeçalho ao rolar). Mantém a rolagem nativa (roda, trackpad, toque, teclado). "Arrastar para rolar" com o mouse foi descartado: conflita com o clique na linha (focar no mapa) e não é um padrão esperado no desktop.
- **Rota `/torre-de-controle`**: a tela se chamava "Painel de Gestão" (`/painel-de-gestao`) e foi renomeada. A rota só existe neste projeto (funciona direto na URL da Vercel); para publicá-la no domínio principal (Multi-Zone) será preciso adicionar o rewrite de `/torre-de-controle` no legado. Pastas e símbolos internos também foram renomeados (`components/torre-de-controle/`, `TorreCard`, `types/torre-de-controle.ts`, `KpiTorre`, `FiltrosTorre`).
- **"Resumo do TCO" movido para o drawer do KPI**: o card escuro da grade foi removido e o conteúdo foi para o drawer "TCO do Mês" (`TcoDetalhe`), junto do gráfico de evolução mensal. O mapa passou a ocupar as colunas 2–4 da grade (ganhou a coluna liberada) e a Atividade Recente foi para a coluna 5.
- **Drawer de KPI extensível**: em vez de um drawer só para o TCO, o `KpiCards` aceita `conteudosPersonalizados` por `id`. Cabeçalho, tooltip e rodapé continuam iguais para todos os KPIs; basta passar um componente para enriquecer outro KPI no futuro. O KPI fica guardado ao fechar para o conteúdo não sumir durante a animação de saída.
- **Fonte única do TCO**: drawer, composição e respostas da IA (`ai-respostas.ts`) derivam de `HISTORICO_TCO`. A média por veículo passou a ser calculada (total ÷ veículos ativos do mês = 52), por isso mudou de R$ 1.748 para R$ 1.681.
- **Gráfico do TCO com Recharts**: diferente do `KmChart` (CSS puro), o TCO precisa de barras empilhadas, área, linha de média e tooltip rico; o Recharts já era dependência do projeto. A legenda da média fica fora do SVG para não sobrepor as barras. Na visão "Tendência", o eixo Y começa em 80% do menor valor para evidenciar a variação (na visão "Composição", começa em 0).
- **Barras empilhadas sempre montadas**: o Recharts empilha as `<Bar>` na ordem em que são registradas; desmontar/remontar uma categoria pelos chips a jogava para o topo da pilha (ordem invertida e cantos arredondados no lugar errado). Por isso todas as barras ficam montadas, a categoria desligada vira valor 0 e um `shape` próprio (`SegmentoBarra`) arredonda só o segmento do topo de cada coluna (última categoria ativa com valor > 0).
- **Paleta do TCO para fundo claro**: as cores antigas (#E0E7FF etc.) foram pensadas para o card escuro e sumiam no branco. Agora: Combustível #312E81, Manutenção #6366F1, Aluguel #A5B4FC, Multas #D4AB00 (ouro) e Sinistros #E11D48.
- **Menu aponta para o legado por ambiente**: os links do menu usam URL absoluta do ambiente em que o usuário está (mesma detecção por hostname dos tokens), então funcionam também em `localhost` e na URL da Vercel deste projeto. Como as URLs dependem de `window`, o ambiente é lido pelo `useAmbiente` para não quebrar a hidratação.

### Integração com `api-driver-scoring`

- **Backend acessado via API Gateway**: o Ranking passa pelo Gateway sob o prefixo `/api-driver-scoring` (`${NEXT_PUBLIC_API_GATEWAY}/api-driver-scoring/dashboard/ranking`); não há variável de ambiente própria. O `/auth/refresh` continua na instância `api` (`${NEXT_PUBLIC_API_GATEWAY}/auth/refresh`, sem o prefixo). Por isso `api.ts` expõe `api` e `driverScoringApi`, ambas com `applyAuthInterceptors` e um único `renewingPromise` (nunca há dois refreshes simultâneos).
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

### Gestão de Exceções, Matriz e Categorias (Etapa 4)

- **Fonte**: `frontend-integration-guide.md` (gerado pelo dev back-end, FLEET-2301/2303). Ele substitui a spec antiga nos pontos novos; a regra de ouro da Etapa 3 deixou de valer para `matriz-pontuacao` e `gestao-excecoes`. Só `analises-preditivas` segue mock (sem endpoint).
- **Criação de exceção só pela rota estrita**: `POST /drivers/:driverId/events/:eventId/exceptions` com body `{ justification }`. O schema usa `z.strictObject` e os path params são UUID (`driver.id`, nunca o nome). Não existe `POST /exceptions` (removido na revisão de segurança).
- **Permissão é do backend**: `canManageExceptions` apenas esconde/desabilita botões (UX); quem decide é o 403 do backend. A claim do JWT é lida sem validar assinatura e nunca é usada para autorizar nada.
- **Atualização após ação**: aplicar exceção faz `refetch` do detalhe do condutor (o cache do backend já é invalidado na mesma requisição); revogar faz `refetch` da listagem (ou volta uma página se a atual ficou vazia).
- **Impacto é sempre `event.impact`**: com exceção o backend retorna `impact: 0` e mantém `raw_points` (imutabilidade de auditoria).
- **Erros 401 × 403 × 404 (AccessScope)**: 401 = sessão; 403 = sem acesso à filial/departamento ou perfil; 404 no detalhe do condutor = não existe ou fora do escopo. As mensagens ficam em `api-error.ts`.
- **Modal sem nova dependência**: `ui/dialog.tsx` e `ui/textarea.tsx` seguem o padrão do `sheet.tsx` (`@base-ui/react/dialog`).
- **Matriz com origem livre**: `EventoPontuacao.origem` passou a `string` (o backend já traduz); origens desconhecidas usam estilo neutro e vão ao final da tabela.
- **Categoria → filtro**: os nomes das classificações são dinâmicos; `getCategoryFilter` converte o card no filtro pelo nível semântico do título (card desconhecido não fica clicável). `classification=todos` não é enviado ao backend.
- **Pendências de alinhamento com o back-end** (não alteradas por falta de confirmação): o guia diz que `/dashboard/ranking` (4.1) aceita filtros hierárquicos, mas a spec antiga dizia que só aceita `managerId`; as cores de classificação do protótipo Lovable diferem das nossas; o guia navega por nome nos top lists, mas mantemos sempre UUID.
