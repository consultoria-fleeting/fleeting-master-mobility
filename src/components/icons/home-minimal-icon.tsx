/**
 * HomeMinimalIcon — Ícone minimalista de Home (telhado com beiral + traço horizontal interno).
 *
 * Calibrado na mesma grade óptica `2..22` (20×20 unidades no viewBox 24×24) do ícone `Trophy`
 * do Lucide, garantindo exatamente as mesmas dimensões visuais renderizadas (18×18px em `w-5 h-5`).
 */

import { createLucideIcon } from "lucide-react";

export const HomeMinimalIcon = createLucideIcon("home-minimal", [
  ["path", { d: "M2 11.5L12 2l10 9.5", key: "roof" }],
  [
    "path",
    {
      d: "M4.5 9.15V20.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V9.15",
      key: "walls",
    },
  ],
  ["path", { d: "M9.5 17h5", key: "threshold" }],
]);
