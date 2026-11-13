/**
 * Camada de dados do Mapa e Escopo de Frota (mock determinístico — V1).
 *
 * Centraliza os 52 veículos ativos da frota para que TODOS os blocos da
 * Torre de Controle (KPIs, Mapa Macro/Micro, Tabelas de Atenção, Quadros 2×2,
 * Assistente de IA e Relatório Gerencial) compartilhem exatamente os mesmos
 * totais, status e regras de permissão/agrupamento.
 *
 * TODO(backend): substituir pelas rotas autenticadas da API da Torre de Controle.
 */

import type {
  AlertaVeiculo,
  CategoriaVeiculo,
  ContagemStatus,
  EscopoFrotaFiltro,
  EstadoBrasil,
  RegiaoBrasil,
  StatusVeiculo,
  VeiculoFrota,
} from "@/types/frota-mapa";
import { criarContagemStatusVazia } from "./config";
import { ESTADOS_BRASIL } from "./estados-brasil";

/* ========================================================= */
/*  HIERARQUIA E PERMISSÕES (DEMO DE ESCOPO)                 */
/* ========================================================= */

/** Os 3 departamentos visíveis quando o perfil simulado é um Admin Restrito */
export const DEPARTAMENTOS_ADMIN_RESTRITO = [
  "Operações de Campo",
  "Comercial & Vendas",
  "Engenharia & Manutenção",
] as const;

const LISTA_DEPARTAMENTOS = [
  "Operações de Campo",
  "Comercial & Vendas",
  "Engenharia & Manutenção",
  "Logística Corporativa",
  "Diretoria & Administrativo",
] as const;

const LISTA_UNIDADES_NEGOCIO = [
  "Operações Urbanas",
  "Agronegócio & Campo",
  "Engenharia & Serviços",
] as const;

/* ========================================================= */
/*  FILIAIS, CIDADES DE ALOCAÇÃO E ENDEREÇOS                 */
/* ========================================================= */

interface PontoEndereco {
  endereco: string;
  lat: number;
  lng: number;
}

interface Filial {
  nome: string;
  cidadeAlocacao: string;
  centroCidade: { lat: number; lng: number };
  uf: string;
  regiao: RegiaoBrasil;
  ddd: string;
  pontos: PontoEndereco[];
}

const FILIAIS: Record<string, Filial> = {
  SPM: {
    nome: "São Paulo — Matriz",
    cidadeAlocacao: "São Paulo — SP",
    centroCidade: { lat: -23.5505, lng: -46.6333 },
    uf: "SP",
    regiao: "Sudeste",
    ddd: "11",
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
    nome: "Campinas",
    cidadeAlocacao: "Campinas — SP",
    centroCidade: { lat: -22.9056, lng: -47.0608 },
    uf: "SP",
    regiao: "Sudeste",
    ddd: "19",
    pontos: [
      { endereco: "Av. Norte-Sul, 1500 - Cambuí, Campinas - SP", lat: -22.894, lng: -47.053 },
      { endereco: "Av. John Boyd Dunlop, 3900 - Jd. Ipaussurama, Campinas - SP", lat: -22.918, lng: -47.115 },
      { endereco: "Av. Brasil, 1000 - Jd. Guanabara, Campinas - SP", lat: -22.893, lng: -47.069 },
      { endereco: "Rod. Dom Pedro I, km 136 - Campinas - SP", lat: -22.852, lng: -47.03 },
      { endereco: "Av. das Amoreiras, 2500 - Jd. Amoreiras, Campinas - SP", lat: -22.93, lng: -47.078 },
    ],
  },
  RJ: {
    nome: "Rio de Janeiro",
    cidadeAlocacao: "Rio de Janeiro — RJ",
    centroCidade: { lat: -22.9068, lng: -43.1729 },
    uf: "RJ",
    regiao: "Sudeste",
    ddd: "21",
    pontos: [
      { endereco: "Av. Rio Branco, 156 - Centro, Rio de Janeiro - RJ", lat: -22.906, lng: -43.177 },
      { endereco: "Av. das Américas, 4666 - Barra da Tijuca, Rio de Janeiro - RJ", lat: -23.0, lng: -43.365 },
      { endereco: "Av. Atlântica, 1702 - Copacabana, Rio de Janeiro - RJ", lat: -22.968, lng: -43.181 },
      { endereco: "Av. Brasil, 15000 - Penha, Rio de Janeiro - RJ", lat: -22.84, lng: -43.28 },
      { endereco: "Av. Pres. Vargas, 3131 - Cidade Nova, Rio de Janeiro - RJ", lat: -22.908, lng: -43.205 },
    ],
  },
  BH: {
    nome: "Belo Horizonte",
    cidadeAlocacao: "Belo Horizonte — MG",
    centroCidade: { lat: -19.9167, lng: -43.9345 },
    uf: "MG",
    regiao: "Sudeste",
    ddd: "31",
    pontos: [
      { endereco: "Av. Afonso Pena, 1500 - Centro, Belo Horizonte - MG", lat: -19.9245, lng: -43.9352 },
      { endereco: "Av. do Contorno, 6061 - Savassi, Belo Horizonte - MG", lat: -19.938, lng: -43.933 },
      { endereco: "Av. Cristiano Machado, 4000 - União, Belo Horizonte - MG", lat: -19.88, lng: -43.93 },
      { endereco: "Av. Amazonas, 5000 - Gameleira, Belo Horizonte - MG", lat: -19.94, lng: -43.985 },
      { endereco: "Av. Antônio Carlos, 6627 - Pampulha, Belo Horizonte - MG", lat: -19.87, lng: -43.965 },
    ],
  },
  CWB: {
    nome: "Curitiba",
    cidadeAlocacao: "Curitiba — PR",
    centroCidade: { lat: -25.4284, lng: -49.2733 },
    uf: "PR",
    regiao: "Sul",
    ddd: "41",
    pontos: [
      { endereco: "Av. Sete de Setembro, 3000 - Rebouças, Curitiba - PR", lat: -25.44, lng: -49.27 },
      { endereco: "Av. Cândido de Abreu, 817 - Centro Cívico, Curitiba - PR", lat: -25.417, lng: -49.269 },
      { endereco: "Linha Verde, 9000 - Fanny, Curitiba - PR", lat: -25.48, lng: -49.255 },
    ],
  },
  POA: {
    nome: "Porto Alegre",
    cidadeAlocacao: "Porto Alegre — RS",
    centroCidade: { lat: -30.0346, lng: -51.2177 },
    uf: "RS",
    regiao: "Sul",
    ddd: "51",
    pontos: [
      { endereco: "Av. Ipiranga, 6681 - Partenon, Porto Alegre - RS", lat: -30.059, lng: -51.172 },
      { endereco: "Av. Assis Brasil, 3500 - Cristo Redentor, Porto Alegre - RS", lat: -30.01, lng: -51.155 },
    ],
  },
  IBR: {
    nome: "Ibirubá",
    cidadeAlocacao: "Ibirubá — RS",
    centroCidade: { lat: -28.6278, lng: -53.0897 },
    uf: "RS",
    regiao: "Sul",
    ddd: "54",
    pontos: [
      { endereco: "Rua Mauá, 1000 - Centro, Ibirubá - RS", lat: -28.628, lng: -53.09 },
      { endereco: "RS-223, km 12 - Ibirubá - RS", lat: -28.605, lng: -53.13 },
    ],
  },
  FLN: {
    nome: "Florianópolis",
    cidadeAlocacao: "Florianópolis — SC",
    centroCidade: { lat: -27.5954, lng: -48.548 },
    uf: "SC",
    regiao: "Sul",
    ddd: "48",
    pontos: [
      { endereco: "Av. Beira-Mar Norte, 2000 - Centro, Florianópolis - SC", lat: -27.585, lng: -48.548 },
      { endereco: "Rod. SC-401, 4100 - Saco Grande, Florianópolis - SC", lat: -27.55, lng: -48.5 },
    ],
  },
  BSB: {
    nome: "Brasília",
    cidadeAlocacao: "Brasília — DF",
    centroCidade: { lat: -15.7939, lng: -47.8828 },
    uf: "DF",
    regiao: "Centro-Oeste",
    ddd: "61",
    pontos: [
      { endereco: "Eixo Monumental - Zona Cívico-Administrativa, Brasília - DF", lat: -15.789, lng: -47.899 },
      { endereco: "SIA Trecho 3 - Guará, Brasília - DF", lat: -15.802, lng: -47.95 },
      { endereco: "W3 Sul, Quadra 508 - Asa Sul, Brasília - DF", lat: -15.81, lng: -47.895 },
    ],
  },
  GYN: {
    nome: "Goiânia",
    cidadeAlocacao: "Goiânia — GO",
    centroCidade: { lat: -16.6869, lng: -49.2648 },
    uf: "GO",
    regiao: "Centro-Oeste",
    ddd: "62",
    pontos: [
      { endereco: "Av. T-63, 1200 - Setor Bueno, Goiânia - GO", lat: -16.702, lng: -49.283 },
      { endereco: "Av. Anhanguera, 5000 - Centro, Goiânia - GO", lat: -16.668, lng: -49.255 },
    ],
  },
  CGB: {
    nome: "Cuiabá",
    cidadeAlocacao: "Cuiabá — MT",
    centroCidade: { lat: -15.6014, lng: -56.0979 },
    uf: "MT",
    regiao: "Centro-Oeste",
    ddd: "65",
    pontos: [
      { endereco: "Av. Historiador Rubens de Mendonça, 2000 - Bosque da Saúde, Cuiabá - MT", lat: -15.58, lng: -56.08 },
    ],
  },
  CGR: {
    nome: "Campo Grande",
    cidadeAlocacao: "Campo Grande — MS",
    centroCidade: { lat: -20.4697, lng: -54.6201 },
    uf: "MS",
    regiao: "Centro-Oeste",
    ddd: "67",
    pontos: [{ endereco: "Av. Afonso Pena, 3000 - Centro, Campo Grande - MS", lat: -20.46, lng: -54.6 }],
  },
  SSA: {
    nome: "Salvador",
    cidadeAlocacao: "Salvador — BA",
    centroCidade: { lat: -12.9714, lng: -38.5014 },
    uf: "BA",
    regiao: "Nordeste",
    ddd: "71",
    pontos: [
      { endereco: "Av. Tancredo Neves, 1632 - Caminho das Árvores, Salvador - BA", lat: -12.98, lng: -38.458 },
      { endereco: "Av. Luís Viana Filho, 6000 - Paralela, Salvador - BA", lat: -12.93, lng: -38.41 },
    ],
  },
  REC: {
    nome: "Recife",
    cidadeAlocacao: "Recife — PE",
    centroCidade: { lat: -8.0476, lng: -34.877 },
    uf: "PE",
    regiao: "Nordeste",
    ddd: "81",
    pontos: [
      { endereco: "Av. Boa Viagem, 3000 - Boa Viagem, Recife - PE", lat: -8.12, lng: -34.895 },
      { endereco: "Av. Agamenon Magalhães, 2000 - Espinheiro, Recife - PE", lat: -8.048, lng: -34.895 },
    ],
  },
  FOR: {
    nome: "Fortaleza",
    cidadeAlocacao: "Fortaleza — CE",
    centroCidade: { lat: -3.7319, lng: -38.5267 },
    uf: "CE",
    regiao: "Nordeste",
    ddd: "85",
    pontos: [
      { endereco: "Av. Beira Mar, 3000 - Meireles, Fortaleza - CE", lat: -3.725, lng: -38.498 },
      { endereco: "Av. Washington Soares, 85 - Edson Queiroz, Fortaleza - CE", lat: -3.79, lng: -38.48 },
    ],
  },
  MAO: {
    nome: "Manaus",
    cidadeAlocacao: "Manaus — AM",
    centroCidade: { lat: -3.119, lng: -60.0217 },
    uf: "AM",
    regiao: "Norte",
    ddd: "92",
    pontos: [
      { endereco: "Av. Djalma Batista, 1661 - Chapada, Manaus - AM", lat: -3.09, lng: -60.02 },
      { endereco: "Av. Buriti, 3000 - Distrito Industrial, Manaus - AM", lat: -3.12, lng: -59.96 },
    ],
  },
  BEL: {
    nome: "Belém",
    cidadeAlocacao: "Belém — PA",
    centroCidade: { lat: -1.4558, lng: -48.4902 },
    uf: "PA",
    regiao: "Norte",
    ddd: "91",
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
/*  REGRA OFICIAL DE STATUS E PRECEDÊNCIA (PDF 13/11/2026)   */
/* ========================================================= */

/**
 * Calcula o status exclusivo de cada veículo no mapa:
 * - `Em Oficina` prevalece sobre qualquer outro status, com ou sem telemetria.
 * - `Sem telemetria` vale para veículos sem equipamento ativo (e fora da oficina).
 * - `Sem posição` vale quando há telemetria, mas sem transmissão há > 7 dias (168h).
 * - `Em Rota` vale quando a última posição tem ≤ 5h e velocidade ≠ 0.
 * - `Parado` cobre os demais veículos com telemetria até 7 dias (velocidade = 0 ou > 5h).
 */
export function calcularStatusVeiculoMapa(params: {
  emOficina: boolean;
  temTelemetria: boolean;
  horasDesdeUltimaPosicao: number | null;
  velocidade: number;
}): StatusVeiculo {
  if (params.emOficina) return "maintenance";
  if (!params.temTelemetria || params.horasDesdeUltimaPosicao === null) return "no_telemetry";
  if (params.horasDesdeUltimaPosicao > 24 * 7) return "no_position";
  if (params.horasDesdeUltimaPosicao <= 5 && params.velocidade !== 0) return "in_transit";
  return "stopped";
}

/* ========================================================= */
/*  CENÁRIOS DETERMINÍSTICOS DOS 52 VEÍCULOS                 */
/* ========================================================= */

type PerfilOperacional =
  | "em_rota"
  | "parado_recente"
  | "parado_mais_5h"
  | "oficina_com_telemetria"
  | "oficina_sem_telemetria"
  | "sem_posicao_7d"
  | "sem_telemetria";

/** [placa, modelo, condutor, perfilOperacional, filial, locadora] */
type LinhaFrota = [
  string,
  string,
  string,
  PerfilOperacional,
  keyof typeof FILIAIS,
  string,
];

/**
 * Frota de 52 veículos ativos:
 * - 22 Em Rota (`in_transit`)
 * - 17 Parados (`stopped`)
 * -  3 Em Oficina (`maintenance` — 2 com telemetria e 1 sem telemetria, validando precedência)
 * -  4 Sem posição há > 7 dias (`no_position`)
 * -  6 Sem telemetria (`no_telemetry` — posicionados pela cidade de alocação)
 * Soma = 52 veículos.
 */
const LINHAS_FROTA: LinhaFrota[] = [
  // São Paulo — Matriz (11)
  ["SVR2C84", "Fiat Strada", "Carlos Mendes", "parado_recente", "SPM", "Localiza"],
  ["MKP2D45", "Renault Kwid", "Luiza Costa", "parado_mais_5h", "SPM", "Movida"],
  ["FGT1B23", "Chevrolet Onix", "Bruno Carvalho", "em_rota", "SPM", "Localiza"],
  ["KLM4D56", "Fiat Fiorino", "Ricardo Nogueira", "em_rota", "SPM", "Unidas"],
  ["GHJ7E89", "Toyota Hilux", "Thiago Rocha", "em_rota", "SPM", "Localiza"],
  ["RTY2F34", "Hyundai HB20", "Camila Duarte", "em_rota", "SPM", "Movida"],
  ["QWE5G67", "Honda CG 160", "Diego Martins", "em_rota", "SPM", "Frota Própria"],
  ["ASD8H90", "VW Polo", "Juliana Prado", "parado_recente", "SPM", "Localiza"],
  ["ZXC3J12", "Renault Master", "Marcelo Tavares", "sem_posicao_7d", "SPM", "Unidas"],
  ["POI6K45", "Fiat Toro", "Gustavo Henrique", "em_rota", "SPM", "Localiza"],
  ["LKJ9L78", "VW Gol", "Patrícia Gomes", "parado_mais_5h", "SPM", "Movida"],
  // Campinas (5)
  ["QRN8H73", "VW Saveiro", "Sem condutor vinculado", "oficina_com_telemetria", "CPS", "Localiza"],
  ["PTZ5B60", "VW Polo", "Rafael Souza", "sem_telemetria", "CPS", "Movida"],
  ["MNB2M34", "Fiat Strada", "Leandro Pires", "em_rota", "CPS", "Localiza"],
  ["VCX5N67", "Chevrolet Onix", "Aline Ribeiro", "parado_recente", "CPS", "Unidas"],
  ["BVN8P90", "Peugeot Partner", "Eduardo Lopes", "em_rota", "CPS", "Frota Própria"],
  // Rio de Janeiro (5)
  ["BRA4E21", "Chevrolet Onix", "João Silva", "em_rota", "RJ", "Movida"],
  ["RIO3Q12", "Fiat Strada", "Vinícius Araújo", "em_rota", "RJ", "Localiza"],
  ["GUA6R45", "Hyundai HB20", "Renata Moreira", "parado_recente", "RJ", "Unidas"],
  ["CPB9S78", "Fiat Fiorino", "André Cardoso", "sem_posicao_7d", "RJ", "Localiza"],
  ["NIT2T01", "Yamaha Factor 150", "Felipe Barros", "em_rota", "RJ", "Frota Própria"],
  // Belo Horizonte (5)
  ["RDX7J99", "Fiat Mobi", "Ana Paula", "em_rota", "BH", "Movida"],
  ["MGA4U23", "VW Saveiro", "Rodrigo Teixeira", "parado_mais_5h", "BH", "Localiza"],
  ["PAM7V56", "Chevrolet S10", "Henrique Dias", "em_rota", "BH", "Unidas"],
  ["SAV1W89", "Renault Kwid", "Larissa Fonseca", "parado_recente", "BH", "Movida"],
  ["CTG5X12", "Fiat Strada", "Otávio Ramos", "oficina_com_telemetria", "BH", "Localiza"],
  // Curitiba (3)
  ["HST3A16", "Toyota Hilux", "Pedro Alves", "sem_telemetria", "CWB", "Localiza"],
  ["PRN8Y34", "VW Polo", "Mariana Kowalski", "em_rota", "CWB", "Movida"],
  ["BAT2Z67", "Fiat Fiorino", "Jefferson Lima", "parado_recente", "CWB", "Unidas"],
  // Porto Alegre (2) e Ibirubá (2)
  ["GAU6A90", "Chevrolet S10", "Cristiano Becker", "em_rota", "POA", "Localiza"],
  ["IPI9B12", "Hyundai HB20", "Daniela Schmitt", "parado_mais_5h", "POA", "Movida"],
  ["CPR3C45", "Toyota Hilux", "Lucas Weber", "em_rota", "IBR", "Frota Própria"],
  ["IBR7D78", "Ford Ranger", "Márcio Klein", "sem_telemetria", "IBR", "Frota Própria"],
  // Florianópolis (2)
  ["SCF1E01", "Fiat Strada", "Tatiane Silveira", "em_rota", "FLN", "Localiza"],
  ["BMN4F34", "Renault Kwid", "Igor Medeiros", "parado_recente", "FLN", "Movida"],
  // Centro-Oeste (7)
  ["DFB8G67", "Chevrolet Onix", "Paulo Roberto", "em_rota", "BSB", "Localiza"],
  ["ESP2H90", "Fiat Toro", "Sabrina Castro", "parado_recente", "BSB", "Unidas"],
  ["PLN5J23", "VW Gol", "Wesley Santana", "sem_posicao_7d", "BSB", "Movida"],
  ["GOI9K56", "Fiat Strada", "Rogério Matos", "em_rota", "GYN", "Localiza"],
  ["ANH3L89", "Hyundai HB20", "Bianca Freitas", "parado_mais_5h", "GYN", "Movida"],
  ["MTC6M12", "Toyota Hilux", "Fábio Nunes", "em_rota", "CGB", "Localiza"],
  ["MSA1N45", "Chevrolet S10", "Vanessa Rezende", "oficina_sem_telemetria", "CGR", "Unidas"],
  // Nordeste (6)
  ["BAH4P78", "Fiat Strada", "Antônio Brito", "em_rota", "SSA", "Localiza"],
  ["SSA8Q01", "VW Polo", "Luana Menezes", "parado_recente", "SSA", "Movida"],
  ["PER2R34", "Renault Kwid", "Gabriel Cavalcanti", "em_rota", "REC", "Movida"],
  ["REC5S67", "Fiat Fiorino", "Elaine Pacheco", "sem_telemetria", "REC", "Unidas"],
  ["CEA9T90", "Chevrolet Onix", "Francisco Holanda", "parado_mais_5h", "FOR", "Localiza"],
  ["FOR3U23", "Honda CG 160", "Raimundo Sales", "sem_telemetria", "FOR", "Frota Própria"],
  // Norte (4)
  ["AMZ6V56", "Toyota Hilux", "Sérgio Lima", "sem_posicao_7d", "MAO", "Localiza"],
  ["MAN1W89", "Fiat Strada", "Kátia Monteiro", "em_rota", "MAO", "Movida"],
  ["PAR4X12", "VW Saveiro", "Josué Farias", "sem_telemetria", "BEL", "Unidas"],
  ["BEL7Y45", "Hyundai HB20", "Priscila Barros", "parado_recente", "BEL", "Movida"],
];

/* ========================================================= */
/*  ALERTAS OPERACIONAIS POR PLACA                           */
/* ========================================================= */

const ALERTAS_POR_PLACA = new Map<string, { alerta: AlertaVeiculo; km: number }>([
  ["SVR2C84", { alerta: { nivel: "critico", descricao: "Revisão vencida há 42 dias" }, km: 61240 }],
  ["QRN8H73", { alerta: { nivel: "critico", descricao: "Sinistro em aberto · O.S. ativa" }, km: 48902 }],
  ["BRA4E21", { alerta: { nivel: "atencao", descricao: "CNH vence em 18 dias" }, km: 35117 }],
  ["RDX7J99", { alerta: { nivel: "atencao", descricao: "KM 32% acima da média" }, km: 72586 }],
  ["HST3A16", { alerta: { nivel: "atencao", descricao: "Licenciamento a vencer" }, km: 54330 }],
  ["MKP2D45", { alerta: { nivel: "atencao", descricao: "Multa pendente de identificação" }, km: 22408 }],
  ["ZXC3J12", { alerta: { nivel: "atencao", descricao: "Sem sinal de telemetria há 11 dias" }, km: 68190 }],
]);

/* ========================================================= */
/*  GERADOR DETERMINÍSTICO                                   */
/* ========================================================= */

function hashTexto(texto: string): number {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function numeroEntre(semente: string, min: number, max: number): number {
  return min + (hashTexto(semente) % (max - min + 1));
}

function escolherUnidadeNegocio(regiao: RegiaoBrasil, categoria: CategoriaVeiculo): string {
  if (regiao === "Centro-Oeste" || regiao === "Sul") {
    return categoria === "pickup" ? LISTA_UNIDADES_NEGOCIO[1] : LISTA_UNIDADES_NEGOCIO[0];
  }
  if (categoria === "van") return LISTA_UNIDADES_NEGOCIO[2];
  return LISTA_UNIDADES_NEGOCIO[0];
}

function montarVeiculo(linha: LinhaFrota, indiceNaFilial: number, indiceGlobal: number): VeiculoFrota {
  const [placa, modelo, condutor, perfil, chaveFilial, locadora] = linha;
  const filial = FILIAIS[chaveFilial];
  const infoModelo = MODELOS[modelo];
  const infoAlerta = ALERTAS_POR_PLACA.get(placa);

  const temTelemetria = perfil !== "sem_telemetria" && perfil !== "oficina_sem_telemetria";
  const emOficina = perfil === "oficina_com_telemetria" || perfil === "oficina_sem_telemetria";

  // Velocidade e idade da última posição conforme o perfil operacional
  let velocidade = 0;
  let horasDesdeUltimaPosicao: number | null = null;
  let dataHoraUltimaPosicao: string | null = null;
  let lastTransmission = "";

  if (!temTelemetria) {
    velocidade = 0;
    horasDesdeUltimaPosicao = null;
    dataHoraUltimaPosicao = null;
    lastTransmission = emOficina
      ? `O.S. aberta · Alocação cadastral (${filial.cidadeAlocacao})`
      : `Posicionado pelo cadastro · ${filial.cidadeAlocacao}`;
  } else if (perfil === "em_rota") {
    velocidade = numeroEntre(placa + "vel", 22, 78);
    horasDesdeUltimaPosicao = numeroEntre(placa + "hr", 1, 4);
    const hora = String(14 - Math.min(horasDesdeUltimaPosicao, 4)).padStart(2, "0");
    const minuto = String(numeroEntre(placa + "min", 10, 58)).padStart(2, "0");
    dataHoraUltimaPosicao = `13/11/2026 às ${hora}:${minuto}`;
    lastTransmission = `Hoje, ${hora}:${minuto} · há ${horasDesdeUltimaPosicao}h`;
  } else if (perfil === "parado_recente") {
    velocidade = 0;
    horasDesdeUltimaPosicao = numeroEntre(placa + "hrp", 1, 4);
    const hora = String(14 - Math.min(horasDesdeUltimaPosicao, 4)).padStart(2, "0");
    const minuto = String(numeroEntre(placa + "minp", 5, 55)).padStart(2, "0");
    dataHoraUltimaPosicao = `13/11/2026 às ${hora}:${minuto}`;
    lastTransmission = `Hoje, ${hora}:${minuto} · parado (0 km/h)`;
  } else if (perfil === "parado_mais_5h") {
    // Regra #2: posição recebida há mais de 5h e até 7 dias → Parado (mesmo se última velocidade != 0)
    velocidade = numeroEntre(placa + "vel5", 0, 1) === 1 ? numeroEntre(placa + "v5", 15, 42) : 0;
    const diasAtras = numeroEntre(placa + "dias", 1, 4);
    horasDesdeUltimaPosicao = diasAtras * 24 + numeroEntre(placa + "h5", 2, 10);
    const diaMes = String(13 - diasAtras).padStart(2, "0");
    const hora = String(numeroEntre(placa + "hr5", 8, 19)).padStart(2, "0");
    const minuto = String(numeroEntre(placa + "mn5", 10, 55)).padStart(2, "0");
    dataHoraUltimaPosicao = `${diaMes}/11/2026 às ${hora}:${minuto}`;
    lastTransmission = `${diaMes}/11 às ${hora}:${minuto} · há ${diasAtras}d`;
  } else if (perfil === "oficina_com_telemetria") {
    velocidade = 0;
    horasDesdeUltimaPosicao = 18;
    const hora = String(numeroEntre(placa + "hro", 8, 17)).padStart(2, "0");
    const minuto = String(numeroEntre(placa + "mno", 10, 50)).padStart(2, "0");
    dataHoraUltimaPosicao = `12/11/2026 às ${hora}:${minuto}`;
    lastTransmission = `O.S. aberta · Última pos. 12/11 às ${hora}:${minuto}`;
  } else {
    // sem_posicao_7d: > 7 dias sem transmitir
    velocidade = 0;
    const diasSemSinal = numeroEntre(placa + "sem", 9, 15);
    horasDesdeUltimaPosicao = diasSemSinal * 24;
    const diaOutubroOuNov = 13 - diasSemSinal;
    const dataFormatada =
      diaOutubroOuNov >= 1
        ? `${String(diaOutubroOuNov).padStart(2, "0")}/11/2026`
        : `${String(31 + diaOutubroOuNov).padStart(2, "0")}/10/2026`;
    const hora = String(numeroEntre(placa + "hrs", 7, 19)).padStart(2, "0");
    const minuto = String(numeroEntre(placa + "mns", 10, 55)).padStart(2, "0");
    dataHoraUltimaPosicao = `${dataFormatada} às ${hora}:${minuto}`;
    lastTransmission = `Sem sinal há ${diasSemSinal} dias (${dataFormatada})`;
  }

  const status = calcularStatusVeiculoMapa({
    emOficina,
    temTelemetria,
    horasDesdeUltimaPosicao,
    velocidade,
  });

  // Coordenada: telemetria usa última posição real na via; sem telemetria usa a cidade de alocação do cadastro
  const pontoVia = filial.pontos[indiceNaFilial % filial.pontos.length];
  const desvioLatCadastro = ((indiceGlobal % 5) - 2) * 0.0042;
  const desvioLngCadastro = (((indiceGlobal * 3) % 5) - 2) * 0.0042;

  const lat = temTelemetria ? pontoVia.lat : filial.centroCidade.lat + desvioLatCadastro;
  const lng = temTelemetria ? pontoVia.lng : filial.centroCidade.lng + desvioLngCadastro;
  const address = temTelemetria
    ? pontoVia.endereco
    : `${filial.cidadeAlocacao} (Cidade de alocação do cadastro)`;

  const departamento = LISTA_DEPARTAMENTOS[indiceGlobal % LISTA_DEPARTAMENTOS.length];
  const unidadeNegocio = escolherUnidadeNegocio(filial.regiao, infoModelo.categoria);
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
    temTelemetria,
    emOficina,
    origemPosicao: temTelemetria ? "telemetria" : "cadastro",
    dataHoraUltimaPosicao,
    cidadeAlocacao: filial.cidadeAlocacao,
    speed: status === "in_transit" ? velocidade : 0,
    heading: temTelemetria ? numeroEntre(placa + "d", 0, 359) : 0,
    odometer: infoAlerta?.km ?? numeroEntre(placa + "o", 12000, 95000),
    fuelLevel: temTelemetria ? numeroEntre(placa + "f", 18, 96) : 0,
    batteryLevel: temTelemetria
      ? status === "maintenance" || status === "no_position"
        ? numeroEntre(placa + "b", 42, 72)
        : numeroEntre(placa + "b", 86, 100)
      : 0,
    filial: filial.nome,
    regiao: filial.regiao,
    regional: `Regional ${filial.regiao}`,
    unidadeNegocio,
    departamento,
    locadora,
    state: filial.uf,
    lat,
    lng,
    address,
    lastTransmission,
    alerta: infoAlerta?.alerta ?? null,
  };
}

/** Frota completa montada uma única vez (52 veículos ativos) */
export const FROTA_COMPLETA: VeiculoFrota[] = (() => {
  const contadorPorFilial: Record<string, number> = {};
  return LINHAS_FROTA.map((linha, indiceGlobal) => {
    const chave = linha[4];
    const indice = contadorPorFilial[chave] ?? 0;
    contadorPorFilial[chave] = indice + 1;
    return montarVeiculo(linha, indice, indiceGlobal);
  });
})();

/* ========================================================= */
/*  FILTRAGEM POR ESCOPO DE PERMISSÃO E AGRUPAMENTO          */
/* ========================================================= */

/**
 * Aplica simultaneamente:
 * 1. O escopo máximo permitido pelo perfil do usuário (ex.: Admin restrito a 3 departamentos);
 * 2. O valor selecionado no filtro de agrupamento (Filial, Regional, UN ou Departamento);
 * 3. O filtro de Locadora.
 */
export function filtrarFrotaPorEscopo(escopo?: EscopoFrotaFiltro): VeiculoFrota[] {
  if (!escopo) return FROTA_COMPLETA;

  const departamentosPermitidos = new Set<string>(DEPARTAMENTOS_ADMIN_RESTRITO);

  return FROTA_COMPLETA.filter((veiculo) => {
    // 1. Limite de permissão do perfil
    if (
      escopo.perfilDemo === "departamentos_restrito" &&
      !departamentosPermitidos.has(veiculo.departamento)
    ) {
      return false;
    }

    // 2. Filtro de agrupamento escolhido no topo
    if (escopo.agrupamento && escopo.agrupamento !== "todos") {
      if (escopo.perfilDemo === "filiais" && veiculo.filial !== escopo.agrupamento) return false;
      if (escopo.perfilDemo === "regionais" && veiculo.regional !== escopo.agrupamento) return false;
      if (escopo.perfilDemo === "unidades" && veiculo.unidadeNegocio !== escopo.agrupamento) return false;
      if (
        escopo.perfilDemo === "departamentos_restrito" &&
        veiculo.departamento !== escopo.agrupamento
      ) {
        return false;
      }
    }

    // 3. Filtro de locadora
    if (escopo.locadora && escopo.locadora !== "todas" && veiculo.locadora !== escopo.locadora) {
      return false;
    }

    return true;
  });
}

/* ========================================================= */
/*  API MOCK DO MAPA                                         */
/* ========================================================= */

const ATRASO_MS = 80;
const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function chaveCacheEscopo(escopo?: EscopoFrotaFiltro): string {
  if (!escopo) return "padrao";
  return `${escopo.perfilDemo}|${escopo.agrupamento}|${escopo.locadora}`;
}

/** Cache em memória por escopo + UF */
const cachePorEscopoUf = new Map<string, VeiculoFrota[]>();

/** Visão macro: todos os estados com a contagem de veículos (total e nos 5 status) */
export async function fetchMacro(escopo?: EscopoFrotaFiltro): Promise<{
  estados: EstadoBrasil[];
  veiculosEscopo: VeiculoFrota[];
}> {
  await esperar(ATRASO_MS);
  const frotaEscopo = filtrarFrotaPorEscopo(escopo);
  const estados = ESTADOS_BRASIL.map((estado) => {
    const statusCounts = criarContagemStatusVazia();
    const veiculosDoEstado = frotaEscopo.filter((v) => v.state === estado.uf);
    veiculosDoEstado.forEach((v) => statusCounts[v.status]++);
    return { ...estado, vehicleCount: veiculosDoEstado.length, statusCounts };
  });
  return { estados, veiculosEscopo: frotaEscopo };
}

/** Visão micro: veículos das UFs informadas respeitando o escopo atual */
export async function fetchVehiclesByMultipleStates(
  ufs: string[],
  escopo?: EscopoFrotaFiltro
): Promise<VeiculoFrota[]> {
  const prefixo = chaveCacheEscopo(escopo);
  const frotaEscopo = filtrarFrotaPorEscopo(escopo);
  const pendentes = ufs.filter((uf) => !cachePorEscopoUf.has(`${prefixo}:${uf}`));

  if (pendentes.length > 0) {
    await esperar(ATRASO_MS);
    pendentes.forEach((uf) => {
      cachePorEscopoUf.set(
        `${prefixo}:${uf}`,
        frotaEscopo.filter((v) => v.state === uf)
      );
    });
  }

  return ufs.flatMap((uf) => cachePorEscopoUf.get(`${prefixo}:${uf}`) ?? []);
}

/** Busca um veículo pela placa dentro do escopo permitido (usado pelo "Focar veículo no mapa") */
export async function fetchVehicleByPlate(
  placa: string,
  escopo?: EscopoFrotaFiltro
): Promise<VeiculoFrota | null> {
  await esperar(ATRASO_MS);
  const placaNormalizada = placa.trim().toUpperCase();
  const frotaEscopo = filtrarFrotaPorEscopo(escopo);
  return frotaEscopo.find((v) => v.plate === placaNormalizada) ?? null;
}

/** Lista de placas existentes na frota (usada pelo Assistente de IA) */
export const PLACAS_FROTA: string[] = FROTA_COMPLETA.map((v) => v.plate);

/** Busca síncrona por placa para o Assistente de IA mock */
export function obterVeiculoPorPlaca(
  placa: string,
  escopo?: EscopoFrotaFiltro
): VeiculoFrota | null {
  const frotaEscopo = filtrarFrotaPorEscopo(escopo);
  return frotaEscopo.find((v) => v.plate === placa.trim().toUpperCase()) ?? null;
}

/** Resumo síncrono da frota nos 5 status oficiais (usado pelo Assistente de IA e KPIs) */
export function obterResumoFrota(escopo?: EscopoFrotaFiltro): {
  total: number;
  porStatus: ContagemStatus;
  porRegional: Record<string, number>;
  emManutencao: VeiculoFrota[];
  comAlerta: VeiculoFrota[];
} {
  const frotaEscopo = filtrarFrotaPorEscopo(escopo);
  const porStatus = criarContagemStatusVazia();
  const porRegional: Record<string, number> = {};

  frotaEscopo.forEach((v) => {
    porStatus[v.status]++;
    porRegional[v.regional] = (porRegional[v.regional] ?? 0) + 1;
  });

  return {
    total: frotaEscopo.length,
    porStatus,
    porRegional,
    emManutencao: frotaEscopo.filter((v) => v.status === "maintenance"),
    comAlerta: frotaEscopo.filter((v) => v.alerta !== null),
  };
}
