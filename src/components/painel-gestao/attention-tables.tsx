/**
 * Tabelas de atenção do Painel de Gestão.
 *
 * - VeiculosAtencaoTabela: placa, modelo, condutor, pendência e status.
 * - CondutoresAtencaoTabela: nome, filial e status da CNH.
 *
 * Clicar em uma linha dispara `onFocarVeiculo(placa)`, que centraliza o
 * veículo no mapa (para condutores, usa o veículo vinculado).
 */

"use client";

import { Crosshair } from "lucide-react";
import type {
  CondutorAtencao,
  StatusCnh,
  StatusPendencia,
  VeiculoAtencao,
} from "@/types/painel-gestao";
import { PainelCard } from "./painel-card";
import { StatusBadge, type TomStatus } from "./status-badge";

const TOM_PENDENCIA: Record<StatusPendencia, TomStatus> = {
  Crítico: "perigo",
  Atenção: "alerta",
};

const TOM_CNH: Record<StatusCnh, TomStatus> = {
  "CNH Vencida": "perigo",
  "CNH com Impedimento": "indigo",
  "CNH à Vencer": "alerta",
};

const CLASSE_CABECALHO =
  "sticky top-0 z-[1] bg-white px-2 py-2 text-left text-[9.5px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] first:pl-4 last:pr-4";
const CLASSE_CELULA = "px-2 py-2.5 first:pl-4 last:pr-4";
const CLASSE_LINHA =
  "group cursor-pointer border-t border-[#F1F1F6] transition-colors hover:bg-[#F8F8FC] focus-visible:bg-[#EEF2FF] focus-visible:outline-none";

/** Torna a linha clicável e acessível via teclado */
function propsLinhaClicavel(acao: () => void) {
  return {
    tabIndex: 0,
    onClick: acao,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        acao();
      }
    },
  };
}

/* ========================================================= */
/*  VEÍCULOS                                                 */
/* ========================================================= */

interface VeiculosAtencaoTabelaProps {
  veiculos: VeiculoAtencao[];
  onFocarVeiculo: (placa: string) => void;
  className?: string;
}

export function VeiculosAtencaoTabela({ veiculos, onFocarVeiculo, className }: VeiculosAtencaoTabelaProps) {
  return (
    <PainelCard
      titulo="Veículos que Exigem Atenção"
      corIndicador="#E11D48"
      contador={veiculos.length}
      acao="Ver Todos"
      className={className}
      corpoClassName="overflow-auto"
    >
      <table className="w-full min-w-[460px] text-[12px]">
        <thead>
          <tr>
            <th className={CLASSE_CABECALHO}>Placa</th>
            <th className={CLASSE_CABECALHO}>Modelo</th>
            <th className={CLASSE_CABECALHO}>Condutor</th>
            <th className={CLASSE_CABECALHO}>Pendência</th>
            <th className={`${CLASSE_CABECALHO} text-right`}>Status</th>
          </tr>
        </thead>
        <tbody>
          {veiculos.map((v) => (
            <tr
              key={v.placa}
              className={CLASSE_LINHA}
              title={`${v.filial} · ${v.km} · Revisão: ${v.revisao} — clique para ver no mapa`}
              {...propsLinhaClicavel(() => onFocarVeiculo(v.placa))}
            >
              <td className={CLASSE_CELULA}>
                <span className="inline-flex items-center gap-1.5 font-bold tracking-wide text-[#1E1B4B]">
                  {v.placa}
                  <Crosshair className="h-3 w-3 text-[#4F46E5] opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </td>
              <td className={`${CLASSE_CELULA} text-[#334155]`}>{v.modelo}</td>
              <td className={`${CLASSE_CELULA} text-[#334155]`}>{v.condutor}</td>
              <td className={`${CLASSE_CELULA} max-w-[150px] truncate text-[#64748B]`}>{v.pendencia}</td>
              <td className={`${CLASSE_CELULA} text-right`}>
                <StatusBadge tom={TOM_PENDENCIA[v.status]}>{v.status}</StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PainelCard>
  );
}

/* ========================================================= */
/*  CONDUTORES                                               */
/* ========================================================= */

interface CondutoresAtencaoTabelaProps {
  condutores: CondutorAtencao[];
  onFocarVeiculo: (placa: string) => void;
  className?: string;
}

export function CondutoresAtencaoTabela({ condutores, onFocarVeiculo, className }: CondutoresAtencaoTabelaProps) {
  return (
    <PainelCard
      titulo="Condutores que Exigem Atenção"
      corIndicador="#D97706"
      contador={condutores.length}
      acao="Ver Todos"
      className={className}
      corpoClassName="overflow-auto"
    >
      <table className="w-full min-w-[380px] text-[12px]">
        <thead>
          <tr>
            <th className={CLASSE_CABECALHO}>Nome do Condutor</th>
            <th className={CLASSE_CABECALHO}>Filial</th>
            <th className={`${CLASSE_CABECALHO} text-right`}>Status da CNH</th>
          </tr>
        </thead>
        <tbody>
          {condutores.map((c) => {
            const placaVinculada = c.veiculo.split(" · ")[0];
            return (
              <tr
                key={c.nome}
                className={CLASSE_LINHA}
                title={`CNH ${c.categoria} · ${c.validade} · ${c.veiculo}\n${c.obs}`}
                {...propsLinhaClicavel(() => onFocarVeiculo(placaVinculada))}
              >
                <td className={`${CLASSE_CELULA} font-semibold text-[#1E1B4B]`}>{c.nome}</td>
                <td className={`${CLASSE_CELULA} text-[#334155]`}>{c.filial}</td>
                <td className={`${CLASSE_CELULA} text-right`}>
                  <StatusBadge tom={TOM_CNH[c.status]}>{c.status}</StatusBadge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </PainelCard>
  );
}
