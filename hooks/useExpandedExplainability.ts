import { useState, useCallback } from 'react';
import ECalacalApi, { ResultadoCompletoResponse } from '@/services/ecalacalApi';
import { getNextSuggestedVariable, ExpandedFieldConfig } from '@/constants/modelsConfig';

export type AnalysisMode = 'padrao' | 'assistido';

export interface UseExpandedExplainabilityReturn {
  mode: AnalysisMode;
  setMode: (mode: AnalysisMode) => void;
  explanation: ResultadoCompletoResponse | null;
  loading: boolean;
  error: { message: string; data?: any } | null;
  patientData: Record<string, any> | null;
  suggestedVariable: ExpandedFieldConfig | null;
  generateExplanation: (data: Record<string, any>) => Promise<void>;
  clearExplanation: () => void;
  retryExplanation: () => Promise<void>;
  updateSuggestion: (filledFields: Record<string, any>) => void;
}

export const useExpandedExplainability = (): UseExpandedExplainabilityReturn => {
  const [mode, setMode] = useState<AnalysisMode>('padrao');
  const [explanation, setExplanation] = useState<ResultadoCompletoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; data?: any } | null>(null);
  const [patientData, setPatientData] = useState<Record<string, any> | null>(null);
  const [suggestedVariable, setSuggestedVariable] = useState<ExpandedFieldConfig | null>(null);

  const updateSuggestion = useCallback((filledFields: Record<string, any>) => {
    const next = getNextSuggestedVariable(filledFields);
    setSuggestedVariable(next);
  }, []);

  const generateExplanation = useCallback(async (data: Record<string, any>) => {
    setLoading(true);
    setError(null);
    setPatientData(data);

    try {
      if (!data.Idademeses || !data.peso) {
        throw new Error('Campos obrigatórios: Idade e Peso devem ser preenchidos');
      }

      const result = await ECalacalApi.gerarExplicacaoCompleta(data, mode);

      if (result.success && result.data) {
        setExplanation(result.data);
      } else {
        throw new Error(result.error || 'Erro desconhecido na geração da explicação');
      }
    } catch (err: any) {
      console.error('Erro na explicação expandida:', err);
      setError({
        message: err.message || 'Erro desconhecido',
        data: data,
      });
      setExplanation(null);
    } finally {
      setLoading(false);
    }
  }, [mode]);

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
    mode,
    setMode,
    explanation,
    loading,
    error,
    patientData,
    suggestedVariable,
    generateExplanation,
    clearExplanation,
    retryExplanation,
    updateSuggestion,
  };
};
