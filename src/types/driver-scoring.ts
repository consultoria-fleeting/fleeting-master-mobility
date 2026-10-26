/**
 * Tipos do backend `api-driver-scoring` (Ranking de Condutores).
 * Fonte: `API_DRIVER_SCORING_SPEC.md` (seções 2, 4.1 a 4.12 e 5.1 a 5.5).
 *
 * ATENÇÃO: a nomenclatura é mista (camelCase e snake_case) porque reflete
 * exatamente o contrato do backend. Não renomeie os campos.
 */

// ---------------------------------------------------------------------------
// Seção 2 — Interfaces compartilhadas
// ---------------------------------------------------------------------------

/** Linha de filtro hierárquico retornada pelos endpoints `/<recurso>/select`. */
export interface SelectOption {
  /** UUID */
  id: string;
  name: string;
}

/** Paginação (variante com `lastPage`). */
export interface PaginationLastPage {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

/** Paginação (variante com `totalPages`). */
export interface PaginationTotalPages {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Item de distribuição por classificação (usado em gráficos empilhados). */
export interface ClassificationCount {
  /** `classification_name` da organização (dinâmico). */
  label: string;
  count: number;
}

export type DistributionGroupBy = "unit" | "company" | "department";

export type ClassificationKey = "referencia" | "baixa" | "media" | "alta";

export type ExposureLevelBucket = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

// ---------------------------------------------------------------------------
// Query params (Request) — matriz da seção 3
// ---------------------------------------------------------------------------

export type RankingPeriod = "monthly" | "annual";

/** `GET /dashboard/ranking` (4.1) — `GetDashboardDto`. Único filtro: `managerId` (camelCase). */
export interface RankingQueryParams {
  period: RankingPeriod;
  /** Inteiro 2000–2100. */
  year: number;
  /** Inteiro 1–12. Obrigatório quando `period = 'monthly'`; nunca enviado em `annual`. */
  month?: number;
  /** Padrão no backend: 1. */
  page?: number;
  /** Padrão no backend: 15 (máx. 100). */
  limit?: number;
  managerId?: string;
  /** `true` retorna todos os registros, sem paginação. */
  export?: boolean;
}

/**
 * Filtros hierárquicos opcionais (todos UUID, exceto `driver_name`).
 * Usados nos endpoints 4.2 a 4.10 (snake_case).
 */
export interface DashboardHierarchyFilters {
  company_id?: string;
  department_id?: string;
  unit_id?: string;
  cost_center_id?: string;
  manager_id?: string;
  /** Busca "contém", case-insensitive. */
  driver_name?: string;
}

/**
 * `GetRankingParametersDto` — endpoints 4.2, 4.5, 4.6, 4.7 e 4.8.
 * `year` e `month` são numeric strings no backend; o `number` também é aceito (serializado pelo Axios).
 */
export interface RankingParametersQueryParams extends DashboardHierarchyFilters {
  year: number | string;
  /** 1–12 (o backend não valida a faixa; o front valida). */
  month: number | string;
  /** Só tem efeito em top-reference-drivers e bottom-scoring-drivers. */
  export?: boolean;
}

/** `GetDistributionDto` — endpoints 4.3 e 4.10. */
export interface DistributionQueryParams extends RankingParametersQueryParams {
  /** Padrão no backend: `department`. */
  groupBy?: DistributionGroupBy;
}

/** `GetAnnualEvolutionDto` — endpoint 4.4. Não aceita `month`, `page`, `limit` nem `export`. */
export interface AnnualEvolutionQueryParams extends DashboardHierarchyFilters {
  year: number | string;
}

/** `GetRankingParameterDetailsDto` — endpoint 4.9 (query params). */
export interface RankingParameterDetailsQueryParams extends DashboardHierarchyFilters {
  year: number;
  /** 1–12 (o backend não valida a faixa; o front valida). */
  month: number;
  /** Padrão no backend: 1. */
  page?: number;
  /** Padrão no backend: 10 (sem máximo). */
  limit?: number;
}

/** Filtro de classificação do endpoint 4.11 (Tela 2 — Condutores por Categoria). */
export type DriverClassificationFilter = "todos" | ClassificationKey;

/**
 * `GetDriverPerformanceListDto` — endpoint 4.11. Todos opcionais.
 * O backend também aceita aliases camelCase; aqui usamos apenas snake_case.
 */
export interface DriverPerformanceListQueryParams extends DashboardHierarchyFilters {
  /** Filtra pela classificação do condutor no mês (`todos` equivale a não filtrar). */
  classification?: DriverClassificationFilter;
  /** Inteiro 2000–2100. Padrão: ano corrente. */
  year?: number;
  /** Inteiro 1–12. Padrão (ou se maior): último mês fechado. */
  month?: number;
  /** Padrão no backend: 1. */
  page?: number;
  /** Padrão no backend: 10 (máx. 100). */
  limit?: number;
  /** `true` retorna todos os registros, sem paginação. */
  export?: boolean;
}

/** `GetDriverPerformanceDto` — endpoint 4.12 (query params). Todos opcionais. */
export interface DriverPerformanceDetailQueryParams {
  /** Padrão: ano corrente. */
  year?: number;
  /** 1–12. Se informado, filtra eventos e `current_month_score` por esse mês. */
  month?: number;
  /** Padrão no backend: 1. */
  page?: number;
  /** Padrão no backend: 10 (sem máximo). */
  limit?: number;
}

/** Query dos endpoints `/unit/select`, `/department/select`, `/costcenter/select` e `/manager/select`. */
export interface SelectQueryParams {
  /** UUID. Obrigatório na prática em department, costcenter e manager (sem ele retorna `[]`). */
  company_id?: string;
}

// ---------------------------------------------------------------------------
// 4.1 — GET /dashboard/ranking
// ---------------------------------------------------------------------------

export interface RankingMonthlyItem {
  /** `RANK() OVER (ORDER BY score DESC)` — empates compartilham posição. */
  pos: number;
  /** UUID do condutor. */
  id: string;
  driver: string;
  /** `'-'` quando não houver gestor. */
  manager: string;
  department: string | null;
  costCenter: string | null;
  branch: string | null;
  unit: string | null;
  /** `final_score` do mês; 100 se não houver monthly_score. */
  score: number;
  /** Label dinâmico da organização. */
  classification: string;
}
export type RankingMonthlyResponse = RankingMonthlyItem[];

export interface RankingAnnualMonthCell {
  score: number;
  classification: string;
}

/** Chaves de mês em inglês, exatamente como o backend retorna. */
export type RankingAnnualMonthKey =
  | "jan"
  | "feb"
  | "mar"
  | "apr"
  | "may"
  | "jun"
  | "jul"
  | "aug"
  | "sep"
  | "oct"
  | "nov"
  | "dec";

export interface RankingAnnualItem {
  /** `RANK() OVER (ORDER BY accumYear DESC)`. */
  pos: number;
  id: string;
  driver: string;
  /** `'-'` quando não houver gestor. */
  manager: string;
  department: string | null;
  costCenter: string | null;
  branch: string | null;
  unit: string | null;
  /** Soma dos meses fechados (sem registro e admitido = 100; não admitido = 0). */
  accumYear: number;
  /** `null` quando o mês é posterior ao último fechado ou anterior à admissão. */
  months: Record<RankingAnnualMonthKey, RankingAnnualMonthCell | null>;
}
export type RankingAnnualResponse = RankingAnnualItem[];

// ---------------------------------------------------------------------------
// 4.2 — GET /dashboard/driver-categories
// ---------------------------------------------------------------------------

export interface DriverCategoryCard {
  /** `'Total de condutores'` ou `classification_name`. */
  title: string;
  subtitle: string;
  count: number;
  /** `'total'` ou slug do `classification_name`. */
  category: string;
}
export type DriverCategoriesResponse = DriverCategoryCard[];

// ---------------------------------------------------------------------------
// 4.3 — GET /dashboard/drivers-distribution
// ---------------------------------------------------------------------------

/** A chave do grupo é dinâmica e igual ao valor de `groupBy`. */
export type DriversDistributionItem =
  | { unit: string; classifications: ClassificationCount[] }
  | { company: string; classifications: ClassificationCount[] }
  | { department: string; classifications: ClassificationCount[] };
export type DriversDistributionResponse = DriversDistributionItem[];

// ---------------------------------------------------------------------------
// 4.4 — GET /dashboard/annual-classification-evolution
// ---------------------------------------------------------------------------

export type AnnualEvolutionMonthLabel =
  | "Jan"
  | "Fev"
  | "Mar"
  | "Abr"
  | "Mai"
  | "Jun"
  | "Jul"
  | "Ago"
  | "Set"
  | "Out"
  | "Nov"
  | "Dez";

export interface AnnualEvolutionMonth {
  month: AnnualEvolutionMonthLabel;
  /** Todas as classificações da org (count pode ser 0). */
  classifications: ClassificationCount[];
}
export type AnnualEvolutionResponse = AnnualEvolutionMonth[];

// ---------------------------------------------------------------------------
// 4.5 — GET /dashboard/top-reference-drivers
// ---------------------------------------------------------------------------

export interface TopReferenceDriver {
  /** 1..N pela ordenação por score desc. */
  position: number;
  /** UUID do condutor. */
  id: string;
  name: string;
  /** `'-'` quando sem unidade. */
  unit: string;
  score: number;
}
export type TopReferenceDriversResponse = TopReferenceDriver[];

// ---------------------------------------------------------------------------
// 4.6 — GET /dashboard/bottom-scoring-drivers
// ---------------------------------------------------------------------------

export interface BottomScoringDriver {
  /** 1..N por score asc. */
  position: number;
  id: string;
  name: string;
  /** `'-'` quando sem unidade. */
  unit: string;
  score: number;
  /** Label dinâmico. */
  classification: string;
}
export type BottomScoringDriversResponse = BottomScoringDriver[];

// ---------------------------------------------------------------------------
// 4.7 — GET /dashboard/ranking-parameters
// ---------------------------------------------------------------------------

export interface RankingParameterEvent {
  /** Código interno, ex.: `'HARSH_BRAKING'`. */
  event_type: string;
  /** Ocorrências no período (0 se nunca ocorreu). */
  total: number;
}

/** As 4 chaves sempre existem (arrays possivelmente vazios). */
export interface RankingParametersResponse {
  CRITICAL: RankingParameterEvent[];
  HIGH: RankingParameterEvent[];
  MEDIUM: RankingParameterEvent[];
  LOW: RankingParameterEvent[];
}

// ---------------------------------------------------------------------------
// 4.8 — GET /dashboard/events-volume
// ---------------------------------------------------------------------------

export interface EventVolumeItem {
  event_type: string;
  total: number;
}
export type EventsVolumeResponse = EventVolumeItem[];

// ---------------------------------------------------------------------------
// 4.9 — GET /dashboard/ranking-parameters/:eventType/details
// ---------------------------------------------------------------------------

/** Literal aceito no path param `eventType` para trazer todos os eventos do período. */
export const ALL_EVENTS_IDENTIFIER = "all-events";

export interface RankingParameterDetailRow {
  /** ISO 8601 (`sd.event_date`). */
  date: string;
  driver_name: string;
  manager_name: string | null;
  /** Nome da filial/empresa (`companies.name`). */
  regional: string | null;
  cost_center: string | null;
  department: string | null;
  unit: string | null;
  /** Classificação do condutor no mês (label dinâmico). */
  classification: string;
}

export interface RankingParameterDetailsResponse {
  /** Eco do path param (`'all-events'` inclusive). */
  event_type: string;
  /** Mesmo valor de `pagination.total`. */
  total_events_period: number;
  period: {
    month: number;
    year: number;
  };
  pagination: PaginationLastPage;
  /** Ordenado por `date` DESC. */
  data: RankingParameterDetailRow[];
}

// ---------------------------------------------------------------------------
// 4.10 — GET /dashboard/fatigue-distribution
// ---------------------------------------------------------------------------

export interface FatigueMetrics {
  /** Nº de eventos `DISTANCE_OVER_650_DAY`. */
  acute_fatigue: number;
  /** Nº de eventos `DISTANCE_OVER_5000_MONTH`. */
  accumulated_fatigue: number;
}

/** A chave do grupo é dinâmica (= `groupBy`). Grupo sem nome vem como `"Sem Definição"`. */
export type FatigueDistributionItem =
  | ({ unit: string } & FatigueMetrics)
  | ({ company: string } & FatigueMetrics)
  | ({ department: string } & FatigueMetrics);
export type FatigueDistributionResponse = FatigueDistributionItem[];

// ---------------------------------------------------------------------------
// 4.11 — GET /dashboard/driver-performance
// ---------------------------------------------------------------------------

export interface DriverPerformanceListItem {
  /** UUID do condutor. */
  id: string;
  driver: string;
  /** `'-'` quando ausente. */
  manager: string;
  branch: string | null;
  costCenter: string | null;
  department: string | null;
  unit: string | null;
  /** Soma dos meses fechados do ano. */
  accumYear: number;
  /** Pontuação do mês selecionado (100 se sem registro). */
  score: number;
  /** Label dinâmico. */
  classification: string;
}

export interface DriverPerformanceListResponse {
  items: DriverPerformanceListItem[];
  /** Alias idêntico a `items`. */
  data: DriverPerformanceListItem[];
  total: number;
  /** 1 quando `export=true`. */
  page: number;
  /** = `total` quando `export=true`; 0 quando `maxClosedMonth=0` e `export=true`. */
  limit: number;
  /** 1 quando `export=true`; 0 quando `maxClosedMonth=0`. */
  totalPages: number;
}

// ---------------------------------------------------------------------------
// 4.12 — GET /dashboard/driver-performance/:identifier
// ---------------------------------------------------------------------------

export type EventSeverity = "Crítica" | "Gravíssima" | "Grave" | "Média" | "Leve";

export interface DriverPerformanceDriver {
  id: string;
  name: string;
  /** CNH/CPF — dado pessoal (PII). Não logar nem persistir em cache. */
  document: string;
  /** `'-'` quando ausente. */
  manager: string;
  branch: string;
  cost_center: string;
  department: string;
  unit: string;
}

export interface DriverPerformanceIndicators {
  /** Soma dos meses fechados, arredondado a 2 casas. */
  accum_year: number;
  /** 0 a 12 (`maxClosedMonth`). */
  last_closed_month: number;
  /** 2 casas; `null` se não houver. */
  last_closed_month_score: number | null;
  last_closed_month_classification: {
    /** Label dinâmico. */
    label: string;
    key: ClassificationKey;
  } | null;
  /** 2 casas. */
  current_month_score: number | null;
}

export type MonthLabelPtBr =
  | "Janeiro"
  | "Fevereiro"
  | "Março"
  | "Abril"
  | "Maio"
  | "Junho"
  | "Julho"
  | "Agosto"
  | "Setembro"
  | "Outubro"
  | "Novembro"
  | "Dezembro";

export interface DriverMonthlyScore {
  /** 1..12 */
  month: number;
  label: MonthLabelPtBr;
  /** `null`: mês aberto/futuro ou anterior à admissão; 100 se admitido e sem registro. */
  score: number | null;
}

export interface DriverEventException {
  /** `score_exceptions.id` */
  id: string | null;
  /** Fallback: `'Desconsiderado pela Gestão de Exceções'`. */
  justification: string;
  /** ISO 8601 */
  applied_at: string | null;
}

export type DriverEventStatus = "Confirmado" | "Desconsiderado";

export interface DriverEvent {
  /** `score_deductions.id` */
  id: string;
  /** ISO 8601 (`event_date`). */
  date: string;
  /** `event_type` (código). */
  type: string;
  /** Nome PT-BR do evento. */
  label: string;
  /** Origem já traduzida pelo backend (ex.: `'Telemetria'`); tratar como string livre. */
  origin: string;
  severity: EventSeverity;
  /** Valor absoluto dos pontos da regra. */
  raw_points: number;
  /** 0 se `has_exception`; senão negativo (`-applied_points`). */
  impact: number;
  has_exception: boolean;
  /** Preenchido só se `has_exception = true`. */
  exception: DriverEventException | null;
  /** `Desconsiderado` quando há exceção aplicada. */
  status: DriverEventStatus;
  /** `true` quando é possível aplicar uma exceção a este evento. */
  eligible: boolean;
  /** Motivo pelo qual o evento não é elegível (`null` se elegível). */
  ineligible_reason: string | null;
}

export interface DriverPerformanceDetailResponse {
  driver: DriverPerformanceDriver;
  indicators: DriverPerformanceIndicators;
  /** Sempre 12 itens (janeiro a dezembro). */
  monthly_scores: DriverMonthlyScore[];
  events: {
    /** Ordenado por `date` DESC. */
    data: DriverEvent[];
    pagination: PaginationTotalPages;
  };
}

// ---------------------------------------------------------------------------
// Gestão de Exceções (FLEET-2301) — Tela 7 do guia
// ---------------------------------------------------------------------------

/** Query de `GET /exceptions`. */
export interface ExceptionsQueryParams {
  /** Busca parcial, case-insensitive, pelo nome do condutor. */
  driverName?: string;
  /** Padrão no backend: 1. */
  page?: number;
  /** Padrão no backend: 10 (máx. 100). */
  pageSize?: number;
}

/** Item do histórico de exceções (`GET /exceptions` e `GET /exceptions/:id`). */
export interface ExceptionItem {
  id: string;
  exceptionId: string;
  eventId: string;
  /** Código do evento (ex.: `EXCESS_SPEED_HIGH`). */
  eventType: string;
  /** Nome PT-BR do evento. */
  eventLabel: string;
  driverId: string;
  driverName: string;
  /** ISO 8601 */
  eventDate: string;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  appliedAt: string;
  justification: string;
  scoreBefore: number;
  scoreAfter: number;
  /** Nome de quem aplicou a exceção. */
  createdBy: string;
}

export interface ExceptionsListResponse {
  items: ExceptionItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Body de `POST /drivers/:driverId/events/:eventId/exceptions` (somente `justification`). */
export interface CreateExceptionBody {
  /** 10 a 500 caracteres. */
  justification: string;
}

export interface CreateExceptionResponse {
  exceptionId: string;
  eventId: string;
  scoreBefore: number;
  scoreAfter: number;
  /** ISO 8601 */
  createdAt: string;
  createdBy: string;
}

export interface DeleteExceptionResponse {
  message: string;
  exceptionId: string;
  eventId: string;
  driverId: string;
  scoreBefore: number;
  scoreAfter: number;
}

// ---------------------------------------------------------------------------
// Matriz de Pontuação — Tela 8 do guia (`GET /dashboard/scoring-matrix`)
// ---------------------------------------------------------------------------

export interface ScoringMatrixRule {
  id: string;
  /** Código do evento (ex.: `HARSH_ACCELERATION`). */
  event_type: string;
  label: string;
  /** Origem já traduzida (ex.: `Telemetria`, `Multa`, `Registro`). */
  origin: string;
  raw_origin: string;
  /** Pontos da regra (negativo = desconto). */
  points: number;
  is_critical: boolean;
  exposure_level: ExposureLevelBucket;
}

export interface ScoringMatrixClassification {
  classification: string;
  subtitle: string;
  min_score: number | null;
  max_score: number | null;
  is_critical_match: boolean;
  key: ClassificationKey;
}

export interface ScoringMatrixKmFactor {
  range: string;
  min_km: number;
  max_km: number | null;
  factor: number;
}

export interface ScoringMatrixResponse {
  rules: ScoringMatrixRule[];
  classifications: ScoringMatrixClassification[];
  km_factors: ScoringMatrixKmFactor[];
}

// ---------------------------------------------------------------------------
// 5.1 a 5.5 — Endpoints de filtros (combos)
// ---------------------------------------------------------------------------

/** Resposta de `/company/select`, `/unit/select`, `/department/select`, `/costcenter/select` e `/manager/select`. */
export type SelectResponse = SelectOption[];
