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
| **StatCard** | `src/components/stat-card.tsx` | Card de KPI/Estatística. Exibe métricas com título, valor, subtítulo, ícone e variantes de cor. Suporta clique e acessibilidade via teclado. |
| **ClassificationBadge** | `src/components/classification-badge.tsx` | Badge de classificação de risco do condutor (Referência, Baixa, Média, Alta). Aceita dois tamanhos (sm/md). |
| **TopRankingList** | `src/components/top-ranking-list.tsx` | Lista Top 10 genérica. Configurável para exibir ou ocultar coluna de classificação. Usada tanto para Top 10 Referência quanto Top 10 Críticos. |
| **FiltroBarra** | `src/components/filtro-barra.tsx` | Barra de filtros com input de busca por nome e selects para gestor, filial, departamento e unidade. Validação com Zod. |
| **PeriodoSelector** | `src/components/periodo-selector.tsx` | Seletor de período (mês e ano). Fica separado da barra de filtros, na parte superior da página. |
| **InfoTooltip** | `src/components/info-tooltip.tsx` | Ícone "i" com tooltip explicativo. Usa Tooltip do shadcn/ui. Props opcionais `iconeClassName` e `conteudoClassName` para customizar o visual (usadas no Painel de Gestão). |
| **RankingCondutores** | `src/components/ranking-condutores.tsx` | Tabela completa de ranking com abas Mensal/Anual, paginação inteligente e scroll lateral na aba anual. Responde a filtros externos. |
| **ScoreCircle** | `src/components/score-circle.tsx` | Indicador circular de pontuação mensal, colorido conforme classificação de risco. Usado na aba anual do ranking. |
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
| Dashboard Geral do Ranking | `/ranking-condutores` | Visão consolidada com filtros, cards de KPI, listas Top 10, Ranking completo (Mensal/Anual) e Análises Gráficas (Evolução Anual, Condutores por Unidade/Departamento/Filial, Fadiga por Filial, Eventos por Parâmetro) |
| Matriz de Pontuação | `/ranking-condutores/matriz-pontuacao` | Critérios, pesos e regras de cálculo do ranking. Tabela de eventos, classificação, regras e periodicidade |
| Parâmetros do Ranking | `/ranking-condutores/dashboard-parametros` | 19 indicadores de eventos agrupados por nível de impacto. Cards clicáveis com navegação para detalhamento |
| Detalhamento de Parâmetro | `/ranking-condutores/dashboard-parametros/[id]` | Lista paginada de eventos por parâmetro. Linhas clicáveis navegam para performance do condutor |
| Performance do Condutor | `/ranking-condutores/performance-condutores/[id]` | Perfil individual com abas Ranking (info cards, pontuações mensais, eventos) e Análise Preditiva (IRC ativo, demais seções desabilitadas) |
| Performance dos Condutores | `/ranking-condutores/performance-condutores` | Lista de todos os condutores com ranking, pontuação e classificação. Filtros reutilizados, paginação e navegação para detalhe individual |
| Gestão de Exceções | `/ranking-condutores/gestao-excecoes` | Histórico de exceções ao ranking. Tabela paginada com tipo, condutor, data/hora, justificativa, decisão (badge) e pontuações antes/depois |
| Análises Preditivas | `/ranking-condutores/analises-preditivas` | Visão preditiva da frota: IRC gauge, evolução mensal com meta, top 10 condutores IRC, zonas de risco, probabilidade de eventos e heatmap dia×hora |
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
