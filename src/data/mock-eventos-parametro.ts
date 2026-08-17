/**
 * Dados mock de eventos detalhados por parâmetro do ranking.
 *
 * Gera eventos determinísticos para cada parâmetro usando
 * os condutores existentes. Datas fixas para evitar hydration mismatch.
 *
 * TODO(backend): Substituir por dados reais da API filtrados por parâmetro e período.
 */

import { condutores } from "@/data/mock-condutores";
import type { ClassificacaoType } from "@/types/condutor";

/** Evento registrado para um condutor em um parâmetro específico */
export interface EventoDetalhe {
  id: string;
  data: string;
  condutor: string;
  gestor: string;
  departamento: string;
  funcao: string;
  negocio: string;
  classificacao: ClassificacaoType;
}

/**
 * Datas fixas pré-geradas para evitar Math.random() em runtime.
 * 30 datas representando dias de um mês.
 */
const DATAS_FIXAS = [
  "03", "05", "07", "08", "10", "11", "12", "14", "15", "16",
  "17", "18", "19", "20", "21", "22", "23", "24", "25", "26",
  "27", "01", "02", "04", "06", "09", "13", "28", "15", "22",
];

/**
 * Gera eventos determinísticos de um parâmetro usando os condutores existentes.
 * Cada condutor gera um evento com data fixa baseada no índice.
 */
export function gerarEventosPorParametro(
  parametroId: string,
  mes: string,
  ano: number
): EventoDetalhe[] {
  /** Mapeia nome do mês para número */
  const MESES_NUMERO: Record<string, string> = {
    Janeiro: "01", Fevereiro: "02", Março: "03", Abril: "04",
    Maio: "05", Junho: "06", Julho: "07", Agosto: "08",
    Setembro: "09", Outubro: "10", Novembro: "11", Dezembro: "12",
  };

  const mesNumero = MESES_NUMERO[mes] || "07";

  return condutores.map((condutor, indice) => ({
    id: `${parametroId}-${indice}`,
    data: `${DATAS_FIXAS[indice % DATAS_FIXAS.length]}/${mesNumero}/${ano}`,
    condutor: condutor.nome,
    gestor: condutor.gestor,
    departamento: condutor.departamento,
    funcao: condutor.funcao,
    negocio: condutor.negocio,
    classificacao: condutor.classificacao,
  }));
}
