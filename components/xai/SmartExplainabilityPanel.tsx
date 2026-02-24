import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import SimpleExplicabilityForm from './SimpleExplicabilityForm';
import ExpandedPatientForm from './ExpandedPatientForm';
import SmartExplanationResults from './SmartExplanationResults';
import SmartErrorHandler from './SmartErrorHandler';
import ImputationResultCard from './ImputationResultCard';
import { useSmartExplainability } from '@/hooks/useMultiModelExplainability';
import { useExpandedExplainability, AnalysisMode } from '@/hooks/useExpandedExplainability';

interface SmartExplainabilityPanelProps {
  className?: string;
}

const SmartExplainabilityPanel: React.FC<SmartExplainabilityPanelProps> = ({
  className = ''
}) => {
  // Hook do modo padrão (existente)
  const standard = useSmartExplainability();
  // Hook do modo assistido (novo)
  const expanded = useExpandedExplainability();

  const isAssisted = expanded.mode === 'assistido';

  // Selecionar estado ativo baseado no modo
  const activeExplanation = isAssisted ? expanded.explanation : standard.explanation;
  const activeLoading = isAssisted ? expanded.loading : standard.loading;
  const activeError = isAssisted ? expanded.error : standard.error;
  const activePatientData = isAssisted ? expanded.patientData : standard.patientData;

  const handleModeChange = (newMode: AnalysisMode) => {
    // Limpar resultados ao trocar de modo
    standard.clearExplanation();
    expanded.clearExplanation();
    expanded.setMode(newMode);
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    if (isAssisted) {
      await expanded.generateExplanation(formData);
    } else {
      await standard.generateExplanation(formData);
    }
  };

  const handleNewAnalysis = () => {
    if (isAssisted) {
      expanded.clearExplanation();
    } else {
      standard.clearExplanation();
    }
  };

  const handleRetry = () => {
    if (isAssisted) {
      expanded.retryExplanation();
    } else {
      standard.retryExplanation();
    }
  };

  const handleClearError = () => {
    handleNewAnalysis();
  };

  return (
    <ScrollView style={[styles.container]}>
      <View style={styles.panel}>
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
          {/* Formulário */}
          <View style={styles.formSection}>
            {isAssisted ? (
              <ExpandedPatientForm
                onSubmit={handleFormSubmit}
                loading={activeLoading}
                onFieldsChange={expanded.updateSuggestion}
              />
            ) : (
              <SimpleExplicabilityForm
                onSubmit={handleFormSubmit}
                loading={activeLoading}
              />
            )}
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
          {(activeLoading || activeExplanation) && (
            <View style={styles.resultsSection}>
              <SmartExplanationResults
                result={activeExplanation as any}
                patientData={activePatientData}
                loading={activeLoading}
                camposImputados={isAssisted && expanded.explanation ? expanded.explanation.campos_imputados : undefined}
              />
            </View>
          )}
        </View>

        {/* Tratamento de Erros */}
        {activeError && (
          <SmartErrorHandler
            error={activeError}
            onRetry={handleRetry}
            onClear={handleClearError}
          />
        )}

        {/* Ações Globais */}
        {(activeExplanation || activeError) && (
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
