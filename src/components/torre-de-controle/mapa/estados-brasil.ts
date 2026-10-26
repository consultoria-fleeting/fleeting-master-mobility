/**
 * Lista dos 27 estados brasileiros para a visão Macro do mapa.
 *
 * Centróides e limites aproximados. A contagem de veículos NÃO fica aqui:
 * ela é calculada em `dados-frota.ts` a partir da frota mockada, garantindo
 * que a bolha do estado sempre bata com os pinos do zoom (limitação 2 da spec).
 *
 * TODO(backend): quando integrar, isto vira o `macro.json`.
 */

import type { EstadoBrasil } from "@/types/frota-mapa";

export type EstadoBase = Omit<EstadoBrasil, "vehicleCount" | "statusCounts">;

export const ESTADOS_BRASIL: EstadoBase[] = [
  { uf: "AC", name: "Acre", capital: "Rio Branco", regiao: "Norte", lat: -9.0, lng: -70.5, bounds: [[-11.15, -74.0], [-7.1, -66.6]], zoom: 7 },
  { uf: "AL", name: "Alagoas", capital: "Maceió", regiao: "Nordeste", lat: -9.6, lng: -36.6, bounds: [[-10.5, -38.25], [-8.8, -35.15]], zoom: 8 },
  { uf: "AP", name: "Amapá", capital: "Macapá", regiao: "Norte", lat: 1.4, lng: -51.8, bounds: [[-1.25, -54.9], [4.45, -49.85]], zoom: 7 },
  { uf: "AM", name: "Amazonas", capital: "Manaus", regiao: "Norte", lat: -4.1, lng: -64.6, bounds: [[-9.85, -73.8], [2.25, -56.1]], zoom: 6 },
  { uf: "BA", name: "Bahia", capital: "Salvador", regiao: "Nordeste", lat: -12.5, lng: -41.7, bounds: [[-18.35, -46.65], [-8.5, -37.3]], zoom: 6 },
  { uf: "CE", name: "Ceará", capital: "Fortaleza", regiao: "Nordeste", lat: -5.2, lng: -39.5, bounds: [[-7.9, -41.45], [-2.75, -37.25]], zoom: 7 },
  { uf: "DF", name: "Distrito Federal", capital: "Brasília", regiao: "Centro-Oeste", lat: -15.8, lng: -47.8, bounds: [[-16.05, -48.3], [-15.5, -47.3]], zoom: 10 },
  { uf: "ES", name: "Espírito Santo", capital: "Vitória", regiao: "Sudeste", lat: -19.6, lng: -40.6, bounds: [[-21.3, -41.9], [-17.9, -39.65]], zoom: 8 },
  { uf: "GO", name: "Goiás", capital: "Goiânia", regiao: "Centro-Oeste", lat: -15.9, lng: -49.6, bounds: [[-19.5, -53.25], [-12.4, -45.9]], zoom: 7 },
  { uf: "MA", name: "Maranhão", capital: "São Luís", regiao: "Nordeste", lat: -5.1, lng: -45.3, bounds: [[-10.25, -48.75], [-1.05, -41.8]], zoom: 6 },
  { uf: "MT", name: "Mato Grosso", capital: "Cuiabá", regiao: "Centro-Oeste", lat: -12.9, lng: -55.9, bounds: [[-18.05, -61.6], [-7.35, -50.2]], zoom: 6 },
  { uf: "MS", name: "Mato Grosso do Sul", capital: "Campo Grande", regiao: "Centro-Oeste", lat: -20.5, lng: -54.8, bounds: [[-24.1, -58.2], [-17.15, -50.9]], zoom: 7 },
  { uf: "MG", name: "Minas Gerais", capital: "Belo Horizonte", regiao: "Sudeste", lat: -18.3, lng: -44.6, bounds: [[-22.95, -51.05], [-14.2, -39.85]], zoom: 6 },
  { uf: "PA", name: "Pará", capital: "Belém", regiao: "Norte", lat: -3.8, lng: -52.5, bounds: [[-9.85, -58.9], [2.6, -46.05]], zoom: 6 },
  { uf: "PB", name: "Paraíba", capital: "João Pessoa", regiao: "Nordeste", lat: -7.1, lng: -36.8, bounds: [[-8.3, -38.8], [-6.0, -34.8]], zoom: 8 },
  { uf: "PR", name: "Paraná", capital: "Curitiba", regiao: "Sul", lat: -24.6, lng: -51.6, bounds: [[-26.75, -54.65], [-22.5, -48.0]], zoom: 7 },
  { uf: "PE", name: "Pernambuco", capital: "Recife", regiao: "Nordeste", lat: -8.4, lng: -37.9, bounds: [[-9.5, -41.4], [-7.3, -34.8]], zoom: 7 },
  { uf: "PI", name: "Piauí", capital: "Teresina", regiao: "Nordeste", lat: -7.4, lng: -42.7, bounds: [[-10.95, -45.95], [-2.75, -40.35]], zoom: 7 },
  { uf: "RJ", name: "Rio de Janeiro", capital: "Rio de Janeiro", regiao: "Sudeste", lat: -22.2, lng: -42.7, bounds: [[-23.4, -44.9], [-20.75, -40.95]], zoom: 8 },
  { uf: "RN", name: "Rio Grande do Norte", capital: "Natal", regiao: "Nordeste", lat: -5.8, lng: -36.6, bounds: [[-6.98, -38.6], [-4.8, -34.95]], zoom: 8 },
  { uf: "RS", name: "Rio Grande do Sul", capital: "Porto Alegre", regiao: "Sul", lat: -29.7, lng: -53.3, bounds: [[-33.75, -57.65], [-27.05, -49.7]], zoom: 6 },
  { uf: "RO", name: "Rondônia", capital: "Porto Velho", regiao: "Norte", lat: -10.9, lng: -62.8, bounds: [[-13.7, -66.8], [-7.95, -59.75]], zoom: 7 },
  { uf: "RR", name: "Roraima", capital: "Boa Vista", regiao: "Norte", lat: 2.1, lng: -61.4, bounds: [[-1.6, -64.85], [5.3, -58.85]], zoom: 7 },
  { uf: "SC", name: "Santa Catarina", capital: "Florianópolis", regiao: "Sul", lat: -27.3, lng: -50.5, bounds: [[-29.4, -53.85], [-25.95, -48.3]], zoom: 7 },
  { uf: "SP", name: "São Paulo", capital: "São Paulo", regiao: "Sudeste", lat: -22.19, lng: -48.79, bounds: [[-25.3, -53.1], [-19.7, -44.1]], zoom: 7 },
  { uf: "SE", name: "Sergipe", capital: "Aracaju", regiao: "Nordeste", lat: -10.6, lng: -37.4, bounds: [[-11.6, -38.25], [-9.5, -36.4]], zoom: 8 },
  { uf: "TO", name: "Tocantins", capital: "Palmas", regiao: "Norte", lat: -10.2, lng: -48.3, bounds: [[-13.5, -50.75], [-5.15, -45.7]], zoom: 7 },
];
