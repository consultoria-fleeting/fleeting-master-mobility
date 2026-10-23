/**
 * Tipos do Mapa de Frota (Leaflet).
 *
 * Contrato definido em `MAPA_REFERENCIA_VISUAL.md` (seção 4), adaptado
 * para frota leve: a categoria "truck" foi trocada por "pickup".
 */

/** Status operacional do veículo (define a cor do pino) */
export type StatusVeiculo = "in_transit" | "parked" | "depot" | "maintenance";

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

/** Veículo individual (visão micro) */
export interface VeiculoFrota {
  id: string;
  plate: string;
  model: string;
  category: CategoriaVeiculo;
  fuelType: string;
  driver: string;
  driverPhone: string;
  status: StatusVeiculo;
  /** km/h */
  speed: number;
  /** Graus (0 = norte). Rotaciona a seta do pino */
  heading: number;
  odometer: number;
  /** % */
  fuelLevel: number;
  /** % */
  batteryLevel: number;
  /** Cliente/contrato ao qual o veículo está alocado (ex.: Comgás) */
  grupo: string;
  filial: string;
  locadora: string;
  state: string;
  lat: number;
  lng: number;
  address: string;
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

/** Estado dos filtros do mapa */
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
