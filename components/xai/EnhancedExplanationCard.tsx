import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { MODELS_CONFIG, ModelConfig } from '@/constants/modelsConfig';
import { XaiResultadoResponse } from '@/services/types';
import { getFieldDisplayValue } from '@/utils/validationUtils';

interface EnhancedExplanationCardProps {
  explanation: (XaiResultadoResponse & { model_used: string; model_config: any }) | null;
  patientData: Record<string, any> | null;
  selectedModel: string | null;
  loading?: boolean;
  error?: { message: string; model?: string; data?: any } | null;
  className?: string;
}

const EnhancedExplanationCard: React.FC<EnhancedExplanationCardProps> = ({ 
  explanation, 
  patientData, 
  selectedModel,
  loading = false,
  error = null,
  className = '' 
}) => {
  const modelConfig: ModelConfig | undefined = selectedModel ? MODELS_CONFIG[selectedModel] : undefined;

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, className && { className }]}>
        <LoadingState modelConfig={modelConfig} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, className && { className }]}>
        <ErrorState error={error} modelConfig={modelConfig} />
      </View>
    );
  }

  if (!explanation || !selectedModel) {
    return (
      <View style={[styles.container, styles.emptyContainer, className && { className }]}>
        <EmptyState />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, className && { className }]}>
      <View style={[styles.explanationCard, { borderLeftColor: modelConfig!.color }]}>
        <ExplanationHeader 
          modelConfig={modelConfig!} 
          explanation={explanation} 
        />
        
        <ExplanationContent 
          explanation={explanation}
          patientData={patientData}
          modelConfig={modelConfig!}
        />
      </View>
    </ScrollView>
  );
};

const LoadingState: React.FC<{ modelConfig?: ModelConfig }> = ({ modelConfig }) => (
  <View style={styles.loadingContent}>
    <View style={styles.loadingHeader}>
      {modelConfig && (
        <>
          <Text style={styles.loadingIcon}>{modelConfig.icon}</Text>
          <Text size="lg" bold style={styles.loadingTitle}>
            Processando com {modelConfig.name}
          </Text>
        </>
      )}
    </View>
    
    <View style={styles.loadingSteps}>
      <LoadingStep text="✓ Dados validados" completed />
      <LoadingStep text={`✓ Modelo ${modelConfig?.name || ''} selecionado`} completed />
      <LoadingStep text="🔄 Calculando SHAP..." active />
      <LoadingStep text="⏳ Gerando gráfico" pending />
    </View>
    
    <View style={styles.loadingAnimation}>
      <Text style={styles.brainAnimation}>🧠</Text>
      <Text size="sm" style={styles.loadingText}>
        Isso pode levar até 60 segundos...
      </Text>
    </View>
  </View>
);

const LoadingStep: React.FC<{ text: string; completed?: boolean; active?: boolean; pending?: boolean }> = ({ 
  text, 
  completed, 
  active, 
  pending 
}) => (
  <View style={[
    styles.step,
    completed && styles.stepCompleted,
    active && styles.stepActive,
    pending && styles.stepPending
  ]}>
    <Text size="sm" style={styles.stepText}>{text}</Text>
  </View>
);

const ErrorState: React.FC<{ 
  error: { message: string; model?: string; data?: any };
  modelConfig?: ModelConfig;
}> = ({ error, modelConfig }) => (
  <View style={styles.errorContent}>
    <Text size="lg" bold style={styles.errorTitle}>❌ Erro na Análise</Text>
    <Text size="sm" style={styles.errorMessage}>{error.message}</Text>
    
    {error.model && modelConfig && (
      <View style={styles.errorContext}>
        <Text size="sm" style={styles.errorContextText}>
          <Text bold>Modelo tentado:</Text> {modelConfig.name}
        </Text>
        <Text size="sm" style={styles.errorContextText}>
          <Text bold>Features necessárias:</Text> {modelConfig.features.join(', ')}
        </Text>
      </View>
    )}
  </View>
);

const EmptyState: React.FC = () => (
  <View style={styles.emptyContent}>
    <Text style={styles.emptyIcon}>📊</Text>
    <Text size="lg" bold style={styles.emptyTitle}>Pronto para Análise</Text>
    <Text size="sm" style={styles.emptyText}>
      Selecione um modelo e preencha os dados para gerar uma explicação
    </Text>
  </View>
);

const ExplanationHeader: React.FC<{ 
  modelConfig: ModelConfig; 
  explanation: XaiResultadoResponse & { model_used: string; model_config: any };
}> = ({ modelConfig, explanation }) => (
  <View style={styles.explanationHeader}>
    <View style={styles.modelBadge}>
      <Text style={styles.modelIcon}>{modelConfig.icon}</Text>
      <View style={styles.modelInfo}>
        <Text size="lg" bold style={styles.explanationTitle}>
          Explicação - {modelConfig.name}
        </Text>
        <Text size="sm" style={styles.modelDescription}>
          {modelConfig.description}
        </Text>
      </View>
      {modelConfig.recommended && (
        <View style={styles.recommendedBadge}>
          <Text size="xs" style={styles.recommendedText}>Recomendado</Text>
        </View>
      )}
    </View>
    
    <PredictionValue 
      value={explanation.valor_predito}
      error={explanation.erro_modelo}
    />
  </View>
);

const PredictionValue: React.FC<{ value: number; error: number }> = ({ value, error }) => (
  <View style={styles.predictionContainer}>
    <View style={styles.predictionCard}>
      <Text size="xs" style={styles.predictionLabel}>Valor Predito</Text>
      <Text size="xl" bold style={styles.predictionValue}>
        {value.toFixed(2)}
      </Text>
    </View>
    <View style={styles.predictionCard}>
      <Text size="xs" style={styles.predictionLabel}>Erro do Modelo</Text>
      <Text size="lg" bold style={styles.errorValue}>
        {error.toFixed(1)}%
      </Text>
    </View>
  </View>
);

const ExplanationContent: React.FC<{ 
  explanation: XaiResultadoResponse & { model_used: string; model_config: any };
  patientData: Record<string, any> | null;
  modelConfig: ModelConfig;
}> = ({ explanation, patientData, modelConfig }) => (
  <View style={styles.explanationContent}>
    <ShapSection explanation={explanation} />
    <VariablesSection explanation={explanation} patientData={patientData} />
    <ModelPerformanceSection modelConfig={modelConfig} explanation={explanation} />
  </View>
);

const ShapSection: React.FC<{ explanation: XaiResultadoResponse }> = ({ explanation }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>📈</Text>
      <Text size="md" bold style={styles.sectionTitle}>
        Importância das Variáveis (SHAP)
      </Text>
    </View>
    
    {explanation.imagem_base64 && (
      <View style={styles.chartContainer}>
        <Image
          source={{ uri: explanation.imagem_base64 }}
          style={styles.chartImage}
          resizeMode="contain"
        />
      </View>
    )}
  </View>
);

const VariablesSection: React.FC<{ 
  explanation: XaiResultadoResponse; 
  patientData: Record<string, any> | null;
}> = ({ explanation, patientData }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>📋</Text>
      <Text size="md" bold style={styles.sectionTitle}>
        Variáveis Utilizadas
      </Text>
    </View>
    
    <View style={styles.variablesList}>
      {explanation.variaveis.map((variavel, index) => (
        <View key={index} style={styles.variableItem}>
          <Text size="sm" bold style={styles.variableName}>{variavel}</Text>
          {patientData && patientData[variavel] !== undefined && (
            <Text size="sm" style={styles.variableValue}>
              {getFieldDisplayValue(variavel, patientData[variavel])}
            </Text>
          )}
        </View>
      ))}
    </View>
  </View>
);

const ModelPerformanceSection: React.FC<{ 
  modelConfig: ModelConfig; 
  explanation: XaiResultadoResponse;
}> = ({ modelConfig, explanation }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>🎯</Text>
      <Text size="md" bold style={styles.sectionTitle}>
        Performance do Modelo
      </Text>
    </View>
    
    <View style={styles.performanceStats}>
      <View style={styles.performanceStat}>
        <Text size="xs" style={styles.performanceLabel}>RMSE:</Text>
        <Text size="sm" bold style={[styles.performanceValue, { color: modelConfig.color }]}>
          {modelConfig.rmse}%
        </Text>
      </View>
      <View style={styles.performanceStat}>
        <Text size="xs" style={styles.performanceLabel}>Variáveis:</Text>
        <Text size="sm" bold style={[styles.performanceValue, { color: modelConfig.color }]}>
          {explanation.variaveis.length}
        </Text>
      </View>
      <View style={styles.performanceStat}>
        <Text size="xs" style={styles.performanceLabel}>Predição:</Text>
        <Text size="sm" bold style={[styles.performanceValue, { color: modelConfig.color }]}>
          {explanation.valor_predito.toFixed(2)}
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  emptyContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  explanationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingHeader: {
    alignItems: 'center',
    gap: 8,
  },
  loadingIcon: {
    fontSize: 32,
  },
  loadingTitle: {
    color: '#1f2937',
  },
  loadingSteps: {
    gap: 8,
    width: '100%',
  },
  step: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  stepCompleted: {
    backgroundColor: '#dcfce7',
  },
  stepActive: {
    backgroundColor: '#dbeafe',
  },
  stepPending: {
    backgroundColor: '#f3f4f6',
  },
  stepText: {
    color: '#374151',
  },
  loadingAnimation: {
    alignItems: 'center',
    gap: 8,
  },
  brainAnimation: {
    fontSize: 48,
  },
  loadingText: {
    color: '#6b7280',
  },
  errorContent: {
    gap: 12,
  },
  errorTitle: {
    color: '#dc2626',
  },
  errorMessage: {
    color: '#7f1d1d',
  },
  errorContext: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 6,
    gap: 4,
  },
  errorContextText: {
    color: '#7f1d1d',
  },
  emptyContent: {
    alignItems: 'center',
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    color: '#1f2937',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  explanationHeader: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modelIcon: {
    fontSize: 24,
  },
  modelInfo: {
    flex: 1,
  },
  explanationTitle: {
    color: '#1f2937',
    marginBottom: 4,
  },
  modelDescription: {
    color: '#6b7280',
  },
  recommendedBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recommendedText: {
    color: 'white',
    fontWeight: '600',
  },
  predictionContainer: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  predictionCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  predictionLabel: {
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  predictionValue: {
    color: '#0f172a',
  },
  errorValue: {
    color: '#dc2626',
  },
  explanationContent: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    color: '#1f2937',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
  },
  chartImage: {
    width: '100%',
    height: 250,
  },
  variablesList: {
    gap: 8,
  },
  variableItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 6,
  },
  variableName: {
    color: '#374151',
  },
  variableValue: {
    color: '#6b7280',
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceStat: {
    alignItems: 'center',
    gap: 4,
  },
  performanceLabel: {
    color: '#6b7280',
    fontWeight: '500',
  },
  performanceValue: {
    fontWeight: '600',
  },
});

export default EnhancedExplanationCard;
