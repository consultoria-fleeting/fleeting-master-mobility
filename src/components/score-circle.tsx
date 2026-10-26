/**
 * ScoreCircle — Indicador circular de pontuação mensal
 *
 * Exibe a pontuação de um mês em um círculo colorido conforme
 * a classificação de risco correspondente.
 *
 * - Sem `classificacao`: deduz a cor pelos limites fixos do mock (`getClassificacao`).
 * - Com `classificacao` (label dinâmico vindo da API): usa `getClassificationStyle`.
 *
 * Reutilizável em tabelas anuais e futuras visualizações de
 * pontuação por período.
 *
 * @example
 * <ScoreCircle pontuacao={92} />
 * <ScoreCircle pontuacao={92} classificacao="Referência" />
 */

import { getClassificacao } from "@/data/mock-condutores";
import { formatScore, getClassificationStyle } from "@/utils/driver-scoring-helpers";

const CORES_POR_CLASSIFICACAO: Record<string, string> = {
  referencia: "bg-[hsl(var(--referencia))] text-black",
  baixa: "bg-[hsl(var(--baixa-exposicao))] text-black",
  media: "bg-[hsl(var(--media-exposicao))] text-white",
  alta: "bg-[hsl(var(--alta-exposicao))] text-white",
};

interface ScoreCircleProps {
  pontuacao: number;
  /** Label da classificação retornado pela API (ex.: "Baixa Exposição ao Risco"). */
  classificacao?: string;
}

export function ScoreCircle({ pontuacao, classificacao }: ScoreCircleProps) {
  const cor = classificacao
    ? getClassificationStyle(classificacao).badgeClassName
    : CORES_POR_CLASSIFICACAO[getClassificacao(pontuacao)];

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-8 h-8 px-1 rounded-full text-[10px] font-bold
        ${cor}
      `}
      title={classificacao ? `${formatScore(pontuacao)} pts — ${classificacao}` : `${pontuacao} pts`}
    >
      {formatScore(pontuacao)}
    </span>
  );
}
