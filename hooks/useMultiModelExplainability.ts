import { useState, useCallback } from 'react';
import ExplainabilityApi, { ExplanationResult } from '@/services/explainabilityApi';
import { XaiResultadoResponse } from '@/services/types';

export interface UseSmartExplainabilityReturn {
  explanation: (XaiResultadoResponse & { model_used: string; model_config: any }) | null;
  loading: boolean;
  error: { message: string; data?: any } | null;
  patientData: Record<string, any> | null;
  generateExplanation: (data: Record<string, any>) => Promise<void>;
  clearExplanation: () => void;
  retryExplanation: () => Promise<void>;
}

export const useSmartExplainability = (): UseSmartExplainabilityReturn => {
  const [explanation, setExplanation] = useState<(XaiResultadoResponse & { model_used: string; model_config: any }) | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<{ message: string; data?: any } | null>(null);
  const [patientData, setPatientData] = useState<Record<string, any> | null>(null);

  const generateExplanation = useCallback(async (data: Record<string, any>) => {
    setLoading(true);
    setError(null);
    setPatientData(data);

    try {
      // Validações básicas
      if (!data.Idademeses || !data.peso) {
        throw new Error('Campos obrigatórios: Idade e Peso devem ser preenchidos');
      }

      // Fazer chamada para API (detecção automática de modelo)
      const result: ExplanationResult = await ExplainabilityApi.generateExplanation(data);
      
      if (result.success && result.data) {
        setExplanation(result.data);
      } else {
        throw new Error(result.error || 'Erro desconhecido na geração da explicação');
      }
      
    } catch (err: any) {
      console.error('Erro na explicação:', err);
      setError({
        message: err.message || 'Erro desconhecido',
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
  }, []);

  const retryExplanation = useCallback(async () => {
    if (patientData) {
      await generateExplanation(patientData);
    }
  }, [patientData, generateExplanation]);

  return {
    explanation,
    loading,
    error,
    patientData,
    generateExplanation,
    clearExplanation,
    retryExplanation
  };
};
