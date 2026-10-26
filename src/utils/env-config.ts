/**
 * Configuração dinâmica de ambiente (dev × demo × prod) baseada no hostname do navegador.
 *
 * Este projeto tem um único deploy (variáveis de PRODUÇÃO) servido por Rewrite em
 * `master-mobility.com`, `demo.master-mobility.com` e `dev.master-mobility.com`. Por isso o
 * ambiente é decidido em tempo de execução, espelhando as variáveis do projeto legado:
 *
 * | Ambiente | Access token    | Refresh token               | Legacy token        | API Gateway                          | Sistema legado (front)              |
 * |----------|-----------------|-----------------------------|---------------------|--------------------------------------|-------------------------------------|
 * | prod     | `token-mm`      | `refresh-token-mm`          | `legacy-token-mm`   | `https://api.master-mobility.com`      | `https://master-mobility.com`       |
 * | demo     | `token-mm-demo` | `refresh-token-mm-new-demo` | `legacy-token-mm-demo` | `https://demo-api.master-mobility.com` | `https://demo.master-mobility.com`  |
 * | dev      | `token-mm-dev`  | `refresh-token-mm-dev`      | `legacy-token-mm-dev`  | `https://dev-api.master-mobility.com`  | `https://dev.master-mobility.com`   |
 *
 * No servidor (sem `window`) sempre vale o ambiente de produção (variáveis `NEXT_PUBLIC_*`).
 */

export type AppEnvironment = "dev" | "demo" | "prod";

interface EnvironmentConfig {
  tokenCookie: string;
  refreshTokenCookie: string;
  legacyTokenCookie: string;
  apiGatewayUrl: string;
  /** Front-end do sistema legado (destino dos links do menu e do logout) */
  legacyAppUrl: string;
}

const ENVIRONMENTS: Record<AppEnvironment, EnvironmentConfig> = {
  dev: {
    tokenCookie: "token-mm-dev",
    refreshTokenCookie: "refresh-token-mm-dev",
    legacyTokenCookie: "legacy-token-mm-dev",
    apiGatewayUrl: "https://dev-api.master-mobility.com",
    legacyAppUrl: "https://dev.master-mobility.com",
  },
  demo: {
    tokenCookie: "token-mm-demo",
    refreshTokenCookie: "refresh-token-mm-new-demo",
    legacyTokenCookie: "legacy-token-mm-demo",
    apiGatewayUrl: "https://demo-api.master-mobility.com",
    legacyAppUrl: "https://demo.master-mobility.com",
  },
  prod: {
    tokenCookie: "token-mm",
    refreshTokenCookie: "refresh-token-mm",
    legacyTokenCookie: "legacy-token-mm",
    apiGatewayUrl: "https://api.master-mobility.com",
    legacyAppUrl: "https://master-mobility.com",
  },
};

/** Nomes de cookie de access token de todos os ambientes, na ordem de fallback (dev, demo, prod). */
export const ACCESS_TOKEN_COOKIES = [
  ENVIRONMENTS.dev.tokenCookie,
  ENVIRONMENTS.demo.tokenCookie,
  ENVIRONMENTS.prod.tokenCookie,
];

/** Nomes de cookie de refresh token de todos os ambientes, na ordem de fallback (dev, demo, prod). */
export const REFRESH_TOKEN_COOKIES = [
  ENVIRONMENTS.dev.refreshTokenCookie,
  ENVIRONMENTS.demo.refreshTokenCookie,
  ENVIRONMENTS.prod.refreshTokenCookie,
];

/** Nomes de cookie do legacy token de todos os ambientes (usados só na limpeza do logout). */
export const LEGACY_TOKEN_COOKIES = [
  ENVIRONMENTS.dev.legacyTokenCookie,
  ENVIRONMENTS.demo.legacyTokenCookie,
  ENVIRONMENTS.prod.legacyTokenCookie,
];

/** Detecta o ambiente pelo hostname atual. Fora do navegador, retorna `prod`. */
export function getEnvironment(): AppEnvironment {
  if (typeof window === "undefined") return "prod";

  const { hostname } = window.location;

  if (hostname.startsWith("dev.") || hostname.includes("-dev") || hostname === "localhost") {
    return "dev";
  }
  if (hostname.startsWith("demo.") || hostname.includes("-demo")) {
    return "demo";
  }
  return "prod";
}

/** `true` quando o hostname atual é de desenvolvimento/homologação (`dev.*`, `*-dev*` ou `localhost`). */
export function isDevHost(): boolean {
  return getEnvironment() === "dev";
}

/** Nome do cookie do access token do ambiente atual. */
export function getTokenCookieName(): string {
  const env = getEnvironment();
  if (env !== "prod") return ENVIRONMENTS[env].tokenCookie;
  return process.env.NEXT_PUBLIC_TOKEN_NAME || ENVIRONMENTS.prod.tokenCookie;
}

/** Nome do cookie do refresh token do ambiente atual. */
export function getRefreshTokenCookieName(): string {
  const env = getEnvironment();
  if (env !== "prod") return ENVIRONMENTS[env].refreshTokenCookie;
  return process.env.NEXT_PUBLIC_REFRESH_TOKEN_NAME || ENVIRONMENTS.prod.refreshTokenCookie;
}

/** URL do API Gateway do ambiente atual (sem barra final). */
export function getApiGatewayUrl(): string {
  const env = getEnvironment();
  if (env !== "prod") return ENVIRONMENTS[env].apiGatewayUrl;
  return (process.env.NEXT_PUBLIC_API_GATEWAY || ENVIRONMENTS.prod.apiGatewayUrl).replace(/\/+$/, "");
}

/** baseURL do `api-driver-scoring`, que é acessado via Gateway sob o prefixo `/api-driver-scoring`. */
export function getDriverScoringBaseUrl(): string {
  return `${getApiGatewayUrl()}/api-driver-scoring`;
}

/** URL do front-end legado de um ambiente (sem barra final). Padrão: ambiente atual. */
export function getLegacyAppUrl(env: AppEnvironment = getEnvironment()): string {
  return ENVIRONMENTS[env].legacyAppUrl;
}

/**
 * Monta a URL absoluta de uma rota do sistema legado no ambiente informado.
 * Ex.: em `dev.master-mobility.com`, `getLegacyUrl("/inventario/")` => `https://dev.master-mobility.com/inventario/`.
 */
export function getLegacyUrl(path: string, env: AppEnvironment = getEnvironment()): string {
  const caminho = path.startsWith("/") ? path : `/${path}`;
  return `${getLegacyAppUrl(env)}${caminho}`;
}
