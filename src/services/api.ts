import axios, { type AxiosResponse } from "axios";
import { z } from "zod";
import { redirectToLogin } from "@/utils/auth";
import { getTokens, resetTokens, setTokens } from "@/utils/tokens";

const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME!;
const REFRESH_TOKEN_NAME = process.env.NEXT_PUBLIC_REFRESH_TOKEN_NAME!;

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

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY,
});

// Evita várias chamadas de refresh simultâneas (Promise Lock)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let renewingPromise: Promise<any> | null = null;

function renewAccessToken() {
  const refresh_token = getTokens(REFRESH_TOKEN_NAME);
  return api.post("/auth/refresh", { refresh_token });
}

api.interceptors.request.use((config) => {
  const token =
    getTokens(TOKEN_NAME) ?? localStorage.getItem(TOKEN_NAME);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
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
      return api(originalRequest);
    } catch (refreshError) {
      resetTokens();
      redirectToLogin(window.location.pathname + window.location.search);
      return Promise.reject(refreshError);
    }
  },
);
