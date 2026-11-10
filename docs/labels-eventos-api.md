# Labels de eventos vindos da API (`api-driver-scoring` — 10/11/2026)

## Contexto

O back-end (`api-driver-scoring`, commit `e2606f0`, seção 42 do `PROJECT.md` dele) passou a aceitar
códigos de evento **dinâmicos por organização** (ex.: `SPEED_HIGH>140`, `SPEED_VIA<=20%`,
`DISTANCE_DAY>650`). Por isso o front deixou de traduzir `event_type` com dicionário estático e passou
a exibir o campo `label` que a API devolve, já traduzido pela `scoring_matrix` da organização.

Fonte: `api-driver-scoring/docs/frontend-integration-guide.md` (seções 1.8, Tela 3, Tela 4 e Tela 7).

## O que mudou no contrato

| Endpoint | Novo campo |
| :--- | :--- |
| `GET /dashboard/events-volume` | `label` em cada item (`{ event_type, label, total }`). Empate de `total` ordenado por `label`. |
| `GET /dashboard/ranking-parameters` | `label` em cada item de `CRITICAL`/`HIGH`/`MEDIUM`/`LOW`. |
| `GET /dashboard/ranking-parameters/:eventType/details` | `label` na raiz. `:eventType` aceita o código **ou** a label; `event_type` da resposta é o código canônico resolvido. Para `all-events`, `label = "Todos os Eventos"`. |
| `GET /dashboard/driver-performance/:identifier` | Eventos ganham `event_type` (alias de `type`); `label` já existia. |
| `GET /exceptions` e `GET /exceptions/:id` | `label` (igual a `eventLabel`, agora com o label customizado da organização). |

## O que mudou no front

- **Tipos** (`src/types/driver-scoring.ts`): `label` em `RankingParameterEvent`, `EventVolumeItem`,
  `RankingParameterDetailsResponse` e `ExceptionItem`; `event_type?` em `DriverEvent`.
- **`resolveEventLabel(label, eventType)`** (`src/utils/driver-scoring-helpers.ts`): usa o `label` da API;
  se vier vazio, cai no dicionário antigo `getEventTypeLabel` (só fallback, para não quebrar enquanto o
  back-end novo não estiver publicado em todos os ambientes).
- **Cards de Parâmetros** (`ranking-parameters-cards.tsx`) e **gráfico de volume** (`events-volume-chart.tsx`):
  nomes vêm de `resolveEventLabel`.
- **Detalhe do parâmetro** (`dashboard-parametros/[id]`): o título usa o `label` da resposta da API.
  A `ParameterDetailsTable` repassa esse valor pela nova prop `onLabelChange`. Enquanto a resposta não
  chega, o título usa o fallback. O label fica guardado junto do `eventType` para não mostrar o título do
  evento anterior ao trocar de rota.
- **Gestão de exceções** (`exceptions-history-table.tsx`, `justification-dialog.tsx`): exibem `label`
  (fallback `eventLabel`).
- **Ícones** (`getEventTypeIcon` em `driver-scoring-display.ts`): códigos com `>140` (ex.:
  `SPEED_HIGH>140`) agora recebem o ícone `Skull`, como `SPEEDING_OVER_140`/`EXCESS_SPEED_EXTREME`.
  Os ícones continuam derivados do código, pois a API não envia ícone.

## Navegação com códigos especiais

O link do card continua sendo `/ranking-condutores/dashboard-parametros/${encodeURIComponent(event_type)}/`
(`getParameterDetailsPath`). Caracteres como `>`, `<`, `=` e `%` são codificados; a página decodifica o
segmento (`decodeSegment`) e o service volta a codificar ao chamar a API.

## Pendências / pontos de atenção

- Quando o back-end estiver publicado em dev/demo/prod, o dicionário `EVENT_TYPE_LABELS` pode ser removido
  (hoje só serve de fallback).
- A tela `analises-preditivas` segue mock e não foi alterada.
