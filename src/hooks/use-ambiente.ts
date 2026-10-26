/**
 * useAmbiente — Ambiente atual (dev × demo × prod) detectado pelo hostname.
 *
 * Usa `useSyncExternalStore` para ser seguro na hidratação: no servidor (e
 * durante a hidratação) devolve "prod" e, logo em seguida, o ambiente real do
 * navegador. Assim links que dependem do ambiente (ex.: URLs do sistema legado)
 * não geram erro de "hydration mismatch".
 *
 * @example
 * const ambiente = useAmbiente();
 * const href = getLegacyUrl("/inventario/", ambiente);
 */

"use client";

import { useSyncExternalStore } from "react";
import { getEnvironment, type AppEnvironment } from "@/utils/env-config";

/** O hostname não muda durante a sessão, então não há o que assinar */
function assinar() {
  return () => {};
}

function ambienteNoServidor(): AppEnvironment {
  return "prod";
}

export function useAmbiente(): AppEnvironment {
  return useSyncExternalStore(assinar, getEnvironment, ambienteNoServidor);
}
