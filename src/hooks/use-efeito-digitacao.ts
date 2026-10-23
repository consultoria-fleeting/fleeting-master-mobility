/**
 * useEfeitoDigitacao — Revela um texto aos poucos (efeito "máquina de escrever").
 *
 * Respeita `prefers-reduced-motion`: nesse caso mostra o texto inteiro na hora.
 *
 * @example
 * const { textoVisivel, concluido } = useEfeitoDigitacao(resposta, { ativo: true });
 */

"use client";

import { useEffect, useState } from "react";

interface OpcoesDigitacao {
  /** Liga/desliga a animação (quando false, nada é exibido) */
  ativo: boolean;
  /** Caracteres revelados a cada passo */
  caracteresPorPasso?: number;
  /** Intervalo entre passos, em ms */
  intervaloMs?: number;
}

export function useEfeitoDigitacao(
  texto: string,
  { ativo, caracteresPorPasso = 3, intervaloMs = 16 }: OpcoesDigitacao
) {
  // O progresso guarda a qual texto pertence: se o texto mudar, a contagem
  // volta a zero de forma derivada (sem setState síncrono dentro do efeito).
  const [progresso, setProgresso] = useState({ texto: "", quantidade: 0 });
  const quantidade = progresso.texto === texto ? progresso.quantidade : 0;

  useEffect(() => {
    if (!ativo) return;

    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzirMovimento) {
      const timeout = setTimeout(() => setProgresso({ texto, quantidade: texto.length }), 0);
      return () => clearTimeout(timeout);
    }

    const timer = setInterval(() => {
      setProgresso((atual) => {
        const base = atual.texto === texto ? atual.quantidade : 0;
        const proxima = Math.min(base + caracteresPorPasso, texto.length);
        if (proxima >= texto.length) clearInterval(timer);
        return { texto, quantidade: proxima };
      });
    }, intervaloMs);

    return () => clearInterval(timer);
  }, [texto, ativo, caracteresPorPasso, intervaloMs]);

  const visivel = ativo ? quantidade : 0;
  return {
    textoVisivel: texto.slice(0, visivel),
    concluido: ativo && visivel >= texto.length,
  };
}
