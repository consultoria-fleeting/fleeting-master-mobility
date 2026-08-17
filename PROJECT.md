# Fleeting Master Mobility

Micro frontend que futuramente absorverá módulos do **Master Mobility** (software de gestão de frotas).

## Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4
- **Componentes UI**: shadcn/ui
- **Ícones**: Lucide React
- **Validação**: Zod
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
| **InfoTooltip** | `src/components/info-tooltip.tsx` | Ícone "i" com tooltip explicativo. Usa Tooltip do shadcn/ui. |
| **RankingCondutores** | `src/components/ranking-condutores.tsx` | Tabela completa de ranking com abas Mensal/Anual, paginação inteligente e scroll lateral na aba anual. Responde a filtros externos. |
| **ScoreCircle** | `src/components/score-circle.tsx` | Indicador circular de pontuação mensal, colorido conforme classificação de risco. Usado na aba anual do ranking. |
| **TabelaPontuacao** | `src/components/tabela-pontuacao.tsx` | Tabela de Pontuação por Evento da Matriz. Exibe Origem (badge colorido), Evento e Pontuação. Destaque em vermelho para -100 pts. |
| **ClassificacaoGrid** | `src/components/classificacao-grid.tsx` | Grid de cards coloridos com as faixas de classificação dos condutores (Referência, Baixa, Média, Alta). |
| **RegrasCalculoLista** | `src/components/regras-calculo-lista.tsx` | Lista numerada de regras de cálculo do ranking. Suporta destaques (strong) normais e em cor de perigo. |
| **PeriodicidadeSecao** | `src/components/periodicidade-secao.tsx` | Seção de periodicidade de atualização do ranking. Ícone de relógio e textos com destaques. |
| **ParametroCard** | `src/components/parametro-card.tsx` | Card de indicador de parâmetro do ranking. Cor de fundo, ícone Lucide, label e total de eventos. Clicável com suporte a teclado. |

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

---

## Dados Mock

| Arquivo | Propósito |
|---|---|
| `src/data/mock-condutores.ts` | Dados fictícios de 30 condutores com pontuações fixas e pontuações mensais determinísticas. Inclui função `getClassificacao()`, constante `MESES` e listas de opções para filtros. |
| `src/data/mock-matriz-pontuacao.ts` | Dados da Matriz de Pontuação: eventos com pontuação, classificações, regras de cálculo e periodicidade. |
| `src/data/mock-parametros-ranking.ts` | 19 indicadores do ranking agrupados por nível de impacto + configuração de cores dos grupos. |
| `src/data/mock-eventos-parametro.ts` | Eventos detalhados por parâmetro. Função `gerarEventosPorParametro()` com datas determinísticas. Interface `EventoDetalhe`. |

---

## Páginas

| Página | Rota | Propósito |
|---|---|---|
| Dashboard Geral do Ranking | `/` | Visão consolidada com filtros, cards de KPI, listas Top 10 e Ranking completo (Mensal/Anual) |
| Matriz de Pontuação | `/matriz-pontuacao` | Critérios, pesos e regras de cálculo do ranking. Tabela de eventos, classificação, regras e periodicidade |
| Parâmetros do Ranking | `/dashboard-parametros` | 19 indicadores de eventos agrupados por nível de impacto. Cards clicáveis com navegação para detalhamento |
| Detalhamento de Parâmetro | `/dashboard-parametros/[id]` | Lista paginada de eventos por parâmetro. Recebe mês/ano via URL params. Header com badge de grupo e botão de voltar |
| Demo de Gráficos | `/demo-graficos` | Demonstração dos componentes de gráficos genéricos (Sprint Review) |

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
