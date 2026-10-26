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
        return "Sua sessão expirou. Faça login novamente.";
      case 403:
        return "Você não tem permissão para acessar estes dados (filial, departamento ou perfil fora do seu escopo).";
      case 404:
        return "Os dados solicitados não foram encontrados ou estão fora do seu escopo de acesso.";
      case 429:
        return "Muitas requisições em sequência. Aguarde alguns segundos e tente novamente.";
      default:
        return "O servidor encontrou um problema ao carregar os dados. Tente novamente em instantes.";
    }
  }

  return "Ocorreu um erro inesperado ao carregar os dados.";
}

/**
 * Mensagem amigável para falhas ao APLICAR ou REVOGAR uma exceção (FLEET-2301).
 * Erros inesperados caem no `getApiErrorMessage`.
 */
export function getExceptionActionErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Os dados informados são inválidos.";
  }

  if (isAxiosError(error) && error.response) {
    switch (error.response.status) {
      case 400:
        return "A justificativa ou os identificadores enviados não foram aceitos. Revise e tente novamente.";
      case 403:
        return "Você não possui perfil de gestor para aplicar ou revogar exceções.";
      case 404:
        return "Condutor, evento ou exceção não encontrado.";
      case 409:
        return "Já existe uma exceção aplicada para este evento.";
      case 422:
        return "Este evento não possui impacto na pontuação, por isso não aceita exceção.";
    }
  }

  return getApiErrorMessage(error);
}
