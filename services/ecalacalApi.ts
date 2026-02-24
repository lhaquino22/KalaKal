import KalaCalAPI from '@/services/KalaCalAPI';
import { XaiResultadoResponse } from '@/services/types';

export interface ResultadoCompletoResponse extends XaiResultadoResponse {
  modo: string;
  campos_informados: Record<string, any>;
  campos_imputados: Record<string, any>;
  modelo_utilizado: string;
}

export class ECalacalApi {
  /**
   * Gera explicação SHAP com suporte a imputação de dados faltantes.
   * Usa o endpoint /api/xai/resultado-completo/.
   */
  static async gerarExplicacaoCompleta(
    patientData: Record<string, any>,
    modo: 'padrao' | 'assistido'
  ): Promise<{
    success: boolean;
    data?: ResultadoCompletoResponse;
    error?: string;
  }> {
    try {
      const processedData: Record<string, any> = { modo };

      for (const [key, value] of Object.entries(patientData)) {
        if (key === 'modo') continue;
        if (value === null || value === undefined || value === '') {
          processedData[key] = null;
        } else if (typeof value === 'boolean') {
          processedData[key] = value ? 1 : 0;
        } else {
          processedData[key] = value;
        }
      }

      console.log('[eCalacal] Payload:', JSON.stringify(processedData, null, 2));

      const response = await KalaCalAPI.getXaiResultadoCompleto(processedData);

      if (!response.success) {
        throw new Error(response.error || 'Erro ao gerar explicação');
      }

      return {
        success: true,
        data: response.data as ResultadoCompletoResponse,
      };
    } catch (error: any) {
      console.error('[eCalacal] Erro:', error);

      let errorMessage = 'Erro desconhecido';
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        switch (status) {
          case 400:
            errorMessage = `Dados inválidos: ${data.detail || data.message || 'Verifique os campos'}`;
            break;
          case 401:
            errorMessage = 'Token expirado. Faça login novamente.';
            break;
          case 500:
            errorMessage = data.message || 'Erro interno do servidor';
            break;
          case 504:
            errorMessage = 'Timeout: A análise demorou mais que 60 segundos';
            break;
          default:
            errorMessage = `Erro ${status}: ${data.detail || 'Erro desconhecido'}`;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout: Verifique sua conexão ou tente novamente';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export default ECalacalApi;
