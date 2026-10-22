import Cookies from "js-cookie";

const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME!;
const REFRESH_TOKEN_NAME = process.env.NEXT_PUBLIC_REFRESH_TOKEN_NAME!;

/** Lê um cookie de token pelo nome. */
export function getTokens(cname: string) {
  return Cookies.get(cname);
}

/** Grava access e refresh token nos cookies (30 dias), compartilhados com o legado. */
export function setTokens(access_token: string, refresh_token: string) {
  Cookies.set(TOKEN_NAME, access_token, { expires: 30, path: "/" });
  Cookies.set(REFRESH_TOKEN_NAME, refresh_token, { expires: 30, path: "/" });
}

/** Limpa o localStorage e todos os cookies de autenticação. */
export function resetTokens() {
  localStorage.clear();

  [
    "refresh-token-mm-dev",
    "token-mm-dev",
    TOKEN_NAME,
    REFRESH_TOKEN_NAME,
  ].forEach((name) => Cookies.remove(name, { path: "/" }));
}
