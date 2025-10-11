import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import SmartExplicabilityForm from './SmartExplicabilityForm';
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
    <ScrollView style={[styles.container, className && { className }]}>
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
          {/* Etapa 1: Formulário Inteligente */}
          <WorkflowStep
            stepNumber={1}
            title="Insira os Dados"
            subtitle="Campos básicos obrigatórios + opcionais para modelos especializados"
            isActive={!explanation && !loading}
            isCompleted={!!explanation}
          >
            <SmartExplicabilityForm 
              onSubmit={handleFormSubmit}
              loading={loading}
            />
          </WorkflowStep>

          {/* Etapa 2: Resultados */}
          <WorkflowStep
            stepNumber={2}
            title="Visualize a Explicação"
            subtitle="Resultado da análise com modelo auto-detectado"
            isActive={loading}
            isCompleted={!!explanation}
            disabled={!patientData && !loading}
          >
            <SmartExplanationResults 
              result={explanation}
              patientData={patientData}
              loading={loading}
            />
          </WorkflowStep>
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

        {/* Informações sobre a Detecção Automática */}
        <View style={styles.infoSection}>
          <Text size="sm" bold style={styles.infoTitle}>
            ℹ️ Como Funciona a Detecção Automática
          </Text>
          <View style={styles.infoList}>
            <InfoItem 
              icon="🎯"
              title="Modelo Clínicas"
              description="Usado com dados básicos: idade, peso, edema"
            />
            <InfoItem 
              icon="🦠"
              title="Modelo AIDS"
              description="Ativado quando informação sobre AIDS é fornecida"
            />
            <InfoItem 
              icon="🔬"
              title="Modelo Plaque"
              description="Utilizado quando valor de plaque é informado"
            />
            <InfoItem 
              icon="🎯"
              title="Modelo Completa"
              description="Modelo mais abrangente com AIDS + plaque"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

interface WorkflowStepProps {
  stepNumber: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
  disabled?: boolean;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({
  stepNumber,
  title,
  subtitle,
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
        <View style={styles.stepInfo}>
          <Text size="lg" bold style={[
            styles.stepTitle,
            disabled && styles.stepTitleDisabled
          ]}>
            {title}
          </Text>
          <Text size="sm" style={[
            styles.stepSubtitle,
            disabled && styles.stepSubtitleDisabled
          ]}>
            {subtitle}
          </Text>
        </View>
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

interface InfoItemProps {
  icon: string;
  title: string;
  description: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, title, description }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <View style={styles.infoContent}>
      <Text size="sm" bold style={styles.infoItemTitle}>{title}</Text>
      <Text size="xs" style={styles.infoItemDescription}>{description}</Text>
    </View>
  </View>
);

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
    marginHorizontal: 2,
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
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    color: '#1f2937',
    marginBottom: 2,
  },
  stepTitleDisabled: {
    color: '#9ca3af',
  },
  stepSubtitle: {
    color: '#6b7280',
    lineHeight: 16,
  },
  stepSubtitleDisabled: {
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
  infoSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoTitle: {
    color: '#1f2937',
    marginBottom: 12,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoItemTitle: {
    color: '#374151',
    marginBottom: 2,
  },
  infoItemDescription: {
    color: '#6b7280',
    lineHeight: 16,
  },
});

export default SmartExplainabilityPanel;
