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
   * Gera explicação SHAP para dados do paciente
   */
  static async generateExplanation(
    patientData: Record<string, any>,
    selectedModel?: string
  ): Promise<ExplanationResult> {
    try {
      // Se modelo específico foi selecionado, validar
      if (selectedModel) {
        const modelConfig = MODELS_CONFIG[selectedModel];
        if (!modelConfig) {
          throw new Error(`Modelo "${selectedModel}" não existe`);
        }

        // Validar dados baseado no modelo selecionado
        const validationErrors = validatePatientData(patientData, modelConfig.features);
        if (Object.keys(validationErrors).length > 0) {
          const errorMessages = Object.values(validationErrors).join(', ');
          throw new Error(`Campos obrigatórios para ${modelConfig.name}: ${errorMessages}`);
        }

        // Verificar campos obrigatórios
        const missing = modelConfig.features.filter(field => 
          patientData[field] === undefined || 
          patientData[field] === null || 
          patientData[field] === ''
        );

        if (missing.length > 0) {
          throw new Error(`Campos obrigatórios para ${modelConfig.name}: ${missing.join(', ')}`);
        }

        // Validações específicas por tipo
        if (patientData.Idademeses < 0 || patientData.Idademeses > 1200) {
          throw new Error('Idade deve estar entre 0 e 1200 meses');
        }

        if (patientData.peso <= 0 || patientData.peso > 200) {
          throw new Error('Peso deve estar entre 0.1 e 200 kg');
        }
      }

      // Converter booleans para números (0/1) como esperado pela API
      // E filtrar apenas os campos necessários para o modelo selecionado
      const processedData: Record<string, any> = {};
      
      // Se um modelo foi selecionado, usar apenas suas features
      const fieldsToSend = selectedModel ? MODELS_CONFIG[selectedModel].features : Object.keys(patientData);
      
      for (const key of fieldsToSend) {
        const value = patientData[key];
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'boolean') {
            processedData[key] = value ? 1 : 0;
          } else {
            processedData[key] = value;
          }
        }
      }

      // Preparar payload no formato correto: dados dentro de "pacienteDados"
      // IMPORTANTE: Não incluir campo 'id' - a API não espera esse campo
      const payload: XaiResultadoRequest = {
        pacienteDados: processedData
      };

      // Log para debug
      console.log('🔍 [DEBUG] Selected model:', selectedModel);
      console.log('🔍 [DEBUG] Fields to send for model:', fieldsToSend);
      console.log('🔍 [DEBUG] Processed data:', processedData);
      console.log('🔍 [DEBUG] Sending payload:', JSON.stringify(payload, null, 2));

      // Fazer chamada para API
      const response = await KalaCalAPI.getXaiResultado(payload);

      if (!response.success) {
        console.error('❌ [DEBUG] API Error Response:', response);
        throw new Error(response.error || 'Erro ao gerar explicação');
      }

      console.log('✅ [DEBUG] API Success Response:', response.data);

      // Adicionar informações do modelo na resposta
      const enhancedResult = {
        ...response.data!,
        model_used: selectedModel || 'auto',
        model_config: selectedModel ? MODELS_CONFIG[selectedModel] : null
      };

      return {
        success: true,
        data: enhancedResult
      };

    } catch (error: any) {
      console.error('❌ [DEBUG] Erro na geração de explicação:', error);
      
      return {
        success: false,
        error: this.handleExplanationError(error, selectedModel),
        model: selectedModel
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
