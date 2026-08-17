/**
 * Tipos relacionados à Matriz de Pontuação.
 *
 * Centraliza as interfaces utilizadas na tela
 * de Matriz de Pontuação e suas seções.
 */

/** Origens possíveis dos eventos no ranking */
export type OrigemEvento = "Telemetria" | "Multa" | "Registro";

/** Linha da tabela de pontuação por evento */
export interface EventoPontuacao {
  origem: OrigemEvento;
  evento: string;
  pontuacao: number;
}

/** Faixa de classificação do condutor */
export interface ClassificacaoFaixa {
  classificacao: string;
  descricaoPontuacao: string;
  /** Chave de cor que mapeia para as CSS variables de classificação */
  cor: "referencia" | "baixa" | "media" | "alta";
}

/** Regra de cálculo do ranking (numerada) */
export interface RegraCalculo {
  numero: number;
  descricao: string;
  /** Trechos que devem ficar em destaque (strong) */
  destaques?: string[];
  /** Se true, o destaque aparece com cor de perigo */
  destaqueDanger?: boolean;
}

/** Item de periodicidade de atualização */
export interface ItemPeriodicidade {
  descricao: string;
  /** Trechos que devem ficar em destaque (strong) */
  destaques?: string[];
}
