/**
 * Tipos relacionados aos Parâmetros do Ranking.
 *
 * Centraliza as interfaces utilizadas na tela
 * de Parâmetros do Ranking e seus indicadores.
 */

/** Grupos de nível de impacto na pontuação */
export type GrupoImpacto = "alta" | "media" | "baixa";

/** Parâmetro/indicador do ranking */
export interface ParametroRanking {
  /** Identificador único para navegação (slug) */
  id: string;
  /** Nome do parâmetro/evento exibido no card */
  label: string;
  /** Quantidade total de eventos registrados no período */
  total: number;
  /** Nome do ícone Lucide (string para mapeamento dinâmico) */
  icone: string;
  /** Grupo de impacto (define a cor do card) */
  grupo: GrupoImpacto;
}

/** Configuração de um grupo de impacto (cor e label) */
export interface GrupoImpactoConfig {
  label: string;
  /** Classe Tailwind para background do card */
  bgClasse: string;
  /** Classe Tailwind para cor do texto */
  textoClasse: string;
  /** Chave do grupo */
  grupo: GrupoImpacto;
}
