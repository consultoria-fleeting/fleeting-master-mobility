import { z } from "zod";
import { getTokens } from "@/utils/tokens";
import { getTokenCookieName } from "@/utils/env-config";

/**
 * Perfis que podem aplicar exceções (Gestão de exceções). Os demais recebem 403 do backend.
 * Mesma lista de `validateFleetManagerPermission` na api-driver-scoring.
 */
const PERFIS_GESTORES = ["FLEETING", "ADMIN", "MANAGER", "SUPERADMIN", "GESTOR", "GESTOR DE FROTA"];

/** Schema Zod para validar os campos do usuário presentes no payload do JWT */
const jwtPayloadUsuarioSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().optional(),
    permission: z
      .union([
        z.string().trim().min(1),
        z.object({ per_name: z.string().trim().min(1) }),
      ])
      .optional(),
  })
  .passthrough();

export interface PerfilUsuarioLogado {
  nome: string;
  permissao: string;
  iniciais: string;
}

export const PERFIL_USUARIO_PADRAO: PerfilUsuarioLogado = {
  nome: "Gestor de Frota",
  permissao: "Admin",
  iniciais: "GF",
};

let ultimoTokenLido: string | undefined;
let ultimoPerfilCalculado: PerfilUsuarioLogado = PERFIL_USUARIO_PADRAO;

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

/** Extrai o texto da claim `permission` (aceita string direta ou objeto `{ per_name }`). */
function extrairPermissao(
  permission: z.infer<typeof jwtPayloadUsuarioSchema>["permission"],
): string | undefined {
  if (typeof permission === "string") return permission;
  if (typeof permission === "object" && permission !== null) return permission.per_name;
  return undefined;
}

/** Gera as iniciais (2 letras) a partir do nome completo do usuário. */
export function gerarIniciaisNome(nome: string): string {
  const partes = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 0) return PERFIL_USUARIO_PADRAO.iniciais;
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  const primeiraLetra = partes[0][0] ?? "";
  const ultimaLetra = partes[partes.length - 1][0] ?? "";
  return `${primeiraLetra}${ultimaLetra}`.toUpperCase();
}

/**
 * Lê o nome (`name`), a role (`permission`) e as iniciais do usuário a partir do JWT salvo nos cookies
 * do ambiente atual (`token-mm-dev` em dev, `token-mm-demo` em demo, `token-mm` em prod).
 *
 * Mantém referência estável por token para uso direto com `useSyncExternalStore`.
 */
export function getAuthenticatedUserProfile(): PerfilUsuarioLogado {
  if (typeof window === "undefined") return PERFIL_USUARIO_PADRAO;

  const token = getTokens(getTokenCookieName());
  if (!token) return PERFIL_USUARIO_PADRAO;

  if (token === ultimoTokenLido) {
    return ultimoPerfilCalculado;
  }

  const payloadBruto = lerPayloadDoToken(token);
  const validado = jwtPayloadUsuarioSchema.safeParse(payloadBruto);

  if (!validado.success) {
    ultimoTokenLido = token;
    ultimoPerfilCalculado = PERFIL_USUARIO_PADRAO;
    return ultimoPerfilCalculado;
  }

  const nome = validado.data.name ?? PERFIL_USUARIO_PADRAO.nome;
  const permissao = extrairPermissao(validado.data.permission) ?? PERFIL_USUARIO_PADRAO.permissao;

  ultimoTokenLido = token;
  ultimoPerfilCalculado = {
    nome,
    permissao,
    iniciais: gerarIniciaisNome(nome),
  };

  return ultimoPerfilCalculado;
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

  const validado = jwtPayloadUsuarioSchema.safeParse(lerPayloadDoToken(token));
  if (!validado.success) return true;

  const perfil = extrairPermissao(validado.data.permission);
  if (!perfil) return true;

  return PERFIS_GESTORES.includes(perfil.toUpperCase());
}
