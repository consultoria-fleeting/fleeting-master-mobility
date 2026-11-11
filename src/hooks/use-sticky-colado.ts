/**
 * useStickyColado — Detecta quando um elemento `sticky` desgrudou da posição
 * original de fluxo e está acompanhando a rolagem do container (`<main>` ou `window`).
 *
 * Também exporta os estilos compartilhados pelas barras de filtro (`FiltrosHierarquicos`
 * e `FiltroBarra`) para alternar entre o card branco padrão e o fundo azul do menu lateral.
 */

"use client";

import { useEffect, useRef, useState } from "react";

/** Limite em pixels a partir do topo do container para considerar o elemento `sticky top-2` colado */
const LIMITE_TOPO_STICKY_PX = 12;

export function useStickyColado<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [colado, setColado] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;

    const containerRolagem = elemento.closest("main");

    function atualizarEstadoColado() {
      if (!elemento) return;

      if (!containerRolagem) {
        const topoJanela = elemento.getBoundingClientRect().top;
        setColado(window.scrollY > 8 && topoJanela <= LIMITE_TOPO_STICKY_PX);
        return;
      }

      const topoRelativoAoMain =
        elemento.getBoundingClientRect().top -
        containerRolagem.getBoundingClientRect().top;

      setColado(
        containerRolagem.scrollTop > 8 && topoRelativoAoMain <= LIMITE_TOPO_STICKY_PX
      );
    }

    atualizarEstadoColado();

    const alvoEvento: EventTarget = containerRolagem ?? window;
    alvoEvento.addEventListener("scroll", atualizarEstadoColado, { passive: true });
    window.addEventListener("resize", atualizarEstadoColado, { passive: true });

    return () => {
      alvoEvento.removeEventListener("scroll", atualizarEstadoColado);
      window.removeEventListener("resize", atualizarEstadoColado);
    };
  }, []);

  return { ref, colado };
}

/** Classes do container da barra de filtros conforme estado normal ou colado no scroll */
export function obterClasseContainerFiltro(colado: boolean): string {
  const base =
    "sticky top-2 z-20 rounded-lg border p-4 flex flex-wrap items-center gap-3 transition-colors duration-200";

  if (colado) {
    return `${base} bg-[hsl(var(--sidebar-background))] border-[hsl(var(--sidebar-border))] text-[hsl(var(--sidebar-foreground))] shadow-lg`;
  }

  return `${base} bg-card/95 backdrop-blur-sm border-border shadow-sm`;
}

/** Classes do `<input>` de texto da barra de filtros conforme estado normal ou colado */
export function obterClasseControleFiltro(colado: boolean): string {
  const base =
    "text-xs border rounded-md px-2.5 py-1.5 transition-colors duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed";

  if (colado) {
    return `${base} border-white/25 bg-white/10 text-white placeholder:text-white/70 focus:ring-white/40 disabled:bg-white/5 disabled:border-white/15 disabled:text-white/45`;
  }

  return `${base} border-border bg-background text-foreground focus:ring-ring disabled:opacity-50`;
}

/**
 * Classes do `<select>` da barra de filtros com `appearance-none` e padding balanceado
 * (`pl-2.5 pr-7`) para dar respiro à seta na direita sem aumentar a largura do controle.
 */
export function obterClasseSelectFiltro(colado: boolean): string {
  return `${obterClasseControleFiltro(colado)} appearance-none pl-2.5 pr-7 cursor-pointer`;
}

/** Classes do ícone `ChevronDown` sobreposto à direita do `<select>` */
export function obterClasseSetaSelectFiltro(colado: boolean, desabilitado = false): string {
  const cor = colado ? "text-white/80" : "text-muted-foreground";
  const opacidade = desabilitado ? "opacity-45" : "";
  return `pointer-events-none absolute right-2.5 h-3.5 w-3.5 transition-colors duration-200 ${cor} ${opacidade}`.trim();
}

/** Classes do ícone de funil da barra de filtros conforme estado normal ou colado */
export function obterClasseIconeFiltro(colado: boolean): string {
  return `w-4 h-4 shrink-0 transition-colors duration-200 ${
    colado ? "text-white" : "text-muted-foreground"
  }`;
}

/** Classe das tags `<option>` para manter contraste legível no menu nativo mesmo com o `<select>` em texto branco */
export const CLASSE_OPCAO_SELECT_FILTRO = "bg-background text-foreground";
