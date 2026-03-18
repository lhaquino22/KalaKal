import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import ExpandedPatientForm from './ExpandedPatientForm';
import SmartExplanationResults from './SmartExplanationResults';
import SmartErrorHandler from './SmartErrorHandler';
import ImputationResultCard from './ImputationResultCard';
import OcorrenciaPicker from '@/components/shared/OcorrenciaPicker';
import { useExpandedExplainability, AnalysisMode } from '@/hooks/useExpandedExplainability';

interface SmartExplainabilityPanelProps {
  className?: string;
}

const SmartExplainabilityPanel: React.FC<SmartExplainabilityPanelProps> = ({
  className = ''
}) => {
  // Hook unificado — ambos os modos usam /resultado-completo/ com modo diferente
  const expanded = useExpandedExplainability();
  // Ocorrência opcional
  const [selectedCasoId, setSelectedCasoId] = useState<string | undefined>(undefined);

  const isAssisted = expanded.mode === 'assistido';

  const handleModeChange = (newMode: AnalysisMode) => {
    expanded.clearExplanation();
    expanded.setMode(newMode);
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    const dataWithCaso = selectedCasoId
      ? { ...formData, caso_id: parseInt(selectedCasoId, 10) }
      : formData;
    await expanded.generateExplanation(dataWithCaso);
  };

  const handleNewAnalysis = () => {
    expanded.clearExplanation();
  };

  const handleRetry = () => {
    expanded.retryExplanation();
  };

  const handleClearError = () => {
    handleNewAnalysis();
  };

  return (
    <ScrollView style={[styles.container]}>
      <View style={styles.panel}>
        {/* Seletor de Ocorrência */}
        <View style={styles.ocorrenciaSection}>
          <Text size="sm" style={styles.ocorrenciaLabel}>Associar a uma Ocorrencia (opcional)</Text>
          <OcorrenciaPicker
            value={selectedCasoId}
            onChange={setSelectedCasoId}
          />
        </View>

        {/* Toggle de Modo */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[styles.modeOption, !isAssisted && styles.modeOptionActive]}
            onPress={() => handleModeChange('padrao')}
            activeOpacity={0.7}
          >
            <Text size="sm" bold={!isAssisted} style={[styles.modeText, !isAssisted && styles.modeTextActive]}>
              Análise Direta
            </Text>
            <Text size="xs" style={[styles.modeDescription, !isAssisted && styles.modeDescriptionActive]}>
              Usa apenas os dados informados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeOption, isAssisted && styles.modeOptionActiveAssisted]}
            onPress={() => handleModeChange('assistido')}
            activeOpacity={0.7}
          >
            <Text size="sm" bold={isAssisted} style={[styles.modeText, isAssisted && styles.modeTextActive]}>
              Análise Completa
            </Text>
            <Text size="xs" style={[styles.modeDescription, isAssisted && styles.modeDescriptionActive]}>
              Estima dados faltantes automaticamente
            </Text>
          </TouchableOpacity>
        </View>

        {/* Workflow */}
        <View style={styles.workflow}>
          {/* Formulário — ambos os modos usam o mesmo formulário de 17 campos */}
          <View style={styles.formSection}>
            <ExpandedPatientForm
              onSubmit={handleFormSubmit}
              loading={expanded.loading}
              onFieldsChange={expanded.updateSuggestion}
              mode={expanded.mode}
            />
          </View>

          {/* Card de Imputação (apenas modo assistido) */}
          {isAssisted && expanded.explanation && (
            <View style={styles.imputationSection}>
              <ImputationResultCard
                camposInformados={expanded.explanation.campos_informados || {}}
                camposImputados={expanded.explanation.campos_imputados || {}}
              />
            </View>
          )}

          {/* Resultados */}
          {(expanded.loading || expanded.explanation) && (
            <View style={styles.resultsSection}>
              <SmartExplanationResults
                result={expanded.explanation as any}
                patientData={expanded.patientData}
                loading={expanded.loading}
                camposImputados={isAssisted && expanded.explanation ? expanded.explanation.campos_imputados : undefined}
              />
            </View>
          )}
        </View>

        {/* Tratamento de Erros */}
        {expanded.error && (
          <SmartErrorHandler
            error={expanded.error}
            onRetry={handleRetry}
            onClear={handleClearError}
          />
        )}

        {/* Ações Globais */}
        {(expanded.explanation || expanded.error) && (
          <View style={styles.panelActions}>
            <Button
              onPress={handleNewAnalysis}
              action="secondary"
              variant="outline"
              style={styles.actionButton}
            >
              <ButtonText>Nova Análise</ButtonText>
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  panel: {
    padding: 8,
    gap: 24,
  },
  ocorrenciaSection: {
    marginHorizontal: 8,
    gap: 6,
  },
  ocorrenciaLabel: {
    color: '#374151',
    fontWeight: '500',
  },
  modeToggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginHorizontal: 8,
    backgroundColor: 'white',
  },
  modeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: 'white',
    gap: 2,
  },
  modeOptionActive: {
    backgroundColor: '#16a34a',
  },
  modeOptionActiveAssisted: {
    backgroundColor: '#6366F1',
  },
  modeText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  modeTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  modeDescription: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
  modeDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  workflow: {
    gap: 24,
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginHorizontal: 2,
  },
  imputationSection: {
    marginHorizontal: 2,
  },
  resultsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginHorizontal: 2,
  },
  panelActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    maxWidth: 200,
  },
});

export default SmartExplainabilityPanel;
