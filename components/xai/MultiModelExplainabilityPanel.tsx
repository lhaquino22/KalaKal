import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import ModelSelector from './ModelSelector';
import DynamicPatientForm from './DynamicPatientForm';
import EnhancedExplanationCard from './EnhancedExplanationCard';
import { useMultiModelExplainability } from '@/hooks/useMultiModelExplainability';


interface MultiModelExplainabilityPanelProps {
  className?: string;
}

const MultiModelExplainabilityPanel: React.FC<MultiModelExplainabilityPanelProps> = ({ 
  className = '' 
}) => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  
  const {
    explanation,
    loading,
    error,
    patientData,
    generateExplanation,
    clearExplanation
  } = useMultiModelExplainability();

  const handleModelChange = (modelKey: string) => {
    setSelectedModel(modelKey);
    clearExplanation(); // Limpar explicação anterior
  };

  const handleFormSubmit = async (formData: Record<string, any>, modelKey: string) => {
    await generateExplanation(formData, modelKey);
  };

  const handleNewAnalysis = () => {
    clearExplanation();
    setSelectedModel(null);
  };

  return (
    <ScrollView style={[styles.container, className && { className }]}>
      <View style={styles.panel}>
        {/* Header do Painel */}
        <View style={styles.panelHeader}>
          <Text size="2xl" bold style={styles.panelTitle}>
            🧠 Análise de Explicabilidade Multi-Modelos
          </Text>
          <Text size="sm" style={styles.panelSubtitle}>
            Escolha entre 4 modelos especializados e veja explicações SHAP 
            personalizadas para cada tipo de análise
          </Text>
        </View>

        {/* Workflow em Etapas */}
        <View style={styles.workflow}>
          {/* Etapa 1: Seleção do Modelo */}
          <WorkflowStep
            stepNumber={1}
            title="Selecione o Modelo"
            isActive={!selectedModel}
            isCompleted={!!selectedModel}
          >
            <ModelSelector 
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
            />
          </WorkflowStep>

          {/* Etapa 2: Formulário Dinâmico */}
          <WorkflowStep
            stepNumber={2}
            title="Insira os Dados"
            isActive={!!selectedModel && !explanation && !loading}
            isCompleted={!!explanation}
            disabled={!selectedModel}
          >
            <DynamicPatientForm 
              selectedModel={selectedModel}
              onSubmit={handleFormSubmit}
              loading={loading}
              initialData={patientData || {}}
            />
          </WorkflowStep>

          {/* Etapa 3: Explicação */}
          <WorkflowStep
            stepNumber={3}
            title="Visualize a Explicação"
            isActive={loading}
            isCompleted={!!explanation}
            disabled={!selectedModel}
          >
            <EnhancedExplanationCard 
              explanation={explanation}
              patientData={patientData}
              selectedModel={selectedModel}
              loading={loading}
              error={error}
            />
          </WorkflowStep>
        </View>

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
                  // Implementar funcionalidade de impressão se necessário
                  console.log('Print functionality not implemented yet');
                }}
                action="secondary"
                variant="outline"
                style={styles.actionButton}
              >
                <ButtonText>🖨️ Imprimir Resultado</ButtonText>
              </Button>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

interface WorkflowStepProps {
  stepNumber: number;
  title: string;
  children: React.ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
  disabled?: boolean;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({
  stepNumber,
  title,
  children,
  isActive = false,
  isCompleted = false,
  disabled = false
}) => {
  return (
    <View style={[
      styles.workflowStep,
      isActive && styles.workflowStepActive,
      isCompleted && styles.workflowStepCompleted,
      disabled && styles.workflowStepDisabled
    ]}>
      <View style={styles.stepHeader}>
        <View style={[
          styles.stepNumber,
          isActive && styles.stepNumberActive,
          isCompleted && styles.stepNumberCompleted,
          disabled && styles.stepNumberDisabled
        ]}>
          <Text size="sm" bold style={[
            styles.stepNumberText,
            (isActive || isCompleted) && styles.stepNumberTextActive,
            disabled && styles.stepNumberTextDisabled
          ]}>
            {isCompleted ? '✓' : stepNumber}
          </Text>
        </View>
        <Text size="lg" bold style={[
          styles.stepTitle,
          disabled && styles.stepTitleDisabled
        ]}>
          {title}
        </Text>
      </View>
      
      <View style={[
        styles.stepContent,
        disabled && styles.stepContentDisabled
      ]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  panel: {
    padding: 8, // Reduzir ainda mais o padding
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
  workflowStep: {
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
    marginHorizontal: 2, // Reduzir margem horizontal para dar mais espaço
  },
  workflowStepActive: {
    borderColor: '#3b82f6',
    elevation: 2,
    shadowOpacity: 0.1,
  },
  workflowStepCompleted: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  workflowStepDisabled: {
    backgroundColor: '#f9fafb',
    opacity: 0.6,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberActive: {
    backgroundColor: '#3b82f6',
  },
  stepNumberCompleted: {
    backgroundColor: '#10b981',
  },
  stepNumberDisabled: {
    backgroundColor: '#d1d5db',
  },
  stepNumberText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  stepNumberTextActive: {
    color: 'white',
  },
  stepNumberTextDisabled: {
    color: '#9ca3af',
  },
  stepTitle: {
    color: '#1f2937',
    flex: 1,
  },
  stepTitleDisabled: {
    color: '#9ca3af',
  },
  stepContent: {
    // Conteúdo do passo
  },
  stepContentDisabled: {
    opacity: 0.5,
    pointerEvents: 'none',
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

export default MultiModelExplainabilityPanel;
