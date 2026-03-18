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
    errorCode?: string;
  }> {
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

    if (__DEV__) {
      console.log('[eCalacal] Payload:', JSON.stringify(processedData, null, 2));
    }

    const response = await KalaCalAPI.getXaiResultadoCompleto(processedData);

    if (!response.success) {
      return {
        success: false,
        error: response.error || 'Erro ao gerar explicação',
        errorCode: response.errorCode,
      };
    }

    return {
      success: true,
      data: response.data as ResultadoCompletoResponse,
    };
  }
}

export default ECalacalApi;
