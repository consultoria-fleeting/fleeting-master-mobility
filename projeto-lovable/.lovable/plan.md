# Plano: Análises Preditivas — Visão Macro + Análise por Condutor

## Visão geral da mudança

Hoje `/analises-preditivas` é um dashboard por condutor (com seletor). Vamos separar em dois lugares:

1. **`/analises-preditivas`** → vira **visão macro da frota** (sem seletor de condutor).
2. **`/performance-condutores/:nome`** (DetalheCondutor) → ganha **abas**: "Ranking" (conteúdo atual) e "Análise Preditiva" (as 5 seções atuais, com os ajustes pedidos).

---

## 1. Tela `/analises-preditivas` — Visão Macro da Frota

Reescrever `src/pages/AnalisesPreditivas.tsx` do zero.

### Header
- Título "Análises Preditivas" + subtítulo "Visão geral da frota".
- Botão azul à direita: "Ver performance dos condutores" → `/performance-condutores`.
- Barra de filtros (Gestor, Departamento, Unidade, Filial, Período) + botão "Aplicar filtros" — usando os mesmos selects já presentes em outras páginas.

### Linha 1 (2 cards)
- **IRC da Frota**: gauge semicircular, valor 62, badge "Moderado", subtítulo.
- **Evolução do IRC no Ano**: BarChart (recharts) com linha tracejada de meta. Dados: Jan 58, Fev 61, Mar 67, Abr 63, Mai 70, Jun 65.

### Linha 2 (2 cards)
- **Top 10 Condutores com Maior IRC**: lista ranqueada (posição, nome, IRC, badge, barra), link "Ver condutor" → `/performance-condutores/:nome`.
- **Top 10 Infrações Mais Cometidas**: barras horizontais. 8+ tipos (Excesso de velocidade 312, Frenagem brusca 287, Aceleração brusca 201, Uso de celular 178, Curva acentuada 143, ...).

### Linha 3 (2 cards)
- **Zonas de Maior Risco da Frota**: Rodovias 85%, Centro Urbano 62%, Zona Rural 38% + lista complementar (BR-101 noturno 85%, etc.) com barras.
- **Probabilidade Preditiva da Frota**: dois KPIs ("Sextas 18h–21h → 74%", "Rodovias noturnas → 68%") + badge de alerta vermelho se > 60%.

### Linha 4 (largura total)
- **Heatmap Dia × Hora — Frota Completa**: grade 7×24, gradiente verde→amarelo→laranja→vermelho, scroll horizontal, legenda. Picos: sex/sáb 18–23h, seg 6–8h.

Todos os cards com `InfoTooltip` (ícone ℹ️).

---

## 2. Tela do condutor (`DetalheCondutor`) — Abas

Refatorar `src/pages/DetalheCondutor.tsx` usando `Tabs` (shadcn) com 2 abas:

- **Aba "Ranking"**: conteúdo atual da página (info cards, pontuações mensais, eventos).
- **Aba "Análise Preditiva"**: as 5 seções preditivas do condutor selecionado (extraídas do componente atual), com ajustes abaixo. Sem seletor de condutor (já está no contexto da rota).

Estratégia técnica: extrair as 5 seções de `AnalisesPreditivas.tsx` para um novo componente `src/components/AnalisePreditivaCondutor.tsx` que recebe `condutor` como prop. Reaproveitar nas abas.

### Ajustes pedidos nas 5 seções:

**Seção 1 — IRC**
- Remover o card "Configurar Pesos".

**Seção 2 — Tendência de Risco**
- Inverter ordem: "Evolução Temporal do IRC" primeiro, "Variação do IRC" depois.
- Botões de período: 60 / 90 / 180 (remover 30).

**Seção 3 — Probabilidade de Nova Infração**
- Remover Donut "Distribuição por Nível".
- Adicionar lista/barras horizontais "Infrações mais prováveis" (Excesso vel. 82%, Frenagem brusca 65%, Uso de celular 40%, etc.).
- Card de resumo textual automático acima do heatmap ("Este condutor tem maior concentração de infrações às sextas-feiras entre 18h e 21h...").

**Seção 4 — Reincidência** (reescrever)
- Remover gráfico antes×depois, "Mudança de Comportamento" e timeline antes×depois antigos.
- **Bloco 1**: Card evento crítico (borda esquerda vermelha 3px, fundo vermelho clarinho), ícone alerta, data 20/04/2026, descrição "Sinistro — responsabilidade do condutor", badge "Crítico", linha "Última atualização: 27/05/2026".
- **Bloco 2**: Linha do tempo horizontal — grid 3 colunas (Antes laranja `#FFF7ED` / Incidente vermelho `#FCEBEB` / Depois azul `#E6F1FB`), bolinhas coloridas (vermelho/amarelo/verde/roxo) com borda branca 2px, tooltip ao hover, legenda abaixo.
- **Bloco 3**: 4 cards (Excesso vel. 65% alta, Frenagem brusca 40% mod., Sinistro 0% sem, Curva acentuada 25% mod.) com label, % grande colorido, barra fina, texto "X ocorrências nos 30 dias seguintes", badge.
- **Bloco 4**: Tabela "Todos os eventos no período" (Data | Tipo | Descrição | Gravidade | Fase), 10 linhas mockadas (5 antes + 1 incidente + 4 depois), linha do incidente com fundo vermelho clarinho, scroll vertical se >8.

**Seção 5 — Contexto Operacional**
- Renomear "Clusters de risco por região" → "Zonas de risco". Itens fixos: Rodovias / Centro Urbano / Zona Rural com %.
- Substituir card descritivo de regiões por SVG estilizado do Brasil com pontinhos nas regiões de eventos do condutor.
- Mover Heatmap Dia×Hora para depois do Top 5 fatores de risco (por último).
- Adicionar tabela final: Tipo de Infração | Quantidade (≥6 linhas, desc).

Adicionar `InfoTooltip` em todos os gráficos das 5 seções.

---

## Detalhes técnicos

- Arquivos:
  - `src/pages/AnalisesPreditivas.tsx` — reescrita completa (visão frota, sem seletor).
  - `src/components/AnalisePreditivaCondutor.tsx` — novo, recebe `condutor` props, contém as 5 seções com os ajustes.
  - `src/pages/DetalheCondutor.tsx` — embrulhar conteúdo atual em `Tabs` + nova aba "Análise Preditiva" que renderiza o componente acima.
  - `src/data/mockData.ts` — adicionar mocks de frota (top infrações, evolução mensal, zonas, heatmap) e garantir que cada condutor tem dados preditivos (reaproveitar/migrar do mock interno atual de `AnalisesPreditivas`).
- Bibliotecas já no projeto: `recharts`, `lucide-react`, shadcn `Tabs`, `Tooltip`, `Badge`, `Progress`.
- Mapa do Brasil: SVG estático inline com paths simplificados + `<circle>` posicionados; sem dependência extra.
- Cores: usar tokens HSL do design system (`--danger`, `--warning`, etc.); cores hex pedidas pelo usuário ficam como exceção literal apenas nos blocos visuais específicos da seção Reincidência (conforme spec).
- Sem alterações de backend/dados reais — tudo mock.

Confirma para eu implementar?
