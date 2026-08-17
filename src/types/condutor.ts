/**
 * Tipos relacionados ao domínio de Condutores.
 *
 * Centraliza todas as interfaces e tipos utilizados
 * no módulo de Ranking de Condutores.
 */

/** Níveis de classificação de risco do condutor */
export type ClassificacaoType = "referencia" | "baixa" | "media" | "alta";

/** Dados de um condutor no ranking */
export interface Condutor {
  posicao: number;
  nome: string;
  gestor: string;
  centroCusto: string;
  departamento: string;
  funcao: string;
  negocio: string;
  pontuacao: number;
  classificacao: ClassificacaoType;
  /** Pontuações mensais para a visão anual (Jan-Dez). Chave = nome do mês */
  pontuacoesMensais?: Record<string, number>;
}

/** Opções disponíveis para os filtros do dashboard */
export interface OpcoesFiltro {
  gestores: string[];
  departamentos: string[];
  funcoes: string[];
  negocios: string[];
}

/** Estado atual dos filtros aplicados */
export interface FiltrosState {
  nome: string;
  gestor: string;
  departamento: string;
  funcao: string;
  negocio: string;
}
