/**
 * Dados mock da Matriz de Pontuação.
 *
 * Contém os eventos, classificações, regras de cálculo
 * e periodicidade de atualização do ranking.
 * Valores fixos para consistência no SSR.
 *
 * TODO(backend): Substituir por dados da configuração ativa do cliente via API.
 */

import type {
  EventoPontuacao,
  ClassificacaoFaixa,
  RegraCalculo,
  ItemPeriodicidade,
} from "@/types/matriz-pontuacao";

/* ========================================================= */
/*  TABELA DE PONTUAÇÃO POR EVENTO                           */
/* ========================================================= */

/**
 * Eventos que impactam a pontuação do condutor.
 * Ordenados por Origem: Telemetria → Multa → Registro.
 * Pontuação negativa indica dedução de pontos.
 */
export const matrizPontuacao: EventoPontuacao[] = [
  // --- Telemetria ---
  { origem: "Telemetria", evento: "Aceleração brusca", pontuacao: -2 },
  { origem: "Telemetria", evento: "Frenagem brusca", pontuacao: -3 },
  { origem: "Telemetria", evento: "Curva acentuada", pontuacao: -5 },
  {
    origem: "Telemetria",
    evento: "Não usar cinto de segurança ≥1 km",
    pontuacao: -100,
  },
  {
    origem: "Telemetria",
    evento: "Dirigir mais de 650 km no dia",
    pontuacao: -15,
  },
  {
    origem: "Telemetria",
    evento: "Dirigir mais de 5.000 km no mês",
    pontuacao: -20,
  },

  // --- Multa ---
  {
    origem: "Multa",
    evento: "Excesso de Velocidade – Médio (até 20% acima do limite da via)",
    pontuacao: -5,
  },
  {
    origem: "Multa",
    evento:
      "Excesso de Velocidade – Grave (entre 20% e 50% acima do limite da via)",
    pontuacao: -10,
  },
  {
    origem: "Multa",
    evento:
      "Excesso de Velocidade – Gravíssimo (acima de 50% acima do limite da via)",
    pontuacao: -30,
  },
  {
    origem: "Multa",
    evento: "Excesso de velocidade > 140 km/h por mais de 30 segundos",
    pontuacao: -100,
  },
  { origem: "Multa", evento: "Leve - CTB", pontuacao: -15 },
  { origem: "Multa", evento: "Média - CTB", pontuacao: -25 },
  { origem: "Multa", evento: "Grave - CTB", pontuacao: -50 },
  { origem: "Multa", evento: "Gravíssima - CTB", pontuacao: -80 },
  {
    origem: "Multa",
    evento: "Multa por dirigir sob influência de álcool",
    pontuacao: -100,
  },
  {
    origem: "Multa",
    evento: "Multa por dirigir sem cinto de segurança",
    pontuacao: -100,
  },
  {
    origem: "Multa",
    evento: "Multa por usar telefone celular ao dirigir",
    pontuacao: -100,
  },
  {
    origem: "Multa",
    evento: "Multa por ultrapassar em local não permitido",
    pontuacao: -100,
  },

  // --- Registro ---
  {
    origem: "Registro",
    evento: "Incidentes evitáveis com alto potencial",
    pontuacao: -60,
  },
];

/* ========================================================= */
/*  CLASSIFICAÇÃO DOS CONDUTORES                              */
/* ========================================================= */

/** Faixas de classificação com suas respectivas cores e intervalos */
export const classificacoes: ClassificacaoFaixa[] = [
  {
    classificacao: "Referência",
    descricaoPontuacao: "> 85 pontos no mês",
    cor: "referencia",
  },
  {
    classificacao: "Baixa exposição ao risco",
    descricaoPontuacao: "Entre 40-85 no mês",
    cor: "baixa",
  },
  {
    classificacao: "Média exposição ao risco",
    descricaoPontuacao: "< 40 pontos",
    cor: "media",
  },
  {
    classificacao: "Alta exposição ao risco",
    descricaoPontuacao: "-100 pontos",
    cor: "alta",
  },
];

/* ========================================================= */
/*  REGRAS DE CÁLCULO DO RANKING                              */
/* ========================================================= */

/** Regras numeradas que explicam o cálculo da pontuação */
export const regrasCalculo: RegraCalculo[] = [
  {
    numero: 1,
    descricao: "Cada condutor inicia o mês com {100 pontos}.",
    destaques: ["100 pontos"],
  },
  {
    numero: 2,
    descricao:
      "Pontos são deduzidos conforme os eventos registrados (Tabela de Pontuação).",
  },
  {
    numero: 3,
    descricao:
      "Um fator de multiplicação é aplicado com base na quilometragem percorrida no mês (apenas para itens de Telemetria).",
  },
  {
    numero: 4,
    descricao:
      "Comportamentos críticos (álcool, velocidade >140km/h, sem cinto ≥1km, celular, ultrapassagem proibida) eliminam {todos os 100 pontos}.",
    destaques: ["todos os 100 pontos"],
    destaqueDanger: true,
  },
  {
    numero: 5,
    descricao:
      "{Score Final = 100 - Σ(deduções) × Fator de Quilometragem}",
    destaques: ["Score Final = 100 - Σ(deduções) × Fator de Quilometragem"],
  },
  {
    numero: 6,
    descricao:
      "A pontuação anual do ranking é o {somatório das pontuações mensais} do condutor.",
    destaques: ["somatório das pontuações mensais"],
  },
];

/* ========================================================= */
/*  PERIODICIDADE DE ATUALIZAÇÃO                              */
/* ========================================================= */

/** Itens descritivos sobre a periodicidade de atualização */
export const periodicidade: ItemPeriodicidade[] = [
  {
    descricao:
      "O ranking é atualizado {mensalmente}, com reset de pontuação no início de cada mês.",
    destaques: ["mensalmente"],
  },
  {
    descricao:
      "A visão anual consolida as pontuações mensais para acompanhamento de longo prazo.",
  },
  {
    descricao:
      "As exceções aprovadas pelo gestor são aplicadas no mesmo período de referência do evento.",
  },
];
