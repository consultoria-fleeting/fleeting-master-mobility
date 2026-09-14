/**
 * Dados mock de exceções ao ranking.
 *
 * Lista de exceções com tipo de evento, condutor, decisão,
 * justificativa e pontuações antes/depois.
 * Valores determinísticos para evitar hydration mismatch.
 *
 * TODO(backend): Substituir por dados reais da API.
 */

import { parametrosRanking } from "@/data/mock-parametros-ranking";

/** Interface de uma exceção ao ranking */
export interface Excecao {
  id: string;
  tipoEvento: string;
  condutor: string;
  dataHora: string;
  decisao: "Pendente" | "Aprovada" | "Reprovada";
  justificativa: string;
  pontuacaoAntes: number;
  pontuacaoDepois: number;
}

/** Nomes fixos de condutores para exceções */
const NOMES = [
  "Lucas Oliveira", "Fernanda Souza", "Pedro Almeida", "Juliana Santos",
  "Marcos Lima", "Patrícia Ferreira", "Rafael Costa", "Camila Rodrigues",
  "Bruno Martins", "Amanda Gomes", "Thiago Nascimento", "Larissa Barbosa",
  "Diego Araujo", "Vanessa Cardoso", "Felipe Moreira", "Beatriz Vieira",
  "Gustavo Ribeiro", "Carolina Mendes", "Ricardo Nunes", "Isabela Teixeira",
];

/** Datas fixas */
const DATAS = [
  "03/08/2026 09:15", "07/08/2026 14:32", "10/08/2026 08:45",
  "12/08/2026 16:20", "14/08/2026 11:10", "17/08/2026 07:55",
  "19/08/2026 13:42", "21/08/2026 10:30", "23/08/2026 15:18",
  "25/08/2026 09:05", "02/09/2026 14:50", "04/09/2026 08:22",
  "06/09/2026 16:45", "09/09/2026 11:38", "11/09/2026 07:12",
  "13/09/2026 13:55", "15/09/2026 10:08", "18/09/2026 15:33",
  "20/09/2026 09:47", "22/09/2026 14:15",
];

/** Pontuações fixas antes/depois */
const PONTUACOES_ANTES = [85, 78, 92, 71, 88, 65, 90, 82, 76, 95, 69, 87, 73, 91, 80, 84, 77, 93, 68, 86];
const PONTUACOES_DEPOIS = [90, 82, 95, 75, 92, 70, 93, 87, 80, 98, 73, 90, 78, 94, 85, 88, 82, 96, 72, 90];

/** Lista de exceções (determinística) */
export const excecoesData: Excecao[] = Array.from({ length: 20 }, (_, i) => ({
  id: `EXC-${2000 + i}`,
  tipoEvento: parametrosRanking[i % parametrosRanking.length].label,
  condutor: NOMES[i % NOMES.length],
  dataHora: DATAS[i % DATAS.length],
  decisao: (i < 8 ? "Pendente" : i % 2 === 0 ? "Aprovada" : "Reprovada") as Excecao["decisao"],
  justificativa: i < 8 ? "" : "Justificativa registrada pelo gestor.",
  pontuacaoAntes: PONTUACOES_ANTES[i],
  pontuacaoDepois: PONTUACOES_DEPOIS[i],
}));
