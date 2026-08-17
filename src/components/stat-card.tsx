/**
 * StatCard — Card de KPI / Estatística
 *
 * Exibe uma métrica com título, valor, subtítulo opcional e ícone.
 * Aceita variantes de cor para representar diferentes classificações.
 *
 * @example
 * <StatCard titulo="Total Condutores" valor={150} icone={Users} variante="primary" />
 */

import type { LucideIcon } from "lucide-react";

type Variante = "default" | "primary" | "success" | "baixa" | "warning" | "danger";

interface StatCardProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icone?: LucideIcon;
  variante?: Variante;
  onClick?: () => void;
  className?: string;
}

const ESTILOS_VARIANTE: Record<Variante, string> = {
  default: "bg-card text-card-foreground border border-border",
  primary: "bg-[hsl(var(--primary))] text-white",
  success: "bg-[hsl(var(--referencia))] text-black",
  baixa: "bg-[hsl(var(--baixa-exposicao))] text-black",
  warning: "bg-[hsl(var(--media-exposicao))] text-white",
  danger: "bg-[hsl(var(--alta-exposicao))] text-white",
};

export function StatCard({
  titulo,
  valor,
  subtitulo,
  icone: Icone,
  variante = "default",
  onClick,
  className = "",
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`
        rounded-lg p-5 shadow-sm transition-all duration-200 hover:shadow-md
        ${onClick ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : ""}
        ${ESTILOS_VARIANTE[variante]}
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium opacity-80 uppercase tracking-wide">
            {titulo}
          </p>
          <p className="text-2xl font-bold">{valor}</p>
          {subtitulo && <p className="text-xs opacity-70">{subtitulo}</p>}
        </div>

        {Icone && (
          <div className="p-2 rounded-md bg-white/10">
            <Icone className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
