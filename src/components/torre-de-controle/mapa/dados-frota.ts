/**
 * Camada de dados do Mapa de Frota (mock).
 *
 * É a ÚNICA parte que muda ao ligar o backend (spec, seção 4.3).
 * O mapa só conhece as funções assíncronas exportadas aqui:
 *   - fetchMacro()                         → contagem por UF (visão macro)
 *   - fetchVehiclesByMultipleStates(ufs)   → veículos das UFs no viewport
 *   - fetchVehicleByPlate(placa)           → um veículo (usado pelo "Focar no mapa")
 *
 * A frota mockada tem 52 veículos (mesmo número do KPI "Veículos Ativos"), com
 * posições em avenidas reais. Os dados são determinísticos (sem Math.random).
 *
 * TODO(backend): trocar o corpo das funções por `fetch` para a API de telemetria.
 */

import type {
  AlertaVeiculo,
  CategoriaVeiculo,
  ContagemStatus,
  EstadoBrasil,
  StatusVeiculo,
  VeiculoFrota,
} from "@/types/frota-mapa";
import { VEICULOS_ATENCAO } from "../mock-data";
import { ESTADOS_BRASIL } from "./estados-brasil";

/* ========================================================= */
/*  FILIAIS E ENDEREÇOS                                      */
/* ========================================================= */

interface PontoEndereco {
  endereco: string;
  lat: number;
  lng: number;
}

interface Filial {
  nome: string;
  uf: string;
  ddd: string;
  pontos: PontoEndereco[];
}

const FILIAIS: Record<string, Filial> = {
  SPM: {
    nome: "São Paulo — Matriz", uf: "SP", ddd: "11",
    pontos: [
      { endereco: "Av. Paulista, 1578 - Bela Vista, São Paulo - SP", lat: -23.5614, lng: -46.656 },
      { endereco: "Av. Brig. Faria Lima, 3477 - Itaim Bibi, São Paulo - SP", lat: -23.5868, lng: -46.6826 },
      { endereco: "Av. das Nações Unidas, 12901 - Brooklin, São Paulo - SP", lat: -23.6087, lng: -46.6969 },
      { endereco: "Av. Rebouças, 3970 - Pinheiros, São Paulo - SP", lat: -23.5719, lng: -46.6936 },
      { endereco: "Av. do Estado, 4500 - Cambuci, São Paulo - SP", lat: -23.569, lng: -46.617 },
      { endereco: "Av. Interlagos, 2255 - Interlagos, São Paulo - SP", lat: -23.672, lng: -46.683 },
      { endereco: "Av. Aricanduva, 5555 - Vila Matilde, São Paulo - SP", lat: -23.556, lng: -46.511 },
      { endereco: "Av. Marquês de São Vicente, 2000 - Barra Funda, São Paulo - SP", lat: -23.5175, lng: -46.678 },
      { endereco: "Av. Santo Amaro, 4500 - Brooklin, São Paulo - SP", lat: -23.62, lng: -46.68 },
      { endereco: "Rua Olimpíadas, 205 - Vila Olímpia, São Paulo - SP", lat: -23.5955, lng: -46.686 },
      { endereco: "Av. Cruzeiro do Sul, 1800 - Santana, São Paulo - SP", lat: -23.508, lng: -46.625 },
    ],
  },
  CPS: {
    nome: "Campinas", uf: "SP", ddd: "19",
    pontos: [
      { endereco: "Av. Norte-Sul, 1500 - Cambuí, Campinas - SP", lat: -22.894, lng: -47.053 },
      { endereco: "Av. John Boyd Dunlop, 3900 - Jd. Ipaussurama, Campinas - SP", lat: -22.918, lng: -47.115 },
      { endereco: "Av. Brasil, 1000 - Jd. Guanabara, Campinas - SP", lat: -22.893, lng: -47.069 },
      { endereco: "Rod. Dom Pedro I, km 136 - Campinas - SP", lat: -22.852, lng: -47.03 },
      { endereco: "Av. das Amoreiras, 2500 - Jd. Amoreiras, Campinas - SP", lat: -22.93, lng: -47.078 },
    ],
  },
  RJ: {
    nome: "Rio de Janeiro", uf: "RJ", ddd: "21",
    pontos: [
      { endereco: "Av. Rio Branco, 156 - Centro, Rio de Janeiro - RJ", lat: -22.906, lng: -43.177 },
      { endereco: "Av. das Américas, 4666 - Barra da Tijuca, Rio de Janeiro - RJ", lat: -23.0, lng: -43.365 },
      { endereco: "Av. Atlântica, 1702 - Copacabana, Rio de Janeiro - RJ", lat: -22.968, lng: -43.181 },
      { endereco: "Av. Brasil, 15000 - Penha, Rio de Janeiro - RJ", lat: -22.84, lng: -43.28 },
      { endereco: "Av. Pres. Vargas, 3131 - Cidade Nova, Rio de Janeiro - RJ", lat: -22.908, lng: -43.205 },
    ],
  },
  BH: {
    nome: "Belo Horizonte", uf: "MG", ddd: "31",
    pontos: [
      { endereco: "Av. Afonso Pena, 1500 - Centro, Belo Horizonte - MG", lat: -19.9245, lng: -43.9352 },
      { endereco: "Av. do Contorno, 6061 - Savassi, Belo Horizonte - MG", lat: -19.938, lng: -43.933 },
      { endereco: "Av. Cristiano Machado, 4000 - União, Belo Horizonte - MG", lat: -19.88, lng: -43.93 },
      { endereco: "Av. Amazonas, 5000 - Gameleira, Belo Horizonte - MG", lat: -19.94, lng: -43.985 },
      { endereco: "Av. Antônio Carlos, 6627 - Pampulha, Belo Horizonte - MG", lat: -19.87, lng: -43.965 },
    ],
  },
  CWB: {
    nome: "Curitiba", uf: "PR", ddd: "41",
    pontos: [
      { endereco: "Av. Sete de Setembro, 3000 - Rebouças, Curitiba - PR", lat: -25.44, lng: -49.27 },
      { endereco: "Av. Cândido de Abreu, 817 - Centro Cívico, Curitiba - PR", lat: -25.417, lng: -49.269 },
      { endereco: "Linha Verde, 9000 - Fanny, Curitiba - PR", lat: -25.48, lng: -49.255 },
    ],
  },
  POA: {
    nome: "Porto Alegre", uf: "RS", ddd: "51",
    pontos: [
      { endereco: "Av. Ipiranga, 6681 - Partenon, Porto Alegre - RS", lat: -30.059, lng: -51.172 },
      { endereco: "Av. Assis Brasil, 3500 - Cristo Redentor, Porto Alegre - RS", lat: -30.01, lng: -51.155 },
    ],
  },
  IBR: {
    nome: "Ibirubá", uf: "RS", ddd: "54",
    pontos: [
      { endereco: "Rua Mauá, 1000 - Centro, Ibirubá - RS", lat: -28.628, lng: -53.09 },
      { endereco: "RS-223, km 12 - Ibirubá - RS", lat: -28.605, lng: -53.13 },
    ],
  },
  FLN: {
    nome: "Florianópolis", uf: "SC", ddd: "48",
    pontos: [
      { endereco: "Av. Beira-Mar Norte, 2000 - Centro, Florianópolis - SC", lat: -27.585, lng: -48.548 },
      { endereco: "Rod. SC-401, 4100 - Saco Grande, Florianópolis - SC", lat: -27.55, lng: -48.5 },
    ],
  },
  BSB: {
    nome: "Brasília", uf: "DF", ddd: "61",
    pontos: [
      { endereco: "Eixo Monumental - Zona Cívico-Administrativa, Brasília - DF", lat: -15.789, lng: -47.899 },
      { endereco: "SIA Trecho 3 - Guará, Brasília - DF", lat: -15.802, lng: -47.95 },
      { endereco: "W3 Sul, Quadra 508 - Asa Sul, Brasília - DF", lat: -15.81, lng: -47.895 },
    ],
  },
  GYN: {
    nome: "Goiânia", uf: "GO", ddd: "62",
    pontos: [
      { endereco: "Av. T-63, 1200 - Setor Bueno, Goiânia - GO", lat: -16.702, lng: -49.283 },
      { endereco: "Av. Anhanguera, 5000 - Centro, Goiânia - GO", lat: -16.668, lng: -49.255 },
    ],
  },
  CGB: {
    nome: "Cuiabá", uf: "MT", ddd: "65",
    pontos: [
      { endereco: "Av. Historiador Rubens de Mendonça, 2000 - Bosque da Saúde, Cuiabá - MT", lat: -15.58, lng: -56.08 },
    ],
  },
  CGR: {
    nome: "Campo Grande", uf: "MS", ddd: "67",
    pontos: [{ endereco: "Av. Afonso Pena, 3000 - Centro, Campo Grande - MS", lat: -20.46, lng: -54.6 }],
  },
  SSA: {
    nome: "Salvador", uf: "BA", ddd: "71",
    pontos: [
      { endereco: "Av. Tancredo Neves, 1632 - Caminho das Árvores, Salvador - BA", lat: -12.98, lng: -38.458 },
      { endereco: "Av. Luís Viana Filho, 6000 - Paralela, Salvador - BA", lat: -12.93, lng: -38.41 },
    ],
  },
  REC: {
    nome: "Recife", uf: "PE", ddd: "81",
    pontos: [
      { endereco: "Av. Boa Viagem, 3000 - Boa Viagem, Recife - PE", lat: -8.12, lng: -34.895 },
      { endereco: "Av. Agamenon Magalhães, 2000 - Espinheiro, Recife - PE", lat: -8.048, lng: -34.895 },
    ],
  },
  FOR: {
    nome: "Fortaleza", uf: "CE", ddd: "85",
    pontos: [
      { endereco: "Av. Beira Mar, 3000 - Meireles, Fortaleza - CE", lat: -3.725, lng: -38.498 },
      { endereco: "Av. Washington Soares, 85 - Edson Queiroz, Fortaleza - CE", lat: -3.79, lng: -38.48 },
    ],
  },
  MAO: {
    nome: "Manaus", uf: "AM", ddd: "92",
    pontos: [
      { endereco: "Av. Djalma Batista, 1661 - Chapada, Manaus - AM", lat: -3.09, lng: -60.02 },
      { endereco: "Av. Buriti, 3000 - Distrito Industrial, Manaus - AM", lat: -3.12, lng: -59.96 },
    ],
  },
  BEL: {
    nome: "Belém", uf: "PA", ddd: "91",
    pontos: [
      { endereco: "Av. Almirante Barroso, 2500 - Marco, Belém - PA", lat: -1.43, lng: -48.46 },
      { endereco: "Av. Nazaré, 1000 - Nazaré, Belém - PA", lat: -1.452, lng: -48.485 },
    ],
  },
};

/* ========================================================= */
/*  MODELOS                                                  */
/* ========================================================= */

const MODELOS: Record<string, { categoria: CategoriaVeiculo; combustivel: string }> = {
  "Fiat Strada": { categoria: "pickup", combustivel: "Flex" },
  "VW Saveiro": { categoria: "pickup", combustivel: "Flex" },
  "Toyota Hilux": { categoria: "pickup", combustivel: "Diesel S10" },
  "Fiat Toro": { categoria: "pickup", combustivel: "Diesel S10" },
  "Chevrolet S10": { categoria: "pickup", combustivel: "Diesel S10" },
  "Ford Ranger": { categoria: "pickup", combustivel: "Diesel S10" },
  "Chevrolet Onix": { categoria: "car", combustivel: "Flex" },
  "Fiat Mobi": { categoria: "car", combustivel: "Flex" },
  "Renault Kwid": { categoria: "car", combustivel: "Flex" },
  "VW Polo": { categoria: "car", combustivel: "Flex" },
  "VW Gol": { categoria: "car", combustivel: "Flex" },
  "Hyundai HB20": { categoria: "car", combustivel: "Flex" },
  "Fiat Fiorino": { categoria: "van", combustivel: "Flex" },
  "Peugeot Partner": { categoria: "van", combustivel: "Flex" },
  "Renault Master": { categoria: "van", combustivel: "Diesel S10" },
  "Honda CG 160": { categoria: "motorcycle", combustivel: "Gasolina" },
  "Yamaha Factor 150": { categoria: "motorcycle", combustivel: "Gasolina" },
};

/* ========================================================= */
/*  FROTA (52 veículos)                                      */
/* ========================================================= */

/** [placa, modelo, condutor, status, filial, grupo, locadora] */
type LinhaFrota = [string, string, string, StatusVeiculo, keyof typeof FILIAIS, string, string];

const LINHAS_FROTA: LinhaFrota[] = [
  // São Paulo — Matriz (11)
  ["SVR2C84", "Fiat Strada", "Carlos Mendes", "parked", "SPM", "Comgás", "Localiza"],
  ["MKP2D45", "Renault Kwid", "Luiza Costa", "parked", "SPM", "Vivo", "Movida"],
  ["FGT1B23", "Chevrolet Onix", "Bruno Carvalho", "in_transit", "SPM", "Comgás", "Localiza"],
  ["KLM4D56", "Fiat Fiorino", "Ricardo Nogueira", "in_transit", "SPM", "Comgás", "Unidas"],
  ["GHJ7E89", "Toyota Hilux", "Thiago Rocha", "in_transit", "SPM", "Comgás", "Localiza"],
  ["RTY2F34", "Hyundai HB20", "Camila Duarte", "in_transit", "SPM", "Vivo", "Movida"],
  ["QWE5G67", "Honda CG 160", "Diego Martins", "in_transit", "SPM", "Vivo", "Frota Própria"],
  ["ASD8H90", "VW Polo", "Juliana Prado", "parked", "SPM", "Comgás", "Localiza"],
  ["ZXC3J12", "Renault Master", "Marcelo Tavares", "depot", "SPM", "Comgás", "Unidas"],
  ["POI6K45", "Fiat Toro", "Gustavo Henrique", "in_transit", "SPM", "Comgás", "Localiza"],
  ["LKJ9L78", "VW Gol", "Patrícia Gomes", "parked", "SPM", "Vivo", "Movida"],
  // Campinas (5)
  ["QRN8H73", "VW Saveiro", "Sem condutor vinculado", "maintenance", "CPS", "Comgás", "Localiza"],
  ["PTZ5B60", "VW Polo", "Rafael Souza", "depot", "CPS", "Vivo", "Movida"],
  ["MNB2M34", "Fiat Strada", "Leandro Pires", "in_transit", "CPS", "Comgás", "Localiza"],
  ["VCX5N67", "Chevrolet Onix", "Aline Ribeiro", "parked", "CPS", "Vivo", "Unidas"],
  ["BVN8P90", "Peugeot Partner", "Eduardo Lopes", "in_transit", "CPS", "Comgás", "Frota Própria"],
  // Rio de Janeiro (5)
  ["BRA4E21", "Chevrolet Onix", "João Silva", "in_transit", "RJ", "Vivo", "Movida"],
  ["RIO3Q12", "Fiat Strada", "Vinícius Araújo", "in_transit", "RJ", "Vivo", "Localiza"],
  ["GUA6R45", "Hyundai HB20", "Renata Moreira", "parked", "RJ", "Vivo", "Unidas"],
  ["CPB9S78", "Fiat Fiorino", "André Cardoso", "depot", "RJ", "Vivo", "Localiza"],
  ["NIT2T01", "Yamaha Factor 150", "Felipe Barros", "in_transit", "RJ", "Vivo", "Frota Própria"],
  // Belo Horizonte (5)
  ["RDX7J99", "Fiat Mobi", "Ana Paula", "in_transit", "BH", "Vivo", "Movida"],
  ["MGA4U23", "VW Saveiro", "Rodrigo Teixeira", "parked", "BH", "Vivo", "Localiza"],
  ["PAM7V56", "Chevrolet S10", "Henrique Dias", "in_transit", "BH", "Vivo", "Unidas"],
  ["SAV1W89", "Renault Kwid", "Larissa Fonseca", "parked", "BH", "Vivo", "Movida"],
  ["CTG5X12", "Fiat Strada", "Otávio Ramos", "maintenance", "BH", "Vivo", "Localiza"],
  // Curitiba (3)
  ["HST3A16", "Toyota Hilux", "Pedro Alves", "depot", "CWB", "Vivo", "Localiza"],
  ["PRN8Y34", "VW Polo", "Mariana Kowalski", "in_transit", "CWB", "Vivo", "Movida"],
  ["BAT2Z67", "Fiat Fiorino", "Jefferson Lima", "parked", "CWB", "Vivo", "Unidas"],
  // Porto Alegre (2) e Ibirubá (2) — Coprel
  ["GAU6A90", "Chevrolet S10", "Cristiano Becker", "in_transit", "POA", "Coprel", "Localiza"],
  ["IPI9B12", "Hyundai HB20", "Daniela Schmitt", "parked", "POA", "Coprel", "Movida"],
  ["CPR3C45", "Toyota Hilux", "Lucas Weber", "in_transit", "IBR", "Coprel", "Frota Própria"],
  ["IBR7D78", "Ford Ranger", "Márcio Klein", "depot", "IBR", "Coprel", "Frota Própria"],
  // Florianópolis (2)
  ["SCF1E01", "Fiat Strada", "Tatiane Silveira", "in_transit", "FLN", "Vivo", "Localiza"],
  ["BMN4F34", "Renault Kwid", "Igor Medeiros", "parked", "FLN", "Vivo", "Movida"],
  // Centro-Oeste (7)
  ["DFB8G67", "Chevrolet Onix", "Paulo Roberto", "in_transit", "BSB", "Vivo", "Localiza"],
  ["ESP2H90", "Fiat Toro", "Sabrina Castro", "parked", "BSB", "Vivo", "Unidas"],
  ["PLN5J23", "VW Gol", "Wesley Santana", "depot", "BSB", "Vivo", "Movida"],
  ["GOI9K56", "Fiat Strada", "Rogério Matos", "in_transit", "GYN", "Vivo", "Localiza"],
  ["ANH3L89", "Hyundai HB20", "Bianca Freitas", "parked", "GYN", "Vivo", "Movida"],
  ["MTC6M12", "Toyota Hilux", "Fábio Nunes", "in_transit", "CGB", "Vivo", "Localiza"],
  ["MSA1N45", "Chevrolet S10", "Vanessa Rezende", "maintenance", "CGR", "Vivo", "Unidas"],
  // Nordeste (6)
  ["BAH4P78", "Fiat Strada", "Antônio Brito", "in_transit", "SSA", "Vivo", "Localiza"],
  ["SSA8Q01", "VW Polo", "Luana Menezes", "parked", "SSA", "Vivo", "Movida"],
  ["PER2R34", "Renault Kwid", "Gabriel Cavalcanti", "in_transit", "REC", "Vivo", "Movida"],
  ["REC5S67", "Fiat Fiorino", "Elaine Pacheco", "depot", "REC", "Vivo", "Unidas"],
  ["CEA9T90", "Chevrolet Onix", "Francisco Holanda", "in_transit", "FOR", "Vivo", "Localiza"],
  ["FOR3U23", "Honda CG 160", "Raimundo Sales", "parked", "FOR", "Vivo", "Frota Própria"],
  // Norte (4)
  ["AMZ6V56", "Toyota Hilux", "Sérgio Lima", "depot", "MAO", "Vivo", "Localiza"],
  ["MAN1W89", "Fiat Strada", "Kátia Monteiro", "in_transit", "MAO", "Vivo", "Movida"],
  ["PAR4X12", "VW Saveiro", "Josué Farias", "depot", "BEL", "Vivo", "Unidas"],
  ["BEL7Y45", "Hyundai HB20", "Priscila Barros", "parked", "BEL", "Vivo", "Movida"],
];

/* ========================================================= */
/*  GERADOR DETERMINÍSTICO                                   */
/* ========================================================= */

/** Hash simples de string → número (mesma placa gera sempre os mesmos valores) */
function hashTexto(texto: string): number {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Número pseudoaleatório determinístico entre min e max (inclusive) */
function numeroEntre(semente: string, min: number, max: number): number {
  return min + (hashTexto(semente) % (max - min + 1));
}

/** Converte "61.240 km" em 61240 */
function kmTextoParaNumero(texto: string): number {
  return Number(texto.replace(/\D/g, ""));
}

const ALERTAS_POR_PLACA = new Map<string, { alerta: AlertaVeiculo; km: number }>(
  VEICULOS_ATENCAO.map((v) => [
    v.placa,
    {
      alerta: { nivel: v.status === "Crítico" ? "critico" : "atencao", descricao: v.pendencia },
      km: kmTextoParaNumero(v.km),
    },
  ])
);

function montarVeiculo(linha: LinhaFrota, indiceNaFilial: number): VeiculoFrota {
  const [placa, modelo, condutor, status, chaveFilial, grupo, locadora] = linha;
  const filial = FILIAIS[chaveFilial];
  const ponto = filial.pontos[indiceNaFilial % filial.pontos.length];
  const infoModelo = MODELOS[modelo];
  const infoAlerta = ALERTAS_POR_PLACA.get(placa);
  const emRota = status === "in_transit";

  const hora = String(numeroEntre(placa + "h", 6, 9)).padStart(2, "0");
  const minuto = String(numeroEntre(placa + "m", 0, 59)).padStart(2, "0");
  const finalTelefone = String(numeroEntre(placa + "t", 1000, 9999));

  return {
    id: `VEH-${filial.uf}-${placa}`,
    plate: placa,
    model: modelo,
    category: infoModelo.categoria,
    fuelType: infoModelo.combustivel,
    driver: condutor,
    driverPhone: `(${filial.ddd}) 9${numeroEntre(placa + "p", 7000, 9999)}-${finalTelefone}`,
    status,
    speed: emRota ? numeroEntre(placa + "v", 18, 78) : 0,
    heading: numeroEntre(placa + "d", 0, 359),
    odometer: infoAlerta?.km ?? numeroEntre(placa + "o", 12000, 95000),
    fuelLevel: numeroEntre(placa + "f", 14, 96),
    batteryLevel: status === "maintenance" ? numeroEntre(placa + "b", 40, 70) : numeroEntre(placa + "b", 86, 100),
    grupo,
    filial: filial.nome,
    locadora,
    state: filial.uf,
    lat: ponto.lat,
    lng: ponto.lng,
    address: ponto.endereco,
    lastTransmission: `Hoje, ${hora}:${minuto} (Carga diária de telemetria)`,
    alerta: infoAlerta?.alerta ?? null,
  };
}

/** Frota completa montada uma única vez (simula o banco de telemetria) */
const FROTA: VeiculoFrota[] = (() => {
  const contadorPorFilial: Record<string, number> = {};
  return LINHAS_FROTA.map((linha) => {
    const chave = linha[4];
    const indice = contadorPorFilial[chave] ?? 0;
    contadorPorFilial[chave] = indice + 1;
    return montarVeiculo(linha, indice);
  });
})();

/* ========================================================= */
/*  API MOCK                                                 */
/* ========================================================= */

const ATRASO_MS = 100;
const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Cache em memória por UF: voltar a um estado já visto não refaz a "requisição" */
const cachePorUf = new Map<string, VeiculoFrota[]>();

function contagemStatusVazia(): ContagemStatus {
  return { in_transit: 0, parked: 0, depot: 0, maintenance: 0 };
}

/** Visão macro: todos os estados com a contagem de veículos (total e por status) */
export async function fetchMacro(): Promise<{ estados: EstadoBrasil[] }> {
  await esperar(ATRASO_MS);
  const estados = ESTADOS_BRASIL.map((estado) => {
    const statusCounts = contagemStatusVazia();
    const veiculosDoEstado = FROTA.filter((v) => v.state === estado.uf);
    veiculosDoEstado.forEach((v) => statusCounts[v.status]++);
    return { ...estado, vehicleCount: veiculosDoEstado.length, statusCounts };
  });
  return { estados };
}

/** Visão micro: veículos das UFs informadas (com cache por UF) */
export async function fetchVehiclesByMultipleStates(ufs: string[]): Promise<VeiculoFrota[]> {
  const pendentes = ufs.filter((uf) => !cachePorUf.has(uf));
  if (pendentes.length > 0) {
    await esperar(ATRASO_MS);
    pendentes.forEach((uf) => {
      cachePorUf.set(uf, FROTA.filter((v) => v.state === uf));
    });
  }
  return ufs.flatMap((uf) => cachePorUf.get(uf) ?? []);
}

/** Busca um veículo pela placa (usado pelo "Focar veículo no mapa") */
export async function fetchVehicleByPlate(placa: string): Promise<VeiculoFrota | null> {
  await esperar(ATRASO_MS);
  const placaNormalizada = placa.trim().toUpperCase();
  return FROTA.find((v) => v.plate === placaNormalizada) ?? null;
}

/** Lista de placas existentes (usada pelo Assistente de IA para reconhecer placas) */
export const PLACAS_FROTA: string[] = FROTA.map((v) => v.plate);

/**
 * Busca síncrona por placa — apenas para o Assistente de IA mock montar respostas.
 * TODO(backend): a IA real consultará a API; remover este helper na integração.
 */
export function obterVeiculoPorPlaca(placa: string): VeiculoFrota | null {
  return FROTA.find((v) => v.plate === placa.trim().toUpperCase()) ?? null;
}

/**
 * Resumo síncrono da frota para o Assistente de IA (mock).
 * TODO(backend): virá de um endpoint de agregação.
 */
export function obterResumoFrota() {
  const porStatus = contagemStatusVazia();
  const porGrupo: Record<string, number> = {};
  FROTA.forEach((v) => {
    porStatus[v.status]++;
    porGrupo[v.grupo] = (porGrupo[v.grupo] ?? 0) + 1;
  });
  return {
    total: FROTA.length,
    porStatus,
    porGrupo,
    emManutencao: FROTA.filter((v) => v.status === "maintenance"),
    comAlerta: FROTA.filter((v) => v.alerta !== null),
  };
}
