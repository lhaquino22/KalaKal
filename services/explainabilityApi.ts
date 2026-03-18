import KalaCalAPI from '@/services/KalaCalAPI';
import { ApiResponse, XaiResultadoResponse, XaiResultadoRequest } from '@/services/types';
import { MODELS_CONFIG } from '@/constants/modelsConfig';

export interface ExplanationResult {
  success: boolean;
  data?: XaiResultadoResponse & {
    model_used: string;
    model_config: any;
  };
  error?: string;
  model?: string;
}

export class ExplainabilityApi {
  /**
   * Verifica se a API de explicabilidade está funcionando
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await KalaCalAPI.getXaiHealthcheck();
      return response.success && response.data?.status === 'ok';
    } catch (error) {
      console.error('API de explicabilidade indisponível:', error);
      return false;
    }
  }

  /**
   * Gera explicação SHAP para dados do paciente usando detecção automática de modelo
   */
  static async generateExplanation(
    patientData: Record<string, any>
  ): Promise<ExplanationResult> {
    // Converter booleans para números (0/1) como esperado pela API
    const processedData: Record<string, any> = {};

    for (const [key, value] of Object.entries(patientData)) {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'boolean') {
          processedData[key] = value ? 1 : 0;
        } else {
          processedData[key] = value;
        }
      }
    }

    // Validações básicas
    if (processedData.Idademeses && (processedData.Idademeses < 0 || processedData.Idademeses > 1200)) {
      return { success: false, error: 'Idade deve estar entre 0 e 1200 meses' };
    }

    if (processedData.peso && (processedData.peso <= 0 || processedData.peso > 200)) {
      return { success: false, error: 'Peso deve estar entre 0.1 e 200 kg' };
    }

    const payload: XaiResultadoRequest = processedData;

    if (__DEV__) {
      console.log('[ExplainabilityApi] Payload:', Object.keys(processedData));
    }

    const response = await KalaCalAPI.getXaiResultado(payload);

    if (!response.success) {
      return {
        success: false,
        error: response.error || 'Erro ao gerar explicação',
        model: 'auto-detected',
      };
    }

    return {
      success: true,
      data: {
        ...response.data!,
        model_used: 'auto-detected',
        model_config: null,
      },
    };
  }

  /**
   * Valida dados para um modelo específico
   */
  static validateDataForModel(data: Record<string, any>, modelKey: string): void {
    const modelConfig = MODELS_CONFIG[modelKey];
    if (!modelConfig) {
      throw new Error(`Modelo "${modelKey}" não existe`);
    }

    // Verificar campos obrigatórios
    const missing = modelConfig.features.filter(field => 
      data[field] === undefined || data[field] === null || data[field] === ''
    );

    if (missing.length > 0) {
      throw new Error(`Campos obrigatórios para ${modelConfig.name}: ${missing.join(', ')}`);
    }

    // Validações específicas por tipo
    if (data.Idademeses < 0 || data.Idademeses > 1200) {
      throw new Error('Idade deve estar entre 0 e 1200 meses');
    }

    if (data.peso <= 0 || data.peso > 200) {
      throw new Error('Peso deve estar entre 0.1 e 200 kg');
    }
  }

  /**
   * Lista todos os modelos disponíveis
   */
  static getAvailableModels() {
    return Object.entries(MODELS_CONFIG).map(([key, config]) => ({
      key,
      ...config
    }));
  }

  /**
   * Obtém configuração de um modelo específico
   */
  static getModelConfig(modelKey: string) {
    return MODELS_CONFIG[modelKey] || null;
  }

  /**
   * Verifica se um modelo existe
   */
  static modelExists(modelKey: string): boolean {
    return modelKey in MODELS_CONFIG;
  }
}

export default ExplainabilityApi;
