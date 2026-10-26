/**
 * AreaRolagemSuave — Container com rolagem discreta ("invisível até ser necessária").
 *
 * - Rolagem nativa (roda do mouse, trackpad, toque e teclado continuam funcionando).
 * - Barra de rolagem escondida; aparece fina e translúcida só no hover (classe `.rolagem-suave`).
 * - Degradê na base enquanto houver conteúdo abaixo (some ao chegar no fim).
 * - Expõe `data-rolado` e o grupo `group/rolagem` para os filhos reagirem à rolagem,
 *   ex.: sombra no cabeçalho fixo: `group-data-[rolado=true]/rolagem:shadow-...`.
 *
 * Precisa estar dentro de um container flex em coluna com altura limitada
 * (ex.: corpo do TorreCard), pois ocupa o espaço com `flex-1 min-h-0`.
 *
 * @example
 * <AreaRolagemSuave conteudoClassName="px-4">
 *   <ul>...</ul>
 * </AreaRolagemSuave>
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AreaRolagemSuaveProps {
  children: React.ReactNode;
  className?: string;
  /** Classes do elemento que rola (ex.: padding interno) */
  conteudoClassName?: string;
  /** Cor do degradê da base — use a mesma cor de fundo do card */
  corFundo?: string;
}

interface Bordas {
  /** Já rolou para baixo do topo */
  rolado: boolean;
  /** Ainda há conteúdo abaixo */
  temMaisAbaixo: boolean;
}

/** Margem (px) para ignorar diferenças de arredondamento do navegador */
const TOLERANCIA_PX = 2;

export function AreaRolagemSuave({
  children,
  className,
  conteudoClassName,
  corFundo = "#FFFFFF",
}: AreaRolagemSuaveProps) {
  const rolagemRef = useRef<HTMLDivElement>(null);
  const [bordas, setBordas] = useState<Bordas>({ rolado: false, temMaisAbaixo: false });

  useEffect(() => {
    const elemento = rolagemRef.current;
    if (!elemento) return;

    function atualizar() {
      if (!elemento) return;
      const rolado = elemento.scrollTop > TOLERANCIA_PX;
      const temMaisAbaixo =
        elemento.scrollTop + elemento.clientHeight < elemento.scrollHeight - TOLERANCIA_PX;
      // Evita re-render quando nada mudou
      setBordas((atual) =>
        atual.rolado === rolado && atual.temMaisAbaixo === temMaisAbaixo ? atual : { rolado, temMaisAbaixo }
      );
    }

    // O ResizeObserver já dispara uma vez ao observar, então serve como cálculo inicial
    const observador = new ResizeObserver(atualizar);
    observador.observe(elemento);
    if (elemento.firstElementChild) observador.observe(elemento.firstElementChild);
    elemento.addEventListener("scroll", atualizar, { passive: true });

    return () => {
      observador.disconnect();
      elemento.removeEventListener("scroll", atualizar);
    };
  }, []);

  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
      <div
        ref={rolagemRef}
        data-rolado={bordas.rolado}
        className={cn("rolagem-suave group/rolagem min-h-0 flex-1 overflow-auto", conteudoClassName)}
      >
        {children}
      </div>

      {/* Degradê indicando que há mais itens abaixo */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-2xl transition-opacity duration-300",
          bordas.temMaisAbaixo ? "opacity-100" : "opacity-0"
        )}
        style={{ background: `linear-gradient(to top, ${corFundo}, transparent)` }}
      />
    </div>
  );
}
