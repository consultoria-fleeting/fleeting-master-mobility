import { getTokens } from "@/utils/tokens";
import { getTokenCookieName } from "@/utils/env-config";

/** Perfis que podem aplicar/revogar exceções (FLEET-2301). Os demais recebem 403 do backend. */
const PERFIS_GESTORES = ["FLEETING", "ADMIN", "MANAGER", "SUPERADMIN", "GESTOR"];

/** Lê o payload (claims) do JWT sem validar assinatura — a validação é sempre do backend. */
function lerPayloadDoToken(token: string): Record<string, unknown> | null {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Indica se o usuário logado tem perfil de gestor (claim `permission` do JWT).
 *
 * É apenas conveniência de UI (habilitar/desabilitar botões). A autoridade é o backend,
 * que responde 403 para perfis sem permissão. Se não for possível determinar o perfil,
 * retorna `true` para não bloquear indevidamente um gestor.
 */
export function canManageExceptions(): boolean {
  if (typeof window === "undefined") return true;

  const token = getTokens(getTokenCookieName());
  if (!token) return true;

  const permission = lerPayloadDoToken(token)?.permission;
  if (typeof permission !== "string") return true;

  return PERFIS_GESTORES.includes(permission.toUpperCase());
}
