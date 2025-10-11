import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import SimpleExplicabilityForm from './SimpleExplicabilityForm';
import SmartExplanationResults from './SmartExplanationResults';
import SmartErrorHandler from './SmartErrorHandler';
import { useSmartExplainability } from '@/hooks/useMultiModelExplainability';

interface SmartExplainabilityPanelProps {
  className?: string;
}

const SmartExplainabilityPanel: React.FC<SmartExplainabilityPanelProps> = ({ 
  className = '' 
}) => {
  const {
    explanation,
    loading,
    error,
    patientData,
    generateExplanation,
    clearExplanation,
    retryExplanation
  } = useSmartExplainability();

  const handleFormSubmit = async (formData: Record<string, any>) => {
    await generateExplanation(formData);
  };

  const handleNewAnalysis = () => {
    clearExplanation();
  };

  const handleRetry = () => {
    retryExplanation();
  };

  const handleClearError = () => {
    clearExplanation();
  };

  return (
    <ScrollView style={[styles.container]}>
      <View style={styles.panel}>
        {/* Header do Painel */}
        <View style={styles.panelHeader}>
          <Text size="2xl" bold style={styles.panelTitle}>
            🧠 Análise de Explicabilidade Inteligente
          </Text>
          <Text size="sm" style={styles.panelSubtitle}>
            Nossa API detecta automaticamente o melhor modelo baseado nos dados fornecidos
          </Text>
        </View>

        {/* Workflow Inteligente */}
        <View style={styles.workflow}>
          {/* Formulário */}
          <View style={styles.formSection}>
            <SimpleExplicabilityForm 
              onSubmit={handleFormSubmit}
              loading={loading}
            />
          </View>

          {/* Resultados */}
          {(loading || explanation) && (
            <View style={styles.resultsSection}>
              <SmartExplanationResults 
                result={explanation}
                patientData={patientData}
                loading={loading}
              />
            </View>
          )}
        </View>

        {/* Tratamento de Erros Inteligente */}
        {error && (
          <SmartErrorHandler 
            error={error}
            onRetry={handleRetry}
            onClear={handleClearError}
          />
        )}

        {/* Ações Globais */}
        {(explanation || error) && (
          <View style={styles.panelActions}>
            <Button 
              onPress={handleNewAnalysis}
              action="secondary"
              variant="outline"
              style={styles.actionButton}
            >
              <ButtonText>🔄 Nova Análise</ButtonText>
            </Button>
            
            {explanation && (
              <Button 
                onPress={() => {
                  // Implementar funcionalidade de compartilhamento se necessário
                  console.log('Share functionality not implemented yet');
                }}
                action="secondary"
                variant="outline"
                style={styles.actionButton}
              >
                <ButtonText>📤 Compartilhar</ButtonText>
              </Button>
            )}
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
  panelHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  panelTitle: {
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  panelSubtitle: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
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
