/**
 * ClassificationBadge — Badge de Classificação de Risco
 *
 * Exibe o nível de classificação do condutor com cor e label correspondente.
 * Reutilizável em tabelas, listas e cards.
 *
 * @example
 * <ClassificationBadge classificacao="referencia" />
 * <ClassificationBadge classificacao="alta" tamanho="md" />
 */

import type { ClassificacaoType } from "@/types/condutor";

interface ClassificationBadgeProps {
  classificacao: ClassificacaoType;
  tamanho?: "sm" | "md";
}

const LABELS: Record<ClassificacaoType, string> = {
  referencia: "Referência",
  baixa: "Baixa Exposição",
  media: "Média Exposição",
  alta: "Alta Exposição",
};

const ESTILOS: Record<ClassificacaoType, string> = {
  referencia: "bg-[hsl(var(--referencia))] text-black",
  baixa: "bg-[hsl(var(--baixa-exposicao))] text-black",
  media: "bg-[hsl(var(--media-exposicao))] text-white",
  alta: "bg-[hsl(var(--alta-exposicao))] text-white",
};

export function ClassificationBadge({
  classificacao,
  tamanho = "sm",
}: ClassificationBadgeProps) {
  const estiloTamanho =
    tamanho === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium whitespace-nowrap
        ${ESTILOS[classificacao]}
        ${estiloTamanho}
      `}
    >
      {LABELS[classificacao]}
    </span>
  );
}
