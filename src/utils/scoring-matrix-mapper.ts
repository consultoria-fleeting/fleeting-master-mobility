import type { ScoringMatrixClassification, ScoringMatrixRule } from "@/types/driver-scoring";
import type { ClassificacaoFaixa, EventoPontuacao } from "@/types/matriz-pontuacao";

/**
 * Converte a resposta de `GET /dashboard/scoring-matrix` para os tipos usados
 * pelos componentes da tela de Matriz de Pontuação.
 */

/** Ordem de exibição das origens; origens desconhecidas vão para o final. */
const ORDEM_ORIGENS = ["Telemetria", "Multa", "Registro"];

function getPosicaoOrigem(origem: string): number {
  const posicao = ORDEM_ORIGENS.indexOf(origem);
  return posicao === -1 ? ORDEM_ORIGENS.length : posicao;
}

/** Regras -> linhas da tabela, agrupadas por origem (Telemetria → Multa → Registro) e mantendo a ordem da API. */
export function mapRulesToEventos(rules: ScoringMatrixRule[]): EventoPontuacao[] {
  return rules
    .map((regra, indice) => ({ regra, indice }))
    .sort(
      (a, b) => getPosicaoOrigem(a.regra.origin) - getPosicaoOrigem(b.regra.origin) || a.indice - b.indice,
    )
    .map(({ regra }) => ({
      origem: regra.origin,
      evento: regra.label,
      pontuacao: regra.points,
    }));
}

/** Classificações -> cards de faixa (a chave `key` da API já corresponde à cor). */
export function mapClassificationsToFaixas(
  classifications: ScoringMatrixClassification[],
): ClassificacaoFaixa[] {
  return classifications.map((item) => ({
    classificacao: item.classification,
    descricaoPontuacao: item.subtitle,
    cor: item.key,
  }));
}
