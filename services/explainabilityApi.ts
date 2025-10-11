import KalaCalAPI from '@/services/KalaCalAPI';
import { ApiResponse, XaiResultadoResponse, XaiResultadoRequest } from '@/services/types';
import { MODELS_CONFIG } from '@/constants/modelsConfig';
import { validatePatientData } from '@/utils/validationUtils';

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
    try {
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
        throw new Error('Idade deve estar entre 0 e 1200 meses');
      }

      if (processedData.peso && (processedData.peso <= 0 || processedData.peso > 200)) {
        throw new Error('Peso deve estar entre 0.1 e 200 kg');
      }

      // Preparar payload no formato correto: dados diretos (sem wrapper)
      // A API agora detecta automaticamente o melhor modelo
      const payload: XaiResultadoRequest = processedData;

      // Log para debug
      console.log('🔍 [DEBUG] Sending payload (auto-detection):', JSON.stringify(payload, null, 2));
      console.log('🔍 [DEBUG] Available fields:', Object.keys(processedData));

      // Fazer chamada para API
      const response = await KalaCalAPI.getXaiResultado(payload);

      if (!response.success) {
        console.error('❌ [DEBUG] API Error Response:', response);
        throw new Error(response.error || 'Erro ao gerar explicação');
      }

      console.log('✅ [DEBUG] API Success Response:', response.data);

      // A resposta agora inclui informações sobre qual modelo foi usado
      const enhancedResult = {
        ...response.data!,
        model_used: 'auto-detected', // Modelo foi detectado automaticamente
        model_config: null // Não temos configuração específica pois foi auto-detectado
      };

      return {
        success: true,
        data: enhancedResult
      };

    } catch (error: any) {
      console.error('❌ [DEBUG] Erro na geração de explicação:', error);
      
      return {
        success: false,
        error: this.handleExplanationError(error),
        model: 'auto-detected'
      };
    }
  }

  /**
   * Trata erros específicos da API de explicabilidade
   */
  private static handleExplanationError(error: any, modelKey?: string): string {
    const modelConfig = modelKey ? MODELS_CONFIG[modelKey] : null;
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return `Dados inválidos${modelConfig ? ` para modelo ${modelConfig.name}` : ''}: ${data.detail || 'Verifique os campos'}`;
        case 401:
          return 'Token expirado. Faça login novamente.';
        case 403:
          return 'API Key inválida ou acesso negado';
        case 404:
          return 'Endpoint de explicabilidade não encontrado';
        case 500:
          return `Erro interno${modelConfig ? ` ao processar modelo ${modelConfig.name}` : ''}`;
        case 504:
          return 'Timeout: A geração SHAP demorou mais que 60 segundos';
        default:
          return `Erro ${status}: ${data.detail || 'Erro desconhecido'}`;
      }
    } else if (error.code === 'ECONNABORTED') {
      return 'Timeout: Verifique sua conexão ou tente novamente';
    } else {
      return error.message || 'Erro de rede desconhecido';
    }
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
