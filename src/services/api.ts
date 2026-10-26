import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import { z } from "zod";
import { redirectToLogin } from "@/utils/auth";
import { getTokens, resetTokens, setTokens } from "@/utils/tokens";

const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME!;
const REFRESH_TOKEN_NAME = process.env.NEXT_PUBLIC_REFRESH_TOKEN_NAME!;

/** URL de produção do backend `api-driver-scoring`, usada se a env não estiver definida. */
const DRIVER_SCORING_FALLBACK_URL = "https://api-driver-scoring.master-mobility.com";

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

/** Gateway principal (auth, cadastros etc.). Hospeda também o `/auth/refresh`. */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY,
});

/** Backend do Ranking de Condutores (`api-driver-scoring`), com baseURL própria. */
export const driverScoringApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_DRIVER_SCORING || DRIVER_SCORING_FALLBACK_URL,
});

// Evita várias chamadas de refresh simultâneas (Promise Lock).
// Compartilhado entre todas as instâncias: só existe um refresh por vez.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let renewingPromise: Promise<any> | null = null;

/** O refresh sempre é feito no Gateway (`NEXT_PUBLIC_API_GATEWAY`), nunca no driver-scoring. */
function renewAccessToken() {
  const refresh_token = getTokens(REFRESH_TOKEN_NAME);
  return api.post("/auth/refresh", { refresh_token });
}

/**
 * Aplica à instância informada:
 * - Request: injeta `Authorization: Bearer <token>`.
 * - Response: em 401, renova o token (com lock) e repete a requisição original.
 */
function applyAuthInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use((config) => {
    const token = getTokens(TOKEN_NAME) ?? localStorage.getItem(TOKEN_NAME);

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

applyAuthInterceptors(api);
applyAuthInterceptors(driverScoringApi);
