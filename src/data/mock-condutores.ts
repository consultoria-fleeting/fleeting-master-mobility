/**
 * Dados mock de condutores para o Dashboard de Ranking.
 *
 * Os valores são fixos (sem Math.random em runtime) para evitar
 * hydration mismatch no SSR do Next.js. Futuramente esses dados
 * virão de uma API backend.
 *
 * TODO(backend): Substituir por chamadas à API quando disponível.
 */

import type {
  Condutor,
  ClassificacaoType,
  OpcoesFiltro,
} from "@/types/condutor";

/**
 * Retorna a classificação do condutor com base na pontuação.
 *
 * - > 85 pontos → Referência
 * - 40 a 85 pontos → Baixa Exposição
 * - 1 a 39 pontos → Média Exposição
 * - 0 pontos → Alta Exposição
 */
export function getClassificacao(pontuacao: number): ClassificacaoType {
  if (pontuacao > 85) return "referencia";
  if (pontuacao >= 40 && pontuacao <= 85) return "baixa";
  if (pontuacao > 0 && pontuacao < 40) return "media";
  return "alta";
}

/* ---------- Listas de referência ---------- */

/** Meses do ano em português — reutilizável em componentes */
export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

const NEGOCIOS = ["Crop Protection", "Seeds", "Digital", "Flores"];
const DEPARTAMENTOS = [
  "Comercial",
  "Operações",
  "Logística",
  "Técnico",
  "Administrativo",
];
const FUNCOES = [
  "Representante",
  "Supervisor",
  "Analista",
  "Coordenador",
  "Gerente",
];
const GESTORES = [
  "Carlos Silva",
  "Ana Ribeiro",
  "Roberto Santos",
  "Maria Costa",
  "João Pereira",
];

/* ---------- Dados de condutores ---------- */

interface CondutorSeed {
  nome: string;
  pontuacao: number;
}

/**
 * Pontuações fixas (seed) para evitar valores aleatórios em runtime.
 * Cada condutor possui uma pontuação pré-definida.
 */
const CONDUTORES_SEED: CondutorSeed[] = [
  { nome: "Lucas Oliveira", pontuacao: 95 },
  { nome: "Fernanda Souza", pontuacao: 92 },
  { nome: "Pedro Almeida", pontuacao: 90 },
  { nome: "Juliana Santos", pontuacao: 89 },
  { nome: "Marcos Lima", pontuacao: 88 },
  { nome: "Patrícia Ferreira", pontuacao: 87 },
  { nome: "Rafael Costa", pontuacao: 86 },
  { nome: "Camila Rodrigues", pontuacao: 82 },
  { nome: "Bruno Martins", pontuacao: 78 },
  { nome: "Amanda Gomes", pontuacao: 75 },
  { nome: "Thiago Nascimento", pontuacao: 72 },
  { nome: "Larissa Barbosa", pontuacao: 68 },
  { nome: "Diego Araujo", pontuacao: 65 },
  { nome: "Vanessa Cardoso", pontuacao: 60 },
  { nome: "Felipe Moreira", pontuacao: 55 },
  { nome: "Beatriz Vieira", pontuacao: 50 },
  { nome: "Gustavo Ribeiro", pontuacao: 48 },
  { nome: "Isabela Dias", pontuacao: 45 },
  { nome: "André Pereira", pontuacao: 42 },
  { nome: "Carolina Teixeira", pontuacao: 40 },
  { nome: "Ricardo Mendes", pontuacao: 38 },
  { nome: "Natália Rocha", pontuacao: 35 },
  { nome: "Eduardo Carvalho", pontuacao: 30 },
  { nome: "Priscila Nunes", pontuacao: 25 },
  { nome: "Leonardo Campos", pontuacao: 20 },
  { nome: "Mariana Castro", pontuacao: 15 },
  { nome: "Henrique Melo", pontuacao: 10 },
  { nome: "Gabriela Lopes", pontuacao: 5 },
  { nome: "Daniel Correia", pontuacao: 0 },
  { nome: "Renata Pinto", pontuacao: 0 },
];

/**
 * Variações fixas de pontuação mensal por índice do condutor.
 * Simula a evolução da pontuação ao longo do ano de forma determinística.
 * Cada sub-array tem 12 deltas (Jan-Dez) que serão somados à pontuação base.
 */
const VARIACOES_MENSAIS: number[][] = [
  [-3, -1, 0, 2, -2, 1, 0, -1, 3, -2, 1, 0],
  [0, -2, 1, -1, 3, -3, 2, 0, -1, 1, -2, 2],
  [-1, 2, -3, 0, 1, -2, 3, -1, 0, 2, -1, 1],
  [2, -1, 0, -3, 1, 2, -2, 3, -1, 0, 1, -2],
  [-2, 0, 3, -1, -2, 1, 0, -3, 2, 1, -1, 0],
  [1, -3, 2, 0, -1, -2, 1, 2, -3, 0, 3, -1],
];

/**
 * Gera as pontuações mensais de um condutor baseando-se na pontuação base
 * e variações determinísticas. O mês atual (Julho 2026) limita a quantidade
 * de meses exibidos na aba anual.
 */
function gerarPontuacoesMensais(
  pontuacaoBase: number,
  indice: number
): Record<string, number> {
  const variacao = VARIACOES_MENSAIS[indice % VARIACOES_MENSAIS.length];
  const resultado: Record<string, number> = {};

  // Simula até Novembro (mês 11 = índice 10), para testar scroll lateral
  const mesesDisponiveis = 11;

  for (let i = 0; i < mesesDisponiveis; i++) {
    const pontuacaoMes = Math.max(0, Math.min(100, pontuacaoBase + variacao[i]));
    resultado[MESES[i]] = pontuacaoMes;
  }

  return resultado;
}

/**
 * Lista completa de condutores, já ordenada por pontuação (decrescente)
 * e com posição definida.
 */
export const condutores: Condutor[] = CONDUTORES_SEED.sort(
  (a, b) => b.pontuacao - a.pontuacao
).map((seed, indice) => ({
  posicao: indice + 1,
  nome: seed.nome,
  gestor: GESTORES[indice % GESTORES.length],
  centroCusto: `CC-${1000 + indice}`,
  departamento: DEPARTAMENTOS[indice % DEPARTAMENTOS.length],
  funcao: FUNCOES[indice % FUNCOES.length],
  negocio: NEGOCIOS[indice % NEGOCIOS.length],
  pontuacao: seed.pontuacao,
  classificacao: getClassificacao(seed.pontuacao),
  pontuacoesMensais: gerarPontuacoesMensais(seed.pontuacao, indice),
}));

/**
 * Opções extraídas dos dados para popular os selects de filtro.
 * Usa Set para garantir valores únicos.
 */
export const opcoesFiltro: OpcoesFiltro = {
  gestores: [...new Set(condutores.map((c) => c.gestor))],
  departamentos: [...new Set(condutores.map((c) => c.departamento))],
  funcoes: [...new Set(condutores.map((c) => c.funcao))],
  negocios: [...new Set(condutores.map((c) => c.negocio))],
};

