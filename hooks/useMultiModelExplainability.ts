import { useState, useCallback } from 'react';
import ExplainabilityApi, { ExplanationResult } from '@/services/explainabilityApi';
import { MODELS_CONFIG } from '@/constants/modelsConfig';
import { XaiResultadoResponse } from '@/services/types';

export interface UseMultiModelExplainabilityReturn {
  explanation: (XaiResultadoResponse & { model_used: string; model_config: any }) | null;
  loading: boolean;
  error: { message: string; model?: string; data?: any } | null;
  patientData: Record<string, any> | null;
  currentModel: string | null;
  generateExplanation: (data: Record<string, any>, modelKey: string) => Promise<void>;
  clearExplanation: () => void;
  retryExplanation: () => Promise<void>;
  switchModel: (newModelKey: string) => Promise<void>;
}

export const useMultiModelExplainability = (): UseMultiModelExplainabilityReturn => {
  const [explanation, setExplanation] = useState<(XaiResultadoResponse & { model_used: string; model_config: any }) | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<{ message: string; model?: string; data?: any } | null>(null);
  const [patientData, setPatientData] = useState<Record<string, any> | null>(null);
  const [currentModel, setCurrentModel] = useState<string | null>(null);

  const generateExplanation = useCallback(async (data: Record<string, any>, modelKey: string) => {
    setLoading(true);
    setError(null);
    setPatientData(data);
    setCurrentModel(modelKey);

    try {
      // Validar se o modelo existe
      const modelConfig = MODELS_CONFIG[modelKey];
      if (!modelConfig) {
        throw new Error(`Modelo "${modelKey}" não encontrado`);
      }

      // Validar se todos os campos necessários estão presentes
      const missingFields = modelConfig.features.filter(
        field => data[field] === undefined || data[field] === null || data[field] === ''
      );
      
      if (missingFields.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${missingFields.join(', ')}`);
      }

      // Fazer chamada para API
      const result: ExplanationResult = await ExplainabilityApi.generateExplanation(data, modelKey);
      
      if (result.success && result.data) {
        // Adicionar informações do modelo na resposta
        const enhancedResult = {
          ...result.data,
          model_used: modelKey,
          model_config: modelConfig
        };
        
        setExplanation(enhancedResult);
      } else {
        throw new Error(result.error || 'Erro desconhecido na geração da explicação');
      }
      
    } catch (err: any) {
      console.error('Erro na explicação:', err);
      setError({
        message: err.message || 'Erro desconhecido',
        model: modelKey,
        data: data
      });
      setExplanation(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearExplanation = useCallback(() => {
    setExplanation(null);
    setError(null);
    setPatientData(null);
    setCurrentModel(null);
  }, []);

  const retryExplanation = useCallback(async () => {
    if (patientData && currentModel) {
      await generateExplanation(patientData, currentModel);
    }
  }, [patientData, currentModel, generateExplanation]);

  const switchModel = useCallback(async (newModelKey: string) => {
    if (patientData && newModelKey !== currentModel) {
      await generateExplanation(patientData, newModelKey);
    }
  }, [patientData, currentModel, generateExplanation]);

  return {
    explanation,
    loading,
    error,
    patientData,
    currentModel,
    generateExplanation,
    clearExplanation,
    retryExplanation,
    switchModel
  };
};
