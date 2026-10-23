/**
 * RecentActivity — Timeline vertical "Atividade Recente".
 *
 * Cada item tem uma bolinha colorida (tipo de evento), título e meta
 * (placa/condutor · quando). Lista com scroll interno.
 */

import type { AtividadeRecente } from "@/types/painel-gestao";
import { PainelCard } from "./painel-card";

interface RecentActivityProps {
  atividades: AtividadeRecente[];
  className?: string;
}

export function RecentActivity({ atividades, className }: RecentActivityProps) {
  return (
    <PainelCard titulo="Atividade Recente" className={className} corpoClassName="overflow-y-auto px-4 pb-3">
      <ol className="relative">
        {atividades.map((atividade, indice) => (
          <li
            key={`${atividade.titulo}-${atividade.meta}`}
            className="relative flex gap-3 pb-3 last:pb-0 animate-fade-in"
            style={{ animationDelay: `${indice * 40}ms`, animationFillMode: "backwards" }}
          >
            {/* Linha vertical ligando os eventos */}
            {indice < atividades.length - 1 && (
              <span className="absolute left-[4px] top-3 h-full w-px bg-[#E7E7F0]" aria-hidden />
            )}
            <span
              className="relative mt-1 h-[9px] w-[9px] shrink-0 rounded-full ring-[3px] ring-white"
              style={{ background: atividade.cor }}
            />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold leading-tight text-[#1E1B4B]">{atividade.titulo}</p>
              <p className="truncate text-[10.5px] text-[#94A3B8]">{atividade.meta}</p>
            </div>
          </li>
        ))}
      </ol>
    </PainelCard>
  );
}
