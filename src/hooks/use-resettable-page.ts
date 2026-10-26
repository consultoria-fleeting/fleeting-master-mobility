/**
 * useResettablePage — Página atual de uma tabela paginada que volta para 1
 * automaticamente quando a "assinatura" dos filtros muda.
 *
 * Evita `useEffect` para sincronizar estado: a página é guardada junto da assinatura em que foi escolhida.
 *
 * @example
 * const [pagina, setPagina] = useResettablePage(JSON.stringify({ ano, mes, filtros }));
 */

"use client";

import { useState } from "react";

export function useResettablePage(signature: string): [number, (page: number) => void] {
  const [saved, setSaved] = useState({ signature, page: 1 });
  const page = saved.signature === signature ? saved.page : 1;

  function setPage(newPage: number) {
    setSaved({ signature, page: newPage });
  }

  return [page, setPage];
}
