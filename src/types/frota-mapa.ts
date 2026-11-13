/**
 * Tipos do Mapa de Frota (Leaflet) — Torre de Controle V1.
 *
 * Regras de status fechadas em 13/11/2026:
 * 1. Em Rota (`in_transit`)        → posição < 5h e velocidade ≠ 0 (Telemetria)
 * 2. Parado (`stopped`)            → posição ≤ 7 dias, velocidade = 0 ou > 5h (Telemetria)
 * 3. Em Oficina (`maintenance`)    → O.S. aberta em Manutenção (prevalece sobre todos)
 * 4. Sem posição (`no_position`)   → com telemetria, sem sinal > 7 dias (marcador esmaecido)
 * 5. Sem telemetria (`no_telemetry`) → sem rastreador, posicionado pela cidade de alocação
 */

/** Status operacional exclusivo do veículo no mapa (na ordem oficial da legenda) */
export type StatusVeiculo =
  | "in_transit"
  | "stopped"
  | "maintenance"
  | "no_position"
  | "no_telemetry";

/** Origem da coordenada exibida para o veículo no mapa e no drawer */
export type OrigemPosicao = "telemetria" | "cadastro";

/** Nível hierárquico exibido no filtro de agrupamento conforme o perfil do usuário */
export type NivelAgrupamento =
  | "filiais"
  | "unidades"
  | "regionais"
  | "departamentos_restrito";

/** Escopo global vindo do cabeçalho da Torre de Controle */
export interface EscopoFrotaFiltro {
  perfilDemo: NivelAgrupamento;
  agrupamento: string;
  locadora: string;
}

/** Categoria do veículo na frota leve */
export type CategoriaVeiculo = "car" | "pickup" | "van" | "motorcycle";

export type RegiaoBrasil = "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";

/** Limites geográficos: [[sul, oeste], [norte, leste]] (formato do Leaflet) */
export type LimitesGeo = [[number, number], [number, number]];

/** Contagem de veículos por status */
export type ContagemStatus = Record<StatusVeiculo, number>;

/** Estado brasileiro na visão macro (uma bolha por UF) */
export interface EstadoBrasil {
  uf: string;
  name: string;
  capital: string;
  regiao: RegiaoBrasil;
  /** Centróide: onde a bolha é desenhada */
  lat: number;
  lng: number;
  bounds: LimitesGeo;
  /** Zoom sugerido ao selecionar o estado pelo dropdown */
  zoom: number;
  vehicleCount: number;
  statusCounts: ContagemStatus;
}

export type NivelAlerta = "critico" | "atencao";

/** Alerta ativo associado a um veículo */
export interface AlertaVeiculo {
  nivel: NivelAlerta;
  descricao: string;
}

/** Veículo individual (visão micro e lista lateral) */
export interface VeiculoFrota {
  id: string;
  plate: string;
  model: string;
  category: CategoriaVeiculo;
  fuelType: string;
  driver: string;
  driverPhone: string;
  status: StatusVeiculo;
  /** Indica se o veículo possui equipamento de telemetria ativo vinculado */
  temTelemetria: boolean;
  /** Indica se há ordem de serviço em aberto no módulo de Manutenção */
  emOficina: boolean;
  /** Origem da posição apresentada no mapa ("telemetria" ou "cadastro") */
  origemPosicao: OrigemPosicao;
  /** Data e hora formatadas da última posição recebida (null quando sem telemetria) */
  dataHoraUltimaPosicao: string | null;
  /** Cidade/UF de alocação registrada no cadastro do veículo */
  cidadeAlocacao: string;
  /** km/h */
  speed: number;
  /** Graus (0 = norte). Rotaciona a seta do pino nos veículos em rota/parados */
  heading: number;
  odometer: number;
  /** % (0 quando sem telemetria) */
  fuelLevel: number;
  /** % (0 quando sem telemetria) */
  batteryLevel: number;
  filial: string;
  regiao: RegiaoBrasil;
  regional: string;
  unidadeNegocio: string;
  departamento: string;
  locadora: string;
  state: string;
  lat: number;
  lng: number;
  address: string;
  /** Resumo amigável exibido abaixo do badge de status */
  lastTransmission: string;
  alerta: AlertaVeiculo | null;
}

/** Item resultante do clustering: um cluster ou um veículo isolado */
export type ItemCluster =
  | { isCluster: false; data: VeiculoFrota; lat: number; lng: number }
  | {
      isCluster: true;
      count: number;
      lat: number;
      lng: number;
      bounds: LimitesGeo;
      statusCounts: ContagemStatus;
      dominantStatus: StatusVeiculo;
    };

/** Estado dos filtros internos do bloco do mapa */
export interface FiltrosMapa {
  busca: string;
  uf: string;
  status: StatusVeiculo | "todos";
  categoria: CategoriaVeiculo | "todas";
}

/** Comando externo para focar um veículo no mapa (ex.: vindo do Assistente de IA) */
export interface ComandoFocoMapa {
  placa: string;
  /** Muda a cada comando para permitir focar o mesmo veículo duas vezes */
  token: number;
}
