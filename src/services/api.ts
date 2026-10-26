import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import { z } from "zod";
import { redirectToLogin } from "@/utils/auth";
import {
  getApiGatewayUrl,
  getDriverScoringBaseUrl,
  getRefreshTokenCookieName,
  getTokenCookieName,
} from "@/utils/env-config";
import { getTokens, resetTokens, setTokens } from "@/utils/tokens";

/**
 * Contrato da resposta de /auth/refresh.
 * Apenas os tokens são obrigatórios; `user` aceita qualquer formato
 * para que diferenças nos campos nunca causem logout acidental.
 */
const refreshResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  user: z.unknown().optional().nullable(),
});

/**
 * Gateway principal (auth, cadastros etc.). Hospeda também o `/auth/refresh`.
 * O `baseURL` daqui é só o valor inicial: o Request Interceptor o recalcula a cada requisição
 * conforme o hostname (dev × prod).
 */
export const api = axios.create({
  baseURL: getApiGatewayUrl(),
});

/**
 * Backend do Ranking de Condutores (`api-driver-scoring`), acessado via Gateway em `/api-driver-scoring`.
 * Assim como na `api`, o `baseURL` é recalculado a cada requisição.
 */
export const driverScoringApi = axios.create({
  baseURL: getDriverScoringBaseUrl(),
});

// Evita várias chamadas de refresh simultâneas (Promise Lock).
// Compartilhado entre todas as instâncias: só existe um refresh por vez.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let renewingPromise: Promise<any> | null = null;

/** O refresh sempre é feito no Gateway do ambiente atual (`/auth/refresh`), nunca no driver-scoring. */
function renewAccessToken() {
  const refresh_token = getTokens(getRefreshTokenCookieName());
  return api.post(`${getApiGatewayUrl()}/auth/refresh`, { refresh_token });
}

/**
 * Aplica à instância informada:
 * - Request: define o `baseURL` do ambiente atual (via `getBaseUrl`) e injeta `Authorization: Bearer <token>`.
 * - Response: em 401, renova o token (com lock) e repete a requisição original.
 */
function applyAuthInterceptors(instance: AxiosInstance, getBaseUrl: () => string) {
  instance.interceptors.request.use((config) => {
    config.baseURL = getBaseUrl();

    const tokenName = getTokenCookieName();
    const token = getTokens(tokenName) ?? localStorage.getItem(tokenName);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const url: string = originalRequest?.url ?? "";
      const isAuthRoute = url.includes("/auth/refresh") || url.includes("/auth/login");

      if (error.response?.status !== 401 || isAuthRoute || originalRequest._retry) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      try {
        renewingPromise ??= renewAccessToken().finally(() => {
          renewingPromise = null;
        });

        const response: AxiosResponse = await renewingPromise;
        const { access_token, refresh_token, user } = refreshResponseSchema.parse(
          response.data,
        );

        setTokens(access_token, refresh_token);
        localStorage.setItem("user", JSON.stringify(user ?? {}));

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        // Repete na mesma instância (o baseURL já está em originalRequest).
        return instance(originalRequest);
      } catch (refreshError) {
        resetTokens();
        redirectToLogin(window.location.pathname + window.location.search);
        return Promise.reject(refreshError);
      }
    },
  );
}

applyAuthInterceptors(api, getApiGatewayUrl);
applyAuthInterceptors(driverScoringApi, getDriverScoringBaseUrl);
