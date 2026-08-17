/**
 * ScoreCircle — Indicador circular de pontuação mensal
 *
 * Exibe a pontuação de um mês em um círculo colorido conforme
 * a classificação de risco correspondente.
 *
 * Reutilizável em tabelas anuais e futuras visualizações de
 * pontuação por período.
 *
 * @example
 * <ScoreCircle pontuacao={92} />
 */

import { getClassificacao } from "@/data/mock-condutores";

const CORES_POR_CLASSIFICACAO: Record<string, string> = {
  referencia: "bg-[hsl(var(--referencia))] text-black",
  baixa: "bg-[hsl(var(--baixa-exposicao))] text-black",
  media: "bg-[hsl(var(--media-exposicao))] text-white",
  alta: "bg-[hsl(var(--alta-exposicao))] text-white",
};

interface ScoreCircleProps {
  pontuacao: number;
}

export function ScoreCircle({ pontuacao }: ScoreCircleProps) {
  const classificacao = getClassificacao(pontuacao);

  return (
    <span
      className={`
        inline-flex items-center justify-center
        w-8 h-8 rounded-full text-[10px] font-bold
        ${CORES_POR_CLASSIFICACAO[classificacao]}
      `}
      title={`${pontuacao} pts`}
    >
      {pontuacao}
    </span>
  );
}
