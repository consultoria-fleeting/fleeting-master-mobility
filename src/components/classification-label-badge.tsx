/**
 * ClassificationLabelBadge — Badge de classificação a partir do texto do backend.
 *
 * Diferente do `ClassificationBadge` (que usa um enum fixo), este recebe o `label`
 * dinâmico da organização (ex.: "Baixa Exposição ao Risco") e deduz a cor
 * com `getClassificationStyle`.
 *
 * @example
 * <ClassificationLabelBadge label={item.classification} />
 */

import { getClassificationStyle } from "@/utils/driver-scoring-helpers";

interface ClassificationLabelBadgeProps {
  label: string;
}

export function ClassificationLabelBadge({ label }: ClassificationLabelBadgeProps) {
  const { badgeClassName } = getClassificationStyle(label);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium whitespace-nowrap ${badgeClassName}`}
    >
      {label}
    </span>
  );
}
