/**
 * Configurações centrais do Mapa de Frota.
 *
 * Tudo que pode mudar entre ambientes (URL de tiles, limites de zoom, cores)
 * fica isolado aqui, conforme `MAPA_REFERENCIA_VISUAL.md` (seções 1, 2, 6 e 8).
 */

import type {
  CategoriaVeiculo,
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

/* ---------- Status e categorias ---------- */

export const STATUS_CONFIG: Record<StatusVeiculo, { label: string; cor: string }> = {
  in_transit: { label: "Em rota", cor: "#10b981" },
  parked: { label: "Estacionado", cor: "#3b82f6" },
  depot: { label: "Pátio", cor: "#8b5cf6" },
  maintenance: { label: "Manutenção", cor: "#f59e0b" },
};

export const LISTA_STATUS = Object.keys(STATUS_CONFIG) as StatusVeiculo[];

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
