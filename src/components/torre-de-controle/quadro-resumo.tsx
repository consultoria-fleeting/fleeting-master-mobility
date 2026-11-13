/**
 * QuadroResumo — Painel 2×2 com seletor minimalista entre Manutenções, Sinistros e Multas & CNH.
 *
 * Mantém o encaixe em tela única Full HD (1920×1080 sem scroll vertical) ao concentrar
 * os três quadros operacionais da V1 em um único card alinhado com os demais blocos (`px-4`),
 * alternando pelo seletor segmentado no cabeçalho (com suporte também às setas do teclado)
 * e mantendo cada contador 2×2 clicável rumo ao módulo correspondente no Master Mobility.
 */

"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { z } from "zod";
import { useAmbiente } from "@/hooks/use-ambiente";
import { cn } from "@/lib/utils";
import type { ItemQuadroResumo, TomQuadroResumo } from "@/types/torre-de-controle";
import { getLegacyUrl } from "@/utils/env-config";

const COR_TOM: Record<TomQuadroResumo, string> = {
  perigo: "text-[#E11D48]",
  alerta: "text-[#D97706]",
  indigo: "text-[#4F46E5]",
  neutro: "text-[#1E1B4B]",
};

export type IdSecaoQuadro = "manutencoes" | "sinistros" | "multas";

const esquemaSecaoQuadro = z.enum(["manutencoes", "sinistros", "multas"]);

export interface SecaoQuadroResumo {
  id: IdSecaoQuadro;
  titulo: string;
  rotuloCurto: string;
  corIndicador: string;
  /** Caminho principal do módulo no sistema legado (ex.: "/manutencao/") */
  caminhoModulo: string;
  itens: ItemQuadroResumo[];
}

interface QuadroResumoProps {
  secoes: SecaoQuadroResumo[];
  className?: string;
}

export function QuadroResumo({ secoes, className }: QuadroResumoProps) {
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const ambiente = useAmbiente();

  if (secoes.length === 0) return null;

  const indiceSeguro = indiceAtivo % secoes.length;
  const secaoAtiva = secoes[indiceSeguro];
  const urlModulo = getLegacyUrl(secaoAtiva.caminhoModulo, ambiente);

  function irAnterior() {
    setIndiceAtivo((atual) => (atual - 1 + secoes.length) % secoes.length);
  }

  function irProximo() {
    setIndiceAtivo((atual) => (atual + 1) % secoes.length);
  }

  function selecionarPorId(idBruto: string) {
    const validado = esquemaSecaoQuadro.safeParse(idBruto);
    if (!validado.success) return;
    const novoIndice = secoes.findIndex((s) => s.id === validado.data);
    if (novoIndice >= 0) setIndiceAtivo(novoIndice);
  }

  return (
    <section
      aria-label={`Resumo operacional: ${secaoAtiva.titulo}`}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          irAnterior();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          irProximo();
        }
      }}
      className={cn(
        "flex min-h-0 flex-col rounded-2xl border border-[#E7E7F0] bg-white transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(30,27,75,0.18)]",
        className
      )}
    >
      {/* Cabeçalho em 3 zonas: título à esquerda · seletor centralizado · ação à direita */}
      <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-4 pb-2 pt-3.5">
        <div className="flex min-w-0 items-center gap-2 justify-self-start">
          <span
            className="h-2 w-2 shrink-0 rounded-full transition-colors"
            style={{ background: secaoAtiva.corIndicador }}
          />
          <h2 className="truncate text-[13px] font-semibold text-[#1E1B4B]">
            {secaoAtiva.titulo}
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Alternar quadro operacional"
          className="inline-flex shrink-0 items-center gap-0.5 justify-self-center rounded-lg border border-[#EEF0F6] bg-[#F8F8FC] p-0.5"
        >
          {secoes.map((secao, idx) => {
            const ativo = idx === indiceSeguro;
            return (
              <button
                key={secao.id}
                type="button"
                role="tab"
                aria-selected={ativo}
                onClick={() => selecionarPorId(secao.id)}
                className={cn(
                  "cursor-pointer rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]",
                  ativo
                    ? "bg-white text-[#1E1B4B] shadow-xs"
                    : "text-[#64748B] hover:text-[#1E1B4B]"
                )}
              >
                {secao.rotuloCurto}
              </button>
            );
          })}
        </div>

        <a
          href={urlModulo}
          className="shrink-0 justify-self-end whitespace-nowrap text-[11.5px] font-semibold text-[#4F46E5] transition-colors hover:text-[#4338CA] hover:underline"
        >
          Abrir módulo
        </a>
      </header>

      {/* Grade 2×2 alinhada em largura total (px-4) */}
      <div
        key={secaoAtiva.id}
        className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2 px-4 pb-3 animate-fade-in"
      >
        {secaoAtiva.itens.map((item) => {
          const urlRecorte = getLegacyUrl(item.caminhoLegado, ambiente);
          return (
            <a
              key={item.id}
              href={urlRecorte}
              title={`Abrir recorte "${item.label}" em ${secaoAtiva.titulo}`}
              className="group flex items-center justify-between gap-2.5 rounded-xl border border-[#EEF0F6] bg-[#F8F8FC] px-3.5 py-1.5 transition-all hover:border-[#C7D2FE] hover:bg-[#EEF2FF]/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
            >
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-[11px] font-medium leading-tight text-[#475569] group-hover:text-[#1E1B4B]">
                  <span className="truncate">{item.label}</span>
                  <ArrowUpRight className="h-3 w-3 shrink-0 text-[#4F46E5] opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                {item.detalhe && (
                  <span className="block truncate text-[9.5px] text-[#94A3B8]">
                    {item.detalhe}
                  </span>
                )}
              </span>

              <span
                className={cn(
                  "shrink-0 whitespace-nowrap text-[17.5px] font-bold leading-none tabular-nums",
                  COR_TOM[item.tom]
                )}
              >
                {item.valor}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
