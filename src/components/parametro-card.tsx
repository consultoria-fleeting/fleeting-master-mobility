/**
 * ParametroCard — Card de indicador de parâmetro do ranking
 *
 * Exibe um card colorido com o nome do parâmetro, quantidade
 * total de eventos e ícone. Suporta clique para navegação.
 *
 * Reutilizável para qualquer indicador com cor de fundo,
 * label, valor numérico e ícone.
 *
 * @example
 * <ParametroCard
 *   label="Frenagem brusca"
 *   total={89}
 *   icone="AlertTriangle"
 *   bgClasse="bg-yellow-400"
 *   textoClasse="text-black"
 *   onClick={() => router.push("/detalhes")}
 * />
 */

"use client";

import {
  Gauge,
  AlertTriangle,
  TrendingUp,
  Smartphone,
  Ban,
  Wine,
  ShieldAlert,
  Skull,
  CarFront,
  type LucideIcon,
} from "lucide-react";

/** Mapeamento de nomes de ícone para componentes Lucide */
const MAPA_ICONES: Record<string, LucideIcon> = {
  Gauge,
  AlertTriangle,
  TrendingUp,
  Smartphone,
  Ban,
  Wine,
  ShieldAlert,
  Skull,
  CarFront,
};

interface ParametroCardProps {
  /** Nome do parâmetro/evento */
  label: string;
  /** Quantidade total de eventos */
  total: number;
  /** Nome do ícone Lucide (chave do mapa) */
  icone: string;
  /** Classe Tailwind para background do card */
  bgClasse: string;
  /** Classe Tailwind para cor do texto */
  textoClasse: string;
  /** Callback executado ao clicar no card */
  onClick?: () => void;
}

export function ParametroCard({
  label,
  total,
  icone,
  bgClasse,
  textoClasse,
  onClick,
}: ParametroCardProps) {
  const Icone = MAPA_ICONES[icone] || Gauge;

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      className={`
        rounded-lg p-5 shadow-sm transition-all
        hover:shadow-md cursor-pointer hover:scale-[1.02]
        ${bgClasse} ${textoClasse}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium opacity-90 leading-tight">
            {label}
          </p>
          <p className="text-3xl font-bold">{total}</p>
          <p className="text-[10px] opacity-70">eventos registrados</p>
        </div>
        <div className="p-2 rounded-md bg-white/15">
          <Icone className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
