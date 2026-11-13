/**
 * Configurações centrais do Mapa de Frota — Torre de Controle V1.
 *
 * Tudo que pode mudar entre ambientes (URL de tiles, limites de zoom, cores e
 * regras oficiais de status) fica isolado aqui.
 */

import type {
  CategoriaVeiculo,
  ContagemStatus,
  LimitesGeo,
  RegiaoBrasil,
  StatusVeiculo,
} from "@/types/frota-mapa";

/* ---------- Tiles ---------- */

/**
 * URL dos tiles do OpenStreetMap (sem API key).
 * TODO(producao): a política do tile.openstreetmap.org não prevê tráfego comercial
 * pesado. Antes de ir para produção, trocar por tiles próprios ou um provedor.
 */
const URL_OSM = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const ATRIBUICAO_OSM =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';

export const TILE_CONFIGS = {
  claro: { label: "Claro", url: URL_OSM, className: "fm-tiles-claro" },
  padrao: { label: "Padrão", url: URL_OSM, className: "fm-tiles-padrao" },
  escuro: { label: "Escuro", url: URL_OSM, className: "leaflet-dark-tiles" },
} as const;

export type EstiloTile = keyof typeof TILE_CONFIGS;

/* ---------- Zoom ---------- */

/** Abaixo deste zoom: modo Macro (bolhas por UF). A partir dele: modo Micro. */
export const ZOOM_MICRO = 6;
/** A partir deste zoom não há cluster: um pino por veículo, com placa visível. */
export const ZOOM_SEM_CLUSTER = 15;
/** Zoom máximo ao clicar em um cluster */
export const ZOOM_MAX_CLIQUE_CLUSTER = 17;
/** Zoom usado ao focar um veículo específico */
export const ZOOM_FOCO_VEICULO = 16;

/** Enquadramento inicial (Brasil inteiro) */
export const LIMITES_BRASIL: LimitesGeo = [
  [-33.8, -74.0],
  [5.3, -34.8],
];

/* ---------- Status oficiais da Torre de Controle V1 (ordem obrigatória 1 a 5) ---------- */

export interface ConfigStatusVeiculo {
  label: string;
  /** Rótulo compacto usado em espaços estreitos (ex.: lista lateral) */
  labelCurto: string;
  cor: string;
  origemPadrao: string;
  regra: string;
}

export const STATUS_CONFIG: Record<StatusVeiculo, ConfigStatusVeiculo> = {
  in_transit: {
    label: "Em Rota",
    labelCurto: "Em Rota",
    cor: "#10b981",
    origemPadrao: "Telemetria",
    regra: "Última posição recebida nas últimas 5 horas e com velocidade diferente de zero.",
  },
  stopped: {
    label: "Parado",
    labelCurto: "Parado",
    cor: "#3b82f6",
    origemPadrao: "Telemetria",
    regra: "Última posição recebida há até 7 dias, com velocidade igual a zero ou recebida há mais de 5 horas.",
  },
  maintenance: {
    label: "Em Oficina",
    labelCurto: "Em Oficina",
    cor: "#f59e0b",
    origemPadrao: "Módulo de Manutenção",
    regra: "Ordem de serviço em aberto no módulo de Manutenção (prevalece sobre os demais status).",
  },
  no_position: {
    label: "Sem posição (há mais de 7 dias)",
    labelCurto: "Sem posição (>7d)",
    cor: "#64748b",
    origemPadrao: "Telemetria",
    regra: "Veículo com telemetria sem nenhuma posição recebida nos últimos 7 dias (última posição conhecida).",
  },
  no_telemetry: {
    label: "Sem telemetria",
    labelCurto: "Sem telemetria",
    cor: "#7c3aed",
    origemPadrao: "Cadastro do veículo",
    regra: "Veículo sem telemetria. Posicionado pela cidade de alocação do cadastro.",
  },
};

export const LISTA_STATUS: StatusVeiculo[] = [
  "in_transit",
  "stopped",
  "maintenance",
  "no_position",
  "no_telemetry",
];

/** Cria um objeto zerado com os 5 status oficiais (evita duplicação entre módulos) */
export function criarContagemStatusVazia(): ContagemStatus {
  return {
    in_transit: 0,
    stopped: 0,
    maintenance: 0,
    no_position: 0,
    no_telemetry: 0,
  };
}

/* ---------- Categorias ---------- */

export const CATEGORIA_CONFIG: Record<CategoriaVeiculo, { label: string }> = {
  car: { label: "Carro" },
  pickup: { label: "Picape" },
  van: { label: "Utilitário" },
  motorcycle: { label: "Moto" },
};

export const LISTA_CATEGORIAS = Object.keys(CATEGORIA_CONFIG) as CategoriaVeiculo[];

/* ---------- Coroplético por região (modo Macro) ---------- */

/** Escala do mais escuro (região com mais veículos) ao mais claro */
export const ESCALA_REGIAO = ["#312E81", "#4F46E5", "#818CF8", "#A5B4FC", "#C7D2FE"];

export const LISTA_REGIOES: RegiaoBrasil[] = [
  "Sudeste",
  "Sul",
  "Centro-Oeste",
  "Nordeste",
  "Norte",
];

/** Rótulo curto usado na legenda (igual ao protótipo) */
export const ROTULO_REGIAO: Record<RegiaoBrasil, string> = {
  Sudeste: "Sudeste",
  Sul: "Sul",
  "Centro-Oeste": "C.-Oeste",
  Nordeste: "Nordeste",
  Norte: "Norte",
};
