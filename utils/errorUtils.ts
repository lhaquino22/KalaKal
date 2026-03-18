import axios, { AxiosError } from 'axios';

/**
 * Erro padronizado da API, extraído do envelope backend:
 * { ok: false, error: { code, message, details? } }
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  isNetworkError: boolean;
  isAuthError: boolean;
  retryable: boolean;
  statusCode?: number;
}

/**
 * Parseia qualquer erro (Axios, Error, unknown) e retorna um ApiError padronizado.
 *
 * Prioridades:
 * 1. Envelope novo: response.data.error.code + response.data.error.message
 * 2. Formato legado: response.data.error (string) / response.data.detail
 * 3. Erros de rede / timeout
 * 4. Fallback genérico
 */
export function parseApiError(error: unknown): ApiError {
  // Axios error com response do servidor
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<any>;

    if (axiosErr.response) {
      const { status, data } = axiosErr.response;

      // Envelope novo: { ok: false, error: { code, message, details? } }
      if (data?.error?.code) {
        const envelope = data.error;
        const code: string = envelope.code;
        const isAuth = ['INVALID_CREDENTIALS', 'TOKEN_EXPIRED', 'TOKEN_INVALID', 'API_KEY_REQUIRED', 'API_KEY_INVALID'].includes(code);
        return {
          code,
          message: envelope.message || 'Erro desconhecido.',
          details: envelope.details,
          isNetworkError: false,
          isAuthError: isAuth,
          retryable: !isAuth && status >= 500,
          statusCode: status,
        };
      }

      // Formato legado: { error: "string" } ou { detail: "string" }
      const legacyMessage =
        (typeof data?.error === 'string' ? data.error : null) ||
        data?.detail ||
        data?.message ||
        null;

      const isAuth = status === 401 || status === 403;
      return {
        code: isAuth ? 'AUTH_ERROR' : `HTTP_${status}`,
        message: legacyMessage || statusToMessage(status),
        isNetworkError: false,
        isAuthError: isAuth,
        retryable: status >= 500,
        statusCode: status,
      };
    }

    // Timeout
    if (axiosErr.code === 'ECONNABORTED') {
      return {
        code: 'TIMEOUT',
        message: 'A requisição demorou demais. Verifique sua conexão e tente novamente.',
        isNetworkError: true,
        isAuthError: false,
        retryable: true,
      };
    }

    // Sem response (erro de rede)
    return {
      code: 'NETWORK_ERROR',
      message: 'Sem conexão com o servidor. Verifique sua internet.',
      isNetworkError: true,
      isAuthError: false,
      retryable: true,
    };
  }

  // Error padrão do JS
  if (error instanceof Error) {
    return {
      code: 'CLIENT_ERROR',
      message: error.message,
      isNetworkError: false,
      isAuthError: false,
      retryable: false,
    };
  }

  // Fallback
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Erro desconhecido. Tente novamente.',
    isNetworkError: false,
    isAuthError: false,
    retryable: false,
  };
}

function statusToMessage(status: number): string {
  switch (status) {
    case 400: return 'Dados inválidos. Verifique os campos.';
    case 401: return 'Sua sessão expirou. Faça login novamente.';
    case 403: return 'Acesso negado.';
    case 404: return 'Recurso não encontrado.';
    case 422: return 'Não foi possível processar os dados informados.';
    case 429: return 'Muitas requisições. Aguarde um momento.';
    case 500: return 'Erro interno do servidor. Tente novamente mais tarde.';
    case 502: return 'Servidor temporariamente indisponível. Tente novamente.';
    case 503: return 'Serviço indisponível. Tente novamente mais tarde.';
    case 504: return 'Tempo de resposta excedido. Tente novamente.';
    default: return `Erro inesperado (${status}).`;
  }
}
