import { getLegacyUrl } from "@/utils/env-config";
import { resetTokens } from "@/utils/tokens";

/**
 * Redireciona para o /login/ do sistema legado no ambiente atual (dev, demo ou prod),
 * usado quando a sessão expira (refresh do token falhou).
 * Usa navegação "hard" (window.location), pois /login não pertence a este projeto.
 * Envia a rota atual em `callbackUrl` para o usuário voltar após logar.
 */
export function redirectToLogin(path: string) {
  const urlLogin = getLegacyUrl("/login/");

  if (path === "/" || path.startsWith("/login")) {
    window.location.href = urlLogin;
    return;
  }

  window.location.href = `${urlLogin}?callbackUrl=${encodeURIComponent(path)}`;
}

/**
 * Logout manual (botão "Sair"): limpa todos os tokens (cookies, localStorage e
 * sessionStorage) e envia para o /login/ do sistema legado no ambiente atual.
 * Usa `replace` para o botão "voltar" do navegador não reabrir a tela logada.
 */
export function logout() {
  resetTokens();
  window.location.replace(getLegacyUrl("/login/"));
}

/** Lê o usuário salvo pelo legado no localStorage (somente client-side). */
export function getCurrentUser<T = Record<string, unknown>>(): T | null {
  if (typeof window === "undefined") return null;

  try {
    const user = localStorage.getItem("user");
    return user ? (JSON.parse(user) as T) : null;
  } catch {
    return null;
  }
}
