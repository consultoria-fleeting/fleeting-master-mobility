/**
 * Redireciona para o login do sistema legado.
 * Usa navegação "hard" (window.location), pois /login não pertence a este projeto.
 */
export function redirectToLogin(path: string) {
  if (path === "/" || path.startsWith("/login")) {
    window.location.href = "/login";
    return;
  }

  window.location.href = `/login?callbackUrl=${encodeURIComponent(path)}`;
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
