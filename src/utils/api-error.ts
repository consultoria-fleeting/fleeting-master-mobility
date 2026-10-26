import { isAxiosError } from "axios";
import { ZodError } from "zod";

/**
 * Converte qualquer erro (Axios, Zod ou desconhecido) em uma mensagem amigável em PT-BR.
 * Nunca expõe detalhes técnicos ou dados sensíveis da resposta ao usuário.
 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return "Os filtros selecionados são inválidos. Revise-os e tente novamente.";
  }

  if (isAxiosError(error)) {
    if (!error.response) {
      return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
    }

    switch (error.response.status) {
      case 400:
        return "Os filtros enviados não foram aceitos pelo servidor.";
      case 401:
      case 403:
        return "Sua sessão expirou ou você não tem permissão para ver estes dados.";
      case 404:
        return "Os dados solicitados não foram encontrados.";
      case 429:
        return "Muitas requisições em sequência. Aguarde alguns segundos e tente novamente.";
      default:
        return "O servidor encontrou um problema ao carregar os dados. Tente novamente em instantes.";
    }
  }

  return "Ocorreu um erro inesperado ao carregar os dados.";
}
