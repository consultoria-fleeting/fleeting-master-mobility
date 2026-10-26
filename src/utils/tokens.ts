import Cookies from "js-cookie";
import {
  ACCESS_TOKEN_COOKIES,
  LEGACY_TOKEN_COOKIES,
  REFRESH_TOKEN_COOKIES,
  getRefreshTokenCookieName,
  getTokenCookieName,
} from "@/utils/env-config";

/** Lê o primeiro cookie existente da lista (na ordem informada). */
function getFirstCookie(names: string[]): string | undefined {
  for (const name of names) {
    const value = Cookies.get(name);
    if (value) return value;
  }
  return undefined;
}

/**
 * Lê um cookie de token pelo nome.
 * Se vier vazio e o nome for o do access (ou do refresh) token do ambiente atual, faz fallback
 * pela ordem dev -> demo -> prod, sempre dentro do MESMO tipo de token (access nunca vira refresh).
 */
export function getTokens(cname: string) {
  const value = Cookies.get(cname);
  if (value) return value;

  if (cname === getTokenCookieName()) return getFirstCookie(ACCESS_TOKEN_COOKIES);
  if (cname === getRefreshTokenCookieName()) return getFirstCookie(REFRESH_TOKEN_COOKIES);
  return value;
}

/** Grava access e refresh token nos cookies (30 dias) do ambiente atual, compartilhados com o legado. */
export function setTokens(access_token: string, refresh_token: string) {
  Cookies.set(getTokenCookieName(), access_token, { expires: 30, path: "/" });
  Cookies.set(getRefreshTokenCookieName(), refresh_token, { expires: 30, path: "/" });
}

/**
 * Domínios em que um cookie pode ter sido gravado. O js-cookie só remove um cookie
 * quando o `domain` informado é o mesmo da gravação, então tentamos todas as variantes:
 * sem domain (host atual), o próprio host e o domínio raiz (ex.: `.master-mobility.com`).
 */
function getDominiosDosCookies(): (string | undefined)[] {
  const { hostname } = window.location;
  const partes = hostname.split(".");
  // localhost ou IP: não existe domínio raiz
  if (partes.length < 2 || /^\d+(\.\d+){3}$/.test(hostname)) return [undefined];

  const dominioRaiz = partes.slice(-2).join(".");
  return [undefined, hostname, dominioRaiz, `.${dominioRaiz}`];
}

/**
 * Limpa localStorage, sessionStorage e todos os cookies de autenticação
 * (access, refresh e legacy de todos os ambientes), em todas as variantes de domínio.
 */
export function resetTokens() {
  localStorage.clear();
  sessionStorage.clear();

  const nomes = new Set([
    ...ACCESS_TOKEN_COOKIES,
    ...REFRESH_TOKEN_COOKIES,
    ...LEGACY_TOKEN_COOKIES,
    getTokenCookieName(),
    getRefreshTokenCookieName(),
  ]);
  const dominios = getDominiosDosCookies();

  nomes.forEach((nome) => {
    dominios.forEach((domain) => Cookies.remove(nome, { path: "/", domain }));
  });
}
