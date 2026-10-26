# API Driver Scoring — Especificação de Integração (Front-end)

> Gerado a partir da leitura do código-fonte de `api-driver-scoring` (NestJS + TypeORM/Postgres + Mongoose).
> Todos os contratos abaixo foram extraídos de controllers, DTOs (`class-validator`), services e repositories.
> Onde algo é **inferência** (ex.: qual tela usa o endpoint) ou **não verificável neste repo** (ex.: Gateway), está explicitamente marcado.

---

## 0. Sumário

| # | Método | Rota | Tela / gráfico | Seção |
|---|--------|------|----------------|-------|
| 1 | GET | `/dashboard/ranking` | Visão Geral — tabela de Ranking (mensal / anual) | 4.1 |
| 2 | GET | `/dashboard/driver-categories` | Visão Geral — cards de classificação | 4.2 |
| 3 | GET | `/dashboard/drivers-distribution` | Visão Geral — gráfico de distribuição por agrupamento | 4.3 |
| 4 | GET | `/dashboard/annual-classification-evolution` | Visão Geral — evolução anual da classificação | 4.4 |
| 5 | GET | `/dashboard/top-reference-drivers` | Visão Geral — Top 10 Referência | 4.5 |
| 6 | GET | `/dashboard/bottom-scoring-drivers` | Visão Geral — 10 menores pontuações | 4.6 |
| 7 | GET | `/dashboard/ranking-parameters` | Dashboard de Parâmetros — eventos por nível de exposição | 4.7 |
| 8 | GET | `/dashboard/events-volume` | Dashboard de Parâmetros — volume de eventos por tipo | 4.8 |
| 9 | GET | `/dashboard/ranking-parameters/:eventType/details` | Dashboard de Parâmetros — drill-down de um evento | 4.9 |
| 10 | GET | `/dashboard/fatigue-distribution` | Dashboard de Parâmetros — fadiga aguda/acumulada | 4.10 |
| 11 | GET | `/dashboard/driver-performance` | Performance de Condutores — listagem analítica | 4.11 |
| 12 | GET | `/dashboard/driver-performance/:identifier` | Performance de Condutores — detalhe individual | 4.12 |
| 13 | GET | `/company/select` | Filtros (combo Filial/Empresa) | 5.1 |
| 14 | GET | `/unit/select` | Filtros (combo Unidade) | 5.2 |
| 15 | GET | `/department/select` | Filtros (combo Departamento) | 5.3 |
| 16 | GET | `/costcenter/select` | Filtros (combo Centro de Custo) | 5.4 |
| 17 | GET | `/manager/select` | Filtros (combo Gestor) | 5.5 |
| 18 | GET | `/` | Healthcheck (infra) | 6.1 |
| 19 | POST | `/scoring-engine/process-event` | **Não é para o front** (S2S) | 6.2 |
| 20–39 | POST/GET/PATCH/DELETE | `/drivers`, `/exceptions`, `/parameters`, `/notifications` (+ `/:id`) | **Scaffold sem contrato real — não integrar** | 7 |

> **Telas sem endpoint funcional hoje:** *Matriz de Pontuação*, *Gestão de Exceções* e *Análises Preditivas* **não possuem nenhum endpoint real** neste repositório. `/exceptions` existe apenas como CRUD vazio (ver seção 7). A documentação interna (`docs/tasks-ranking-service.md`) planeja `/api/v1/ranking/exceptions`, `/api/v1/ranking/matrix` e uploads de ingestão, mas **nada disso está implementado no código**.

---

## 1. Convenções globais

### 1.1 Base URL e prefixos

- **Não existe `setGlobalPrefix`** em [main.ts](file:///home/kyo/dev/api-driver-scoring/src/main.ts). As rotas são servidas exatamente como listadas (ex.: `GET /dashboard/ranking`).
- Porta do container: `3000` (`PORT`).
- Hosts públicos (ALB, regra `host_header` em [alb.tf](file:///home/kyo/dev/api-driver-scoring/terraform/alb.tf), valores em `dev.tfvars` / `prod.tfvars`, HTTPS):

| Ambiente | Base URL |
|----------|----------|
| dev | `https://dev-api-driver-scoring.master-mobility.com` |
| prod | `https://api-driver-scoring.master-mobility.com` |

- O ALB roteia por **host**, sem `path_pattern`; portanto não há prefixo de path imposto pela infraestrutura desta API.
- Swagger (somente quando `DOCUMENTATION !== 'prod'`): UI em `GET /api`, JSON em `GET /api-json`.
- CORS: `app.enableCors()` sem restrições (qualquer origem, headers padrão).

### 1.2 Autenticação (vale para TODAS as rotas, exceto as marcadas `@Public`)

O `AuthGuard` é registrado como `APP_GUARD` global em [app.module.ts](file:///home/kyo/dev/api-driver-scoring/src/app.module.ts) e [auth.guard.ts](file:///home/kyo/dev/api-driver-scoring/src/modules/auth/utils/auth.guard.ts). Só `GET /` e `POST /scoring-engine/process-event` são `@Public()`.

| Item | Detalhe |
|------|---------|
| Header obrigatório | `Authorization: Bearer <JWT>` |
| Validação | `JwtService.verifyAsync` com o segredo `JWT_KEY` (o token precisa ter sido assinado com esse mesmo segredo; o emissor não está neste repositório) |
| Claims usados | `fk_organization_id` (number legado **ou** UUID) e `permission.per_name` |
| Escopo por empresa | **Automático pelo token.** `fk_organization_id` é traduzido: se não for UUID, consulta `organizations.external_mm_id = <valor>` e usa o `id` real. **Nenhuma rota recebe `organization_id` por query/header** — não envie. |
| Roles | Nenhuma rota do dashboard usa `RoleGuard`; qualquer token válido com `fk_organization_id` acessa. |
| Header extra | Nenhum header customizado é exigido. (O `Authorization` recebido é **repassado** pela API para o serviço Register no `GET /dashboard/ranking`, ver 4.1.) |

Se `fk_organization_id` não existir no token, o controller usa `String(undefined)` = `"undefined"` e a query falha no Postgres (HTTP 500). O front deve garantir tokens com esse claim.

### 1.3 Rate limit (ThrottlerGuard global, por IP)

- `short`: 20 requisições / 1 s
- `medium`: 200 requisições / 60 s
- Excedeu → `429`. O dashboard dispara várias chamadas em paralelo por tela: faça *debounce* de filtros e evite refetch em cascata.

### 1.4 Validação (ValidationPipe global)

```ts
new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })
```

Consequências diretas para o front:

1. **Query param desconhecido → `400`** (`property X should not exist`). Cada endpoint aceita **somente** os params listados na sua seção. Ex.: `GET /dashboard/ranking?company_id=...` retorna 400.
2. Nomes de filtro **não são uniformes** entre endpoints (`managerId` vs `manager_id`). Ver matriz na seção 3.
3. Booleanos (`export`) só viram `true` se a string for exatamente `"true"`; qualquer outro valor vira `false`.

### 1.5 Formato de erro (padrão NestJS)

```ts
// 400 — validação
interface ValidationErrorResponse {
  statusCode: 400;
  message: string[];            // uma entrada por violação, ex.: "year must be a number string"
  error: 'Bad Request';
}

// 401 — token ausente/ inválido/ expirado
interface UnauthorizedResponse {
  statusCode: 401;
  message: 'Unauthorized';
}

// 404 — somente GET /dashboard/driver-performance/:identifier (e GET /:id dos scaffolds)
interface NotFoundResponse {
  statusCode: 404;
  message: string;              // ex.: 'Condutor não encontrado para o identificador "João"'
  error: 'Not Found';
}

// 429 — rate limit
interface ThrottledResponse {
  statusCode: 429;
  message: 'ThrottlerException: Too Many Requests';
}

// 500 — erros não tratados (ver "Armadilhas" na seção 8)
interface InternalErrorResponse {
  statusCode: 500;
  message: 'Internal server error';
}
```

### 1.6 Convenções de payload

- **Nomenclatura da resposta é mista**: `camelCase` na maioria (`costCenter`, `accumYear`), mas `snake_case` em `ranking-parameters/:eventType/details`, `driver-performance/:identifier`, e nos campos `event_type`, `total`, `acute_fatigue`, `accumulated_fatigue`. Use os nomes **exatamente** como estão abaixo.
- Todos os números (`score`, `count`, `total`, `accumYear`, etc.) chegam como **`number`** (os services fazem `parseFloat`/`parseInt`).
- Datas: strings **ISO 8601** (ex.: `"2026-09-14T13:22:05.000Z"`), pois vêm de `timestamptz` serializado por JSON.
- **`classification` / `label` são textos dinâmicos por organização** (tabela `client_classification_rules`). Nunca use os textos hardcoded no front para lógica; use-os só para exibição. Exemplo de dados do seed: `"Referência"`, `"Baixa Exposição ao Risco"`, `"Média Exposição ao Risco"`, `"Alta Exposição ao Risco"`. Se a organização não tiver regras cadastradas, o backend usa o fallback fixo:

| Faixa (fallback) | `label` |
|------------------|---------|
| `score > 85` | `Referência` |
| `40 <= score <= 85` | `Baixa Exposição ao Risco` |
| `0 < score < 40` | `Média Exposição ao Risco` |
| `score <= 0` | `Alta Exposição ao Risco` |

- **Cores não são retornadas** em nenhum endpoint (o `color` calculado internamente não é exposto). O mapeamento de cores é responsabilidade do front.
- **Regra de "mês fechado" (Closed Month Rule)**: `getMaxClosedMonth(year)` = `12` se `year < ano atual`; `0` se `year > ano atual`; `mês atual - 1` se `year == ano atual`. Endpoints **anuais / de performance** só consideram meses `<= maxClosedMonth`. Em **janeiro do ano corrente** `maxClosedMonth = 0` e esses endpoints retornam vazio.
- Pontuação padrão: condutor ativo, admitido até o mês consultado e **sem registro em `monthly_scores`**, é tratado com **score `100`**.

---

## 2. Interfaces compartilhadas (TypeScript)

```ts
/** Linha de filtro hierárquico retornada pelos endpoints /<recurso>/select */
interface SelectOption {
  id: string;     // UUID
  name: string;
}

/** Paginação padrão (variante com lastPage) */
interface PaginationLastPage {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

/** Paginação padrão (variante com totalPages) */
interface PaginationTotalPages {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Item de distribuição por classificação (usado em gráficos empilhados) */
interface ClassificationCount {
  label: string;  // classification_name da org (dinâmico)
  count: number;
}

type DistributionGroupBy = 'unit' | 'company' | 'department';

type ClassificationKey = 'referencia' | 'baixa' | 'media' | 'alta';

type ExposureLevelBucket = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
```

---

## 3. Matriz de filtros aceitos por endpoint

`✔` = aceito; `—` = **não aceito (400 se enviado)**. Todos os IDs de filtro são UUID de `managers`, `companies`, `departments`, `units`, `cost_centers`.

| Param | ranking | driver-categories / top-reference / bottom-scoring / events-volume / ranking-parameters | drivers-distribution / fatigue-distribution | annual-classification-evolution | ranking-parameters/:eventType/details | driver-performance (lista) | driver-performance/:identifier |
|-------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `period` | ✔ (obrig.) | — | — | — | — | — | — |
| `year` | ✔ obrig. (int 2000–2100) | ✔ obrig. (numeric string) | ✔ obrig. | ✔ obrig. | ✔ obrig. (int) | ✔ opc. (int 2000–2100) | ✔ opc. (int) |
| `month` | ✔ (obrig. se `period=monthly`; int 1–12) | ✔ obrig. (numeric string) | ✔ obrig. | — | ✔ obrig. (int) | ✔ opc. (int 1–12) | ✔ opc. (int 1–12) |
| `manager_id` | — | ✔ | ✔ | ✔ | ✔ (UUID) | ✔ | — |
| `managerId` | ✔ | — | — | — | — | ✔ (alias) | — |
| `company_id` | — | ✔ | ✔ | ✔ | ✔ (UUID) | ✔ | — |
| `companyId` | — | — | — | — | — | ✔ (alias) | — |
| `department_id` | — | ✔ | ✔ | ✔ | ✔ (UUID) | ✔ | — |
| `departmentId` | — | — | — | — | — | ✔ (alias) | — |
| `unit_id` | — | ✔ | ✔ | ✔ | ✔ (UUID) | ✔ | — |
| `unitId` | — | — | — | — | — | ✔ (alias) | — |
| `cost_center_id` | — | ✔ | ✔ | ✔ | ✔ (UUID) | ✔ | — |
| `costCenterId` | — | — | — | — | — | ✔ (alias) | — |
| `driver_name` | — | ✔ | ✔ | ✔ | ✔ | ✔ | — |
| `driverName` | — | — | — | — | — | ✔ (alias) | — |
| `groupBy` | — | — | ✔ | — | — | — | — |
| `page` / `limit` | ✔ (1 / 15, max 100) | — | — | — | ✔ (1 / 10) | ✔ (1 / 10, max 100) | ✔ (1 / 10) |
| `export` | ✔ | ✔ (só efeito em top/bottom) | ✔ (sem efeito) | — | — | ✔ | — |

Notas de semântica de filtro:

- `driver_name` / `driverName`: busca `ILIKE %valor%` (contém, case-insensitive) em todos os endpoints, **exceto** em `/dashboard/driver-performance/:identifier`, onde é path param.
- Nos endpoints baseados em `monthly_scores` o filtro usa `COALESCE(ms.<campo>, d.<campo>)` — ou seja, a **lotação do condutor no mês consultado** (snapshot) tem prioridade sobre a lotação atual do cadastro.
- Em `fatigue-distribution` os filtros são aplicados direto sobre `score_deductions.*` (sem fallback para o cadastro do condutor).
- Para `GetRankingParametersDto` os IDs são validados só como `string` (`@IsString`); se não forem UUID válido o Postgres lança erro de cast → **500**. Sempre envie UUIDs.

---

## 4. Endpoints do Dashboard (`@Controller('dashboard')`)

Todos: `Authorization: Bearer <JWT>` obrigatório, escopo de organização via token, sucesso = **200**.

### 4.1 `GET /dashboard/ranking`

- **Tela:** Visão Geral — tabela de ranking de condutores (abas Mensal e Anual). *(inferido do nome/summary)*
- **Auth:** Bearer. O mesmo header `Authorization` é repassado ao serviço Register (`POST {NEXT_PUBLIC_REGISTER}/conductor/driver-scoring/bulk-info`, body `{ cnhs: string[] }`) para enriquecer `branch / department / costCenter / unit` **quando o dado não existir em `monthly_scores`/`drivers`**. Se o Register falhar, o erro é logado e a lista segue sem enriquecimento. Sem `NEXT_PUBLIC_REGISTER` configurado a API injeta valores *mock* (`Filial Central`, `Operações`, `CC-100`, `Unidade SP`) — atenção em ambientes locais.

**Query params** (`GetDashboardDto`)

| Nome | Tipo | Obrig. | Default | Regras |
|------|------|:-:|---------|--------|
| `period` | `'monthly' \| 'annual'` | sim | — | `IsIn(['monthly','annual'])` |
| `year` | `number` | sim | — | int, 2000–2100 |
| `month` | `number` | condicional | — | int 1–12. **Obrigatório quando `period=monthly`** (sem ele a API lança `Error` simples → **500**, não 400) |
| `page` | `number` | não | `1` | int ≥ 1 |
| `limit` | `number` | não | `15` | int 1–100 |
| `managerId` | `string` | não | — | filtra por gestor (**camelCase**; é o único filtro além de paginação) |
| `export` | `boolean` | não | — | `"true"` retorna todos os registros sem paginação |

**Request body:** n/a.

**Response 200 — `period=monthly`:** array simples (**sem envelope, sem `total`**).

```ts
interface RankingMonthlyItem {
  pos: number;                 // RANK() OVER (ORDER BY score DESC) — empates compartilham posição
  id: string;                  // UUID do condutor
  driver: string;              // nome
  manager: string;             // '-' quando não houver gestor
  department: string | null;
  costCenter: string | null;
  branch: string | null;
  unit: string | null;
  score: number;               // final_score do mês; 100 se não houver monthly_score
  classification: string;      // label dinâmico da org
}
type RankingMonthlyResponse = RankingMonthlyItem[];
```

**Response 200 — `period=annual`:** array simples. Retorna `[]` se `maxClosedMonth === 0`.

```ts
interface RankingAnnualMonthCell {
  score: number;
  classification: string;
}

interface RankingAnnualItem {
  pos: number;                 // RANK() OVER (ORDER BY accumYear DESC)
  id: string;
  driver: string;
  manager: string;             // '-' quando não houver gestor
  department: string | null;
  costCenter: string | null;
  branch: string | null;
  unit: string | null;
  accumYear: number;           // soma dos meses fechados (mês sem registro e admitido = 100; não admitido = 0)
  months: {
    jan: RankingAnnualMonthCell | null;
    feb: RankingAnnualMonthCell | null;
    mar: RankingAnnualMonthCell | null;
    apr: RankingAnnualMonthCell | null;
    may: RankingAnnualMonthCell | null;
    jun: RankingAnnualMonthCell | null;
    jul: RankingAnnualMonthCell | null;
    aug: RankingAnnualMonthCell | null;
    sep: RankingAnnualMonthCell | null;
    oct: RankingAnnualMonthCell | null;
    nov: RankingAnnualMonthCell | null;
    dec: RankingAnnualMonthCell | null;
  };
}
type RankingAnnualResponse = RankingAnnualItem[];
```

`months.<mes>` é `null` quando o mês é posterior ao último mês fechado **ou** anterior à admissão do condutor.

**Observações de integração**

- Não existe `total`/`totalPages`: para paginar, avance `page` até receber menos que `limit` itens (ou use `export=true` para tudo).
- O ranking **mensal não aplica a Closed Month Rule** (aceita mês aberto); o **anual aplica**.
- Elegibilidade: condutor `active = true` e (tem `monthly_score` no mês **ou** foi cadastrado até o mês consultado).
- Chave de mês em inglês (`feb`, `apr`, `may`, `aug`, `oct`, `dec`).

---

### 4.2 `GET /dashboard/driver-categories`

- **Tela:** Visão Geral — cards de indicadores de classificação.
- **Auth:** Bearer.

**Query params** (`GetRankingParametersDto`)

| Nome | Tipo | Obrig. | Observação |
|------|------|:-:|------------|
| `year` | numeric string | sim | `IsNumberString` |
| `month` | numeric string | sim | `IsNumberString` (não valida faixa 1–12) |
| `company_id` | string (UUID) | não | |
| `department_id` | string (UUID) | não | |
| `unit_id` | string (UUID) | não | |
| `cost_center_id` | string (UUID) | não | |
| `manager_id` | string (UUID) | não | |
| `driver_name` | string | não | contém, case-insensitive |
| `export` | boolean | não | sem efeito neste endpoint |

**Response 200**

```ts
interface DriverCategoryCard {
  title: string;       // 'Total de condutores' ou classification_name
  subtitle: string;    // ver regras abaixo
  count: number;
  category: string;    // 'total' ou slug do classification_name
}
type DriverCategoriesResponse = DriverCategoryCard[];
```

- 1º item sempre `{ title: 'Total de condutores', subtitle: 'Quantidade de condutores cadastrados no período selecionado', category: 'total', count: <nº de condutores considerados> }`.
- Depois, **um card por regra** de `client_classification_rules`, na ordem de `rule_order ASC`. **Se a organização não tiver regras, só o card `total` é retornado.**
- `category` = `classification_name` sem acentos, minúsculo, caracteres não `[a-z0-9]` → `-`. Com os dados do seed: `referencia`, `baixa-exposicao-ao-risco`, `media-exposicao-ao-risco`, `alta-exposicao-ao-risco`.
- `subtitle` por regra: `is_critical_match && min==null && max==null` → `'Pontuação zerada'`; `min` e `max` → `` `Entre ${min} e ${max} pontos` ``; só `min` → `` `> ${min - 1} pontos` ``; só `max` → `` `<= ${max} pontos` ``.

---

### 4.3 `GET /dashboard/drivers-distribution`

- **Tela:** Visão Geral — gráfico de barras empilhadas "condutores por nível de risco" agrupado por Unidade / Filial / Departamento.
- **Auth:** Bearer.

**Query params** (`GetDistributionDto` = `GetRankingParametersDto` + `groupBy`)

| Nome | Tipo | Obrig. | Default | Observação |
|------|------|:-:|---------|------------|
| `groupBy` | `'unit' \| 'company' \| 'department'` | não | `'department'` | |
| `year`, `month`, `company_id`, `department_id`, `unit_id`, `cost_center_id`, `manager_id`, `driver_name`, `export` | — | — | — | idênticos a 4.2 |

**Response 200** — a **chave do grupo é dinâmica** e igual ao valor de `groupBy`:

```ts
type DriversDistributionItem =
  | { unit: string;       classifications: ClassificationCount[] }   // groupBy = 'unit'
  | { company: string;    classifications: ClassificationCount[] }   // groupBy = 'company'
  | { department: string; classifications: ClassificationCount[] };  // groupBy = 'department' (default)
type DriversDistributionResponse = DriversDistributionItem[];
```

- Ordenado alfabeticamente (`localeCompare`) pelo nome do grupo.
- `classifications` contém **todas** as classificações da org (ordenadas por `min_score` desc, regra sem `min_score` por último), inclusive com `count: 0`.
- Condutor sem unidade/filial/departamento cai no grupo literal **`"-"`** (o repository já converte `null` em `'-'`, portanto os rótulos `Sem Unidade`/`Sem Filial`/`Sem Departamento` do service nunca aparecem na prática).

---

### 4.4 `GET /dashboard/annual-classification-evolution`

- **Tela:** Visão Geral — gráfico de evolução anual da classificação (linha/área empilhada por mês).
- **Auth:** Bearer.

**Query params** (`GetAnnualEvolutionDto`)

| Nome | Tipo | Obrig. | Observação |
|------|------|:-:|------------|
| `year` | numeric string | sim | |
| `company_id` | string (UUID) | não | |
| `department_id` | string (UUID) | não | |
| `unit_id` | string (UUID) | não | |
| `cost_center_id` | string (UUID) | não | |
| `manager_id` | string (UUID) | não | |
| `driver_name` | string | não | |

(Não aceita `month`, `page`, `limit`, `export`.)

**Response 200**

```ts
interface AnnualEvolutionMonth {
  month: 'Jan' | 'Fev' | 'Mar' | 'Abr' | 'Mai' | 'Jun' | 'Jul' | 'Ago' | 'Set' | 'Out' | 'Nov' | 'Dez';
  classifications: ClassificationCount[];   // todas as classificações da org (count pode ser 0)
}
type AnnualEvolutionResponse = AnnualEvolutionMonth[];
```

- Contém **apenas meses fechados** (de `Jan` até `maxClosedMonth`), em ordem cronológica. `[]` quando `maxClosedMonth === 0` (ano futuro ou janeiro do ano corrente).
- O payload **não** traz o número do mês, só o rótulo PT-BR abreviado; mapeie pelo índice/label.

---

### 4.5 `GET /dashboard/top-reference-drivers`

- **Tela:** Visão Geral — ranking Top 10 condutores de Referência.
- **Auth:** Bearer.
- **Query:** `GetRankingParametersDto` (idêntico a 4.2). `export=true` devolve **todos** os condutores de Referência em vez de 10.

**Response 200**

```ts
interface TopReferenceDriver {
  position: number;   // 1..N pela ordenação por score desc (sem empate: índice+1)
  id: string;         // UUID do condutor
  name: string;
  unit: string;       // '-' quando sem unidade
  score: number;
}
type TopReferenceDriversResponse = TopReferenceDriver[];
```

- "Referência" = a regra de maior `min_score` da org (ou `Referência` no fallback).

---

### 4.6 `GET /dashboard/bottom-scoring-drivers`

- **Tela:** Visão Geral — 10 condutores com menor pontuação.
- **Auth:** Bearer.
- **Query:** `GetRankingParametersDto` (idêntico a 4.2). `export=true` devolve todos os não-Referência.

**Response 200**

```ts
interface BottomScoringDriver {
  position: number;       // 1..N por score asc
  id: string;
  name: string;
  unit: string;           // '-' quando sem unidade
  score: number;
  classification: string; // label dinâmico
}
type BottomScoringDriversResponse = BottomScoringDriver[];
```

- Considera apenas condutores **fora** da classificação Referência.

---

### 4.7 `GET /dashboard/ranking-parameters`

- **Tela:** Dashboard de Parâmetros — contagem de ocorrências por tipo de evento agrupada por nível de exposição (CRITICAL / HIGH / MEDIUM / LOW).
- **Auth:** Bearer.
- **Query:** `GetRankingParametersDto` (idêntico a 4.2). Filtra eventos por `sd.event_date` (ano/mês).

**Response 200**

```ts
interface RankingParameterEvent {
  event_type: string;   // código interno, ex.: 'HARSH_BRAKING'
  total: number;        // ocorrências no período (0 se nunca ocorreu)
}

interface RankingParametersResponse {
  CRITICAL: RankingParameterEvent[];
  HIGH: RankingParameterEvent[];
  MEDIUM: RankingParameterEvent[];
  LOW: RankingParameterEvent[];
}
```

- As 4 chaves **sempre existem** (arrays possivelmente vazios).
- Os eventos vêm da `scoring_matrix` da org (inclui os com `total: 0`). Eventos com `exposure_level = 'REFERENCE'` **não aparecem**.
- Este endpoint **não** filtra `scoring_matrix.active`.
- Sem ordenação definida dentro de cada array; ordene no front.
- `event_type` é código (não traduzido). Os rótulos amigáveis em PT-BR só existem no endpoint 4.12 (`label`); o front precisa de um dicionário próprio para os demais.

---

### 4.8 `GET /dashboard/events-volume`

- **Tela:** Dashboard de Parâmetros — gráfico de volume de eventos por tipo (barras).
- **Auth:** Bearer.
- **Query:** `GetRankingParametersDto` (idêntico a 4.2).

**Response 200**

```ts
interface EventVolumeItem {
  event_type: string;
  total: number;
}
type EventsVolumeResponse = EventVolumeItem[];
```

- Ordenado por `total` desc, depois `event_type` asc.
- União de: eventos **ativos** da matriz (`total` pode ser 0) + qualquer `event_type` que tenha ocorrido no período (mesmo sem regra na matriz).

---

### 4.9 `GET /dashboard/ranking-parameters/:eventType/details`

- **Tela:** Dashboard de Parâmetros — drill-down/tabela de condutores que cometeram um evento.
- **Auth:** Bearer.

**Path params**

| Nome | Tipo | Obrig. | Observação |
|------|------|:-:|------------|
| `eventType` | `string` | sim | Código do evento (ex.: `HARSH_BRAKING`) **ou** o literal `all-events` para todos os eventos do período |

**Query params** (`GetRankingParameterDetailsDto`)

| Nome | Tipo | Obrig. | Default | Observação |
|------|------|:-:|---------|------------|
| `year` | int | sim | — | `parseInt` + `IsInt` |
| `month` | int | sim | — | `parseInt` + `IsInt` (não valida 1–12) |
| `manager_id` | UUID | não | — | `IsUUID` |
| `company_id` | UUID | não | — | `IsUUID` |
| `department_id` | UUID | não | — | `IsUUID` |
| `unit_id` | UUID | não | — | `IsUUID` |
| `cost_center_id` | UUID | não | — | `IsUUID` |
| `driver_name` | string | não | — | contém, case-insensitive |
| `page` | int | não | `1` | ≥ 1 |
| `limit` | int | não | `10` | ≥ 1 (sem máximo) |

**Response 200**

```ts
interface RankingParameterDetailRow {
  date: string;                    // ISO 8601 (sd.event_date)
  driver_name: string;
  manager_name: string | null;
  regional: string | null;         // nome da filial/empresa (companies.name)
  cost_center: string | null;
  department: string | null;
  unit: string | null;
  classification: string;          // classificação do condutor no mês (label dinâmico)
}

interface RankingParameterDetailsResponse {
  event_type: string;              // eco do path param ('all-events' inclusive)
  total_events_period: number;     // mesmo valor de pagination.total
  period: {
    month: number;
    year: number;
  };
  pagination: PaginationLastPage;  // { total, page, limit, lastPage } — lastPage >= 1
  data: RankingParameterDetailRow[]; // ordenado por date DESC
}
```

- Cada linha é **um evento** (não um condutor único): o mesmo condutor pode repetir.
- `classification` é derivada de `monthly_scores.final_score` do evento; se não houver score, usa `100`.
- Não há `export`: para exportar CSV complete a paginação no cliente.

---

### 4.10 `GET /dashboard/fatigue-distribution`

- **Tela:** Dashboard de Parâmetros — gráfico de fadiga (aguda × acumulada) por Unidade / Filial / Departamento.
- **Auth:** Bearer.
- **Query:** `GetDistributionDto` (idêntico a 4.3; `groupBy` default `department`).

**Response 200** — chave do grupo dinâmica (= `groupBy`):

```ts
interface FatigueMetrics {
  acute_fatigue: number;        // nº de eventos DISTANCE_OVER_650_DAY
  accumulated_fatigue: number;  // nº de eventos DISTANCE_OVER_5000_MONTH
}

type FatigueDistributionItem =
  | ({ unit: string }       & FatigueMetrics)   // groupBy = 'unit'
  | ({ company: string }    & FatigueMetrics)   // groupBy = 'company'
  | ({ department: string } & FatigueMetrics);  // groupBy = 'department' (default)
type FatigueDistributionResponse = FatigueDistributionItem[];
```

- Ordenado alfabeticamente pelo nome do grupo.
- Grupo sem nome (`null`) aparece como **`"Sem Definição"`** (diferente de 4.3, que usa `"-"`).
- Só retorna grupos que tiveram ≥ 1 evento de fadiga no período (não preenche grupos zerados).
- Os tipos de evento estão **hardcoded** no repository: `DISTANCE_OVER_650_DAY` e `DISTANCE_OVER_5000_MONTH`.

---

### 4.11 `GET /dashboard/driver-performance`

- **Tela:** Performance de Condutores — relatório analítico (tabela com pontuação acumulada, classificação e multi-filtros; suporta exportação).
- **Auth:** Bearer.

**Query params** (`GetDriverPerformanceListDto`) — todos opcionais

| Nome | Tipo | Default | Observação |
|------|------|---------|------------|
| `year` | int 2000–2100 | ano corrente | |
| `month` | int 1–12 | último mês fechado | Se omitido **ou maior que o último mês fechado**, é substituído por `maxClosedMonth` |
| `driver_name` / `driverName` | string | — | contém, case-insensitive. snake_case tem precedência |
| `manager_id` / `managerId` | string (UUID) | — | idem |
| `company_id` / `companyId` | string (UUID) | — | idem |
| `department_id` / `departmentId` | string (UUID) | — | idem |
| `unit_id` / `unitId` | string (UUID) | — | idem |
| `cost_center_id` / `costCenterId` | string (UUID) | — | idem |
| `page` | int ≥ 1 | `1` | |
| `limit` | int 1–100 | `10` | |
| `export` | boolean | — | `"true"` → todos os registros, sem paginação |

**Response 200**

```ts
interface DriverPerformanceListItem {
  id: string;                    // UUID do condutor
  driver: string;
  manager: string;               // '-' quando ausente
  branch: string | null;
  costCenter: string | null;
  department: string | null;
  unit: string | null;
  accumYear: number;             // soma dos meses fechados do ano (mesma regra de 4.1 anual)
  score: number;                 // pontuação do mês selecionado (100 se sem registro)
  classification: string;        // label dinâmico
}

interface DriverPerformanceListResponse {
  items: DriverPerformanceListItem[];
  data: DriverPerformanceListItem[];   // ALIAS idêntico a `items` (mesma referência de dados)
  total: number;
  page: number;                  // 1 quando export=true
  limit: number;                 // = total quando export=true; 0 quando maxClosedMonth=0 e export=true
  totalPages: number;            // 1 quando export=true; 0 quando maxClosedMonth=0
}
```

- Ordenação: posição da classificação na lista de regras (`rule_order`: melhor primeiro) e depois `driver_name ASC`. **Não é ordenação por score.**
- Quando `maxClosedMonth === 0` (janeiro do ano corrente / ano futuro): `{ items: [], data: [], total: 0, page, limit, totalPages: 0 }`.
- Não retorna o documento (CNH/CPF) do condutor.

---

### 4.12 `GET /dashboard/driver-performance/:identifier`

- **Tela:** Performance de Condutores — detalhe individual (KPIs, gráfico de pontuação mensal e tabela de eventos/infrações).
- **Auth:** Bearer.

**Path params**

| Nome | Tipo | Obrig. | Observação |
|------|------|:-:|------------|
| `identifier` | `string` | sim | UUID do condutor **ou** nome (match `ILIKE` sem wildcards, case-insensitive) **ou** documento exato. Ver armadilhas: prefira **sempre UUID**. Faça `encodeURIComponent` no nome. |

**Query params** (`GetDriverPerformanceDto`) — todos opcionais

| Nome | Tipo | Default | Observação |
|------|------|---------|------------|
| `year` | int | ano corrente | sem validação de faixa |
| `month` | int 1–12 | — | Se informado: a tabela de eventos filtra apenas esse mês e `current_month_score` usa esse mês. Se omitido: eventos de todos os meses fechados e `current_month_score = last_closed_month_score` |
| `page` | int ≥ 1 | `1` | paginação da tabela de eventos |
| `limit` | int ≥ 1 | `10` | sem máximo |

**Response 200**

```ts
type EventSeverity = 'Crítica' | 'Gravíssima' | 'Grave' | 'Média' | 'Leve';

interface DriverPerformanceDriver {
  id: string;
  name: string;
  document: string;       // CNH/CPF — dado pessoal (PII)
  manager: string;        // '-' quando ausente
  branch: string;         // '-' quando ausente
  cost_center: string;    // '-' quando ausente
  department: string;     // '-' quando ausente
  unit: string;           // '-' quando ausente
}

interface DriverPerformanceIndicators {
  accum_year: number;                              // soma dos meses fechados, arredondado a 2 casas
  last_closed_month: number;                       // 0 a 12 (maxClosedMonth)
  last_closed_month_score: number | null;          // 2 casas; null se não houver
  last_closed_month_classification: {
    label: string;                                 // label dinâmico
    key: ClassificationKey;                        // 'referencia' | 'baixa' | 'media' | 'alta'
  } | null;
  current_month_score: number | null;              // 2 casas
}

interface DriverMonthlyScore {
  month: number;                                   // 1..12
  label: 'Janeiro' | 'Fevereiro' | 'Março' | 'Abril' | 'Maio' | 'Junho'
       | 'Julho' | 'Agosto' | 'Setembro' | 'Outubro' | 'Novembro' | 'Dezembro';
  score: number | null;                            // null: mês aberto/futuro ou anterior à admissão; 100 se admitido e sem registro
}

interface DriverEventException {
  id: string | null;                               // score_exceptions.id
  justification: string;                           // 'Desconsiderado pela Gestão de Exceções' como fallback
  applied_at: string | null;                       // ISO 8601
}

interface DriverEvent {
  id: string;                                      // score_deductions.id
  date: string;                                    // ISO 8601 (event_date)
  type: string;                                    // event_type (código)
  label: string;                                   // nome PT-BR do evento
  origin: string;                                  // origem como armazenada em score_deductions.origin (no seed: 'telemetry' | 'fine' | 'incident'); tratar como string livre
  severity: EventSeverity;
  raw_points: number;                              // valor absoluto dos pontos da regra
  impact: number;                                  // 0 se has_exception; senão negativo (-applied_points)
  has_exception: boolean;
  exception: DriverEventException | null;          // preenchido só se has_exception = true
}

interface DriverPerformanceDetailResponse {
  driver: DriverPerformanceDriver;
  indicators: DriverPerformanceIndicators;
  monthly_scores: DriverMonthlyScore[];            // sempre 12 itens (janeiro a dezembro)
  events: {
    data: DriverEvent[];                           // ordenado por date DESC
    pagination: PaginationTotalPages;              // { page, limit, total, totalPages }
  };
}
```

Regras relevantes:

- **Severidade** (a partir de `scoring_matrix.exposure_level` / `is_critical`): `is_critical` ou `CRITICAL` → `Crítica`; `HIGH` → `Gravíssima`; `MEDIUM` → `Grave`; `LOW` → `Média`; `REFERENCE` → `Leve`; sem regra → `Média`.
- **Exceção**: `has_exception = true` se existir `score_exceptions` aplicada (`applied = true`) ligada ao evento, ou se `applied_points = 0` com `raw_points > 0`. Neste caso `impact = 0`.
- Evento sem regra correspondente na matriz mantém os campos, mas `severity = 'Média'`.
- Eventos são paginados pelo `page/limit`; `monthly_scores` e `indicators` **não** dependem da paginação.
- `404` se o condutor não existir **na organização do token**.

---

## 5. Endpoints auxiliares de filtros (combos)

Todos: `Authorization: Bearer <JWT>`, sem body, sucesso = **200**, resposta `SelectOption[]` ordenada por `name ASC`:

```ts
type SelectResponse = SelectOption[];   // { id: string; name: string }[]
```

### 5.1 `GET /company/select`

- **Tela:** filtros (Filial/Empresa). Sem query params. Escopo pela organização do token.

### 5.2 `GET /unit/select`

- **Tela:** filtros (Unidade).
- **Query:** `company_id` (UUID, opcional).
  - Com `company_id` e a empresa possui `unit_id`: retorna **apenas essa unidade** (array de 1 item).
  - Com `company_id` mas a empresa **sem** `unit_id` (ou inexistente): cai para o comportamento padrão — **todas as unidades da organização**.
  - Sem `company_id`: todas as unidades da organização.

### 5.3 `GET /department/select`

- **Tela:** filtros (Departamento).
- **Query:** `company_id` (UUID). Na prática **obrigatório**: sem ele retorna `[]`. **Não filtra por organização do token** (apenas por `company_id`).

### 5.4 `GET /costcenter/select`

- **Tela:** filtros (Centro de Custo).
- **Query:** `company_id` (UUID). Sem ele retorna `[]`. **Não filtra por organização do token.**

### 5.5 `GET /manager/select`

- **Tela:** filtros (Gestor).
- **Query:** `company_id` (UUID). Sem ele retorna `[]`. Retorna apenas gestores `active = true`. **Não filtra por organização do token.**

> Fluxo recomendado para os filtros em cascata: carregar `/company/select` → ao escolher a filial, carregar `/unit/select`, `/department/select`, `/costcenter/select` e `/manager/select` com `company_id`. Os `id` retornados são exatamente os valores aceitos em `company_id`, `unit_id`, `department_id`, `cost_center_id` e `manager_id` dos endpoints do dashboard.

---

## 6. Endpoints de infraestrutura / não consumíveis pelo front

### 6.1 `GET /` (público)

- **Auth:** nenhuma (`@Public()`). Usado como health check do Target Group (`/`).

```ts
interface HealthcheckResponse {
  service: 'api-driver-scoring';
  status: 'up';
  timestamp: string;   // ISO 8601
}
```

### 6.2 `POST /scoring-engine/process-event` (público + `ServiceJwtGuard`)

- **Uso:** comunicação serviço-a-serviço (S2S). **O front não deve chamar.**
- **Auth:** `@Public()` ignora o `AuthGuard` de usuário; `ServiceJwtGuard` é atualmente um *stub* que sempre retorna `true`, ou seja, **hoje o endpoint está efetivamente sem autenticação** (e o `ThrottlerGuard` global continua valendo, apesar do comentário do stub dizer "exempt").

```ts
interface ProcessEventRequest {
  document: string;                 // CNH/CPF do condutor
  eventType: string;
  origin: 'Telemetria' | 'Multa' | 'Incidente' | 'Registro';
  sourceEventId: string;
  eventDate: string;                // ISO 8601 (IsDateString)
  kmDriven?: number;
}
```

- **Response:** `201` com corpo vazio (o método retorna `void`).

---

## 7. Controllers scaffold (CRUD vazio) — NÃO integrar

`/drivers`, `/exceptions`, `/parameters` e `/notifications` são geradores do Nest (`nest g resource`) **sem regra de negócio**. Todos exigem Bearer (guard global). Os DTOs `Create*Dto` são **classes vazias** e os schemas Mongoose só têm `isDeleted`, então:

| Método | Rota | Comportamento real |
|--------|------|--------------------|
| POST | `/drivers`, `/exceptions`, `/parameters`, `/notifications` | Body com **qualquer** propriedade → `400` (`forbidNonWhitelisted`). Body `{}` cria um documento vazio e responde `201` com `{ isDeleted: false, _id, createdAt, updatedAt, __v }` |
| GET | idem | `200` com array desses documentos vazios (`isDeleted = false`) |
| GET | `/:id` | `200` com o documento; `404` (`"<Recurso> with ID <id> not found"`) se não existir; `id` fora do formato ObjectId → `500` |
| PATCH | `/:id` | `200` com **string** `This action updates a #<id> <recurso>` (não altera nada) |
| DELETE | `/:id` | `200` com **string** `This action removes a #<id> <recurso>` (não remove nada) |

```ts
interface ScaffoldDocument {
  _id: string;          // ObjectId
  isDeleted: boolean;   // default false
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
  __v: number;
}
```

Consequência para as telas **Gestão de Exceções**, **Matriz de Pontuação** e **Análises Preditivas**: **não há backend disponível** — é necessário implementar os endpoints na API antes da integração. As únicas informações de exceção expostas hoje são os campos `has_exception` / `exception` dentro de cada evento em 4.12.

Ingestão de eventos (telemetria/multas/incidentes/registro) e fechamento mensal acontecem **exclusivamente via consumers SQS** (`IngestionSqsConsumerService`, `ClosureSqsConsumerService`) — não há rota HTTP.

---

## 8. Observações de integração e armadilhas conhecidas

### 8.1 API Gateway (`NEXT_PUBLIC_API_GATEWAY`)

- **Não é possível confirmar neste repositório** se esta API está atrás do Gateway nem sob qual prefixo: não há referência a `NEXT_PUBLIC_API_GATEWAY`, a `setGlobalPrefix` nem a regra de path no ALB. O único `NEXT_PUBLIC_*` usado aqui é `NEXT_PUBLIC_REGISTER` (sentido inverso: esta API chama o Register).
- Hoje a API tem **baseURL própria** (hosts da seção 1.1). Recomendação: criar no front uma variável dedicada, por exemplo `NEXT_PUBLIC_API_DRIVER_SCORING`, apontando para o host acima, **a menos que** o time de infra publique a rota no Gateway.
- Se for roteada pelo Gateway, o Gateway precisa: (a) **remover** o prefixo antes de encaminhar (a API não tem prefixo — `/<prefixo>/dashboard/ranking` deve chegar como `/dashboard/ranking`); (b) **repassar o header `Authorization`** inalterado (é validado aqui com `JWT_KEY` e reenviado ao Register); (c) não alterar query strings (ex.: manter `managerId`/`manager_id` como enviados).
- Os caminhos `/api/v1/ranking/...` presentes em `docs/tasks-ranking-service.md` são **planejamento, não implementação**; não use.
- Há duas camadas de rate limit: Throttler da API (20/s e 200/min por IP) e (conforme `docs/tech-architecture.md`) Gateway com 1000 req/min.

### 8.2 Armadilhas de contrato

1. **Filtros inconsistentes:** `/dashboard/ranking` aceita só `managerId` (camelCase) e nenhum outro filtro hierárquico; os demais endpoints usam `manager_id` (snake_case); `driver-performance` aceita os dois formatos.
2. **`month` obrigatório no ranking mensal:** se faltar, o backend lança `Error` genérico → **HTTP 500** (não 400). Valide no front.
3. **IDs não-UUID → 500** nos endpoints baseados em `GetRankingParametersDto` / `GetDriverPerformanceListDto` (validados só como string; o Postgres rejeita o cast para `uuid`). Em `ranking-parameters/:eventType/details` o `IsUUID` devolve 400 corretamente.
4. **`year`/`month` como string numérica** (`GetRankingParametersDto`): `month=13` passa na validação e retorna dados vazios/inconsistentes; valide 1–12 no front.
5. **Intervalos de classificação com buracos:** as regras são inteiras (ex.: 86–100, 40–85, 1–39, ≤0), mas `final_score` é `decimal(8,2)`. Um score como `85.5` ou `39.5` não casa com nenhuma regra e **cai no fallback `Referência`** (comportamento do backend; sinalize ao time de backend se aparecer no gráfico).
6. **Mês aberto:** `ranking?period=monthly`, `driver-categories`, `drivers-distribution`, `top/bottom`, `events-volume`, `ranking-parameters`, `fatigue-distribution` aceitam o mês corrente (aberto), onde condutores sem `monthly_score` aparecem com score `100`. Já `ranking?period=annual`, `annual-classification-evolution`, `driver-performance` e `driver-performance/:identifier` respeitam a regra de mês fechado.
7. **Sem paginação com total** em `/dashboard/ranking`; use heurística `length < limit` ou `export=true`.
8. **`identifier` por nome é frágil:** o match é `ILIKE` do valor integral (caracteres `%` e `_` funcionam como curinga), `getOne()` retorna um registro arbitrário se houver homônimos, e o nome é decodificado duas vezes (`%` literal no nome pode causar erro 500). **Use sempre o UUID** (`id` vindo de 4.1 ou 4.11).
9. **Rotas `department|costcenter|manager /select`** não validam que `company_id` pertence à organização do token; trate como dado já filtrado pela cascata do front e reporte ao backend (vazamento entre tenants se um UUID de outra org for informado).
10. **`event_type` sem tradução** nos endpoints 4.7, 4.8 e 4.9; só 4.12 devolve `label`. O mapa de rótulos usado pelo backend (24 tipos, em `DashboardService.formatEventType`) é: `HARSH_BRAKING`, `HARSH_ACCELERATION`, `SHARP_TURN`, `SPEEDING_LOW`, `SPEEDING_MEDIUM`, `SPEEDING_HIGH`, `SPEEDING_VERY_HIGH`, `SPEEDING_OVER_140`, `EXCESS_SPEED_LOW`, `EXCESS_SPEED_MEDIUM`, `EXCESS_SPEED_HIGH`, `EXCESS_SPEED_VERY_HIGH`, `DISTANCE_OVER_650_DAY`, `DISTANCE_OVER_5000_MONTH`, `SEATBELT_UNBUCKLED`, `SEATBELT_TELEMETRY`, `CELLPHONE_USAGE`, `DRIVING_UNDER_INFLUENCE`, `FORBIDDEN_OVERTAKING`, `HIGH_POTENTIAL_INCIDENT`, `TRAFFIC_FINE_LIGHT`, `TRAFFIC_FINE_MEDIUM`, `TRAFFIC_FINE_HEAVY`, `TRAFFIC_FINE_VERY_HEAVY`. Tipos fora dessa lista recebem `label` gerado por *Title Case* do código (`UNBELTED_DRIVING_1KM` → `Unbelted Driving 1km`). Atenção: os códigos do seed/matriz (`EXCESS_SPEED_EXTREME`, `UNBELTED_DRIVING_1KM`, `HARSH_CORNERING`, `FINE_LIGHT`, `FINE_MEDIUM`, `FINE_HIGH`, `FINE_CRITICAL`, `PREVENTABLE_HIGH_POTENTIAL`, `DUI`) **não estão** nesse mapa — o dicionário do front deve cobrir os códigos reais da `scoring_matrix` da org.
11. **PII:** `driver.document` (4.12) expõe CNH/CPF; não logar nem persistir em cache do navegador além do necessário.

### 8.3 Checklist rápido para o front

- [ ] Enviar `Authorization: Bearer <token>` em toda chamada; não enviar `organization_id`.
- [ ] Usar `managerId` **somente** em `/dashboard/ranking`; `manager_id` nos demais.
- [ ] Sempre enviar `year` + `month` (1–12) nos endpoints de 4.2, 4.3, 4.5–4.10.
- [ ] Tratar listas vazias para ano futuro / janeiro corrente em 4.1 (anual), 4.4 e 4.11.
- [ ] Ler chaves dinâmicas (`unit` | `company` | `department`) conforme `groupBy` em 4.3 e 4.10.
- [ ] Não hardcodar labels/cores de classificação; derivar de `classification`/`label` retornados (ou de `driver-categories`).
- [ ] Debounce nos filtros (rate limit de 20 req/s por IP).
