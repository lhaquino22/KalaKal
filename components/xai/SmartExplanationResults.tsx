import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { XaiResultadoResponse } from '@/services/types';
import { getFieldDisplayValue } from '@/utils/validationUtils';

interface SmartExplanationResultsProps {
  result: (XaiResultadoResponse & { model_used: string; model_config: any }) | null;
  patientData: Record<string, any> | null;
  loading?: boolean;
  className?: string;
}

const SmartExplanationResults: React.FC<SmartExplanationResultsProps> = ({ 
  result, 
  patientData, 
  loading = false,
  className = '' 
}) => {
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, className && { className }]}>
        <LoadingState />
      </View>
    );
  }

  if (!result) {
    return (
      <View style={[styles.container, styles.emptyContainer, className && { className }]}>
        <EmptyState />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, className && { className }]}>
      <View style={styles.resultsCard}>
        <ResultsHeader result={result} />
        <PredictionSection result={result} />
        <ExplanationSection result={result} />
        <VariablesSection result={result} patientData={patientData} />
        <MetadataSection result={result} />
      </View>
    </ScrollView>
  );
};

const LoadingState: React.FC = () => (
  <View style={styles.loadingContent}>
    <View style={styles.loadingAnimation}>
      <Text style={styles.brainAnimation}>🧠</Text>
      <Text size="lg" bold style={styles.loadingTitle}>
        Processando Análise Inteligente
      </Text>
    </View>
    
    <View style={styles.loadingSteps}>
      <LoadingStep text="✓ Dados validados" completed />
      <LoadingStep text="🔄 Detectando melhor modelo..." active />
      <LoadingStep text="⏳ Calculando SHAP..." pending />
      <LoadingStep text="📊 Gerando explicação..." pending />
    </View>
    
    <Text size="sm" style={styles.loadingText}>
      A API está analisando seus dados e selecionando o modelo mais adequado...
    </Text>
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

const EmptyState: React.FC = () => (
  <View style={styles.emptyContent}>
    <Text style={styles.emptyIcon}>🎯</Text>
    <Text size="lg" bold style={styles.emptyTitle}>Pronto para Análise</Text>
    <Text size="sm" style={styles.emptyText}>
      Preencha os dados acima e a API detectará automaticamente o melhor modelo para sua análise
    </Text>
  </View>
);

const ResultsHeader: React.FC<{ result: XaiResultadoResponse & { model_used: string } }> = ({ result }) => (
  <View style={styles.resultsHeader}>
    <Text size="xl" bold style={styles.resultsTitle}>
      🎯 Análise Completa
    </Text>
    <Text size="sm" style={styles.resultsSubtitle}>
      Modelo detectado automaticamente pela API
    </Text>
    {result.abordagem && (
      <View style={styles.approachBadge}>
        <Text size="xs" style={styles.approachText}>
          Abordagem: {result.abordagem}
        </Text>
      </View>
    )}
  </View>
);

const PredictionSection: React.FC<{ result: XaiResultadoResponse }> = ({ result }) => (
  <View style={styles.section}>
    <Text size="md" bold style={styles.sectionTitle}>
      📊 Resultado da Predição
    </Text>
    
    <View style={styles.predictionContainer}>
      <View style={styles.predictionCard}>
        <Text size="xs" style={styles.predictionLabel}>Valor Predito</Text>
        <Text size="2xl" bold style={styles.predictionValue}>
          {result.valor_predito.toFixed(2)}
        </Text>
      </View>
      <View style={styles.predictionCard}>
        <Text size="xs" style={styles.predictionLabel}>Margem de Erro</Text>
        <Text size="lg" bold style={styles.errorValue}>
          ±{result.erro_modelo.toFixed(1)}%
        </Text>
      </View>
    </View>
  </View>
);

const ExplanationSection: React.FC<{ result: XaiResultadoResponse }> = ({ result }) => (
  <View style={styles.section}>
    <Text size="md" bold style={styles.sectionTitle}>
      📈 Explicação SHAP
    </Text>
    <Text size="xs" style={styles.sectionSubtitle}>
      Gráfico mostrando a importância de cada variável na predição
    </Text>
    
    {result.imagem_base64 ? (
      <View style={styles.chartContainer}>
        <Image
          source={{ uri: result.imagem_base64 }}
          style={styles.chartImage}
          resizeMode="contain"
        />
        <Text size="xs" style={styles.chartDescription}>
          🟢 Valores que diminuem o risco | 🔴 Valores que aumentam o risco
        </Text>
      </View>
    ) : (
      <View style={styles.noChartContainer}>
        <Text style={styles.noChartIcon}>📊</Text>
        <Text size="sm" style={styles.noChartText}>
          Gráfico de explicação não disponível
        </Text>
      </View>
    )}
  </View>
);

const VariablesSection: React.FC<{ 
  result: XaiResultadoResponse; 
  patientData: Record<string, any> | null;
}> = ({ result, patientData }) => (
  <View style={styles.section}>
    <Text size="md" bold style={styles.sectionTitle}>
      📋 Variáveis Analisadas
    </Text>
    <Text size="xs" style={styles.sectionSubtitle}>
      Dados utilizados pelo modelo para gerar a predição
    </Text>
    
    <View style={styles.variablesList}>
      {result.variaveis.map((variavel, index) => (
        <View key={index} style={styles.variableItem}>
          <View style={styles.variableHeader}>
            <Text size="sm" bold style={styles.variableName}>{variavel}</Text>
            {patientData && patientData[variavel] !== undefined && (
              <Text size="sm" style={styles.variableValue}>
                {getFieldDisplayValue(variavel, patientData[variavel])}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  </View>
);

const MetadataSection: React.FC<{ result: XaiResultadoResponse }> = ({ result }) => (
  <View style={styles.section}>
    <Text size="md" bold style={styles.sectionTitle}>
      ℹ️ Informações do Processamento
    </Text>
    
    <View style={styles.metadataGrid}>
      <View style={styles.metadataItem}>
        <Text size="xs" style={styles.metadataLabel}>Variáveis Utilizadas</Text>
        <Text size="sm" bold style={styles.metadataValue}>
          {result.variaveis.length}
        </Text>
      </View>
      
      {result.total_features && (
        <View style={styles.metadataItem}>
          <Text size="xs" style={styles.metadataLabel}>Total de Features</Text>
          <Text size="sm" bold style={styles.metadataValue}>
            {result.total_features}
          </Text>
        </View>
      )}
      
      {result.abordagem && (
        <View style={styles.metadataItem}>
          <Text size="xs" style={styles.metadataLabel}>Abordagem</Text>
          <Text size="sm" bold style={styles.metadataValue}>
            {result.abordagem}
          </Text>
        </View>
      )}
      
      <View style={styles.metadataItem}>
        <Text size="xs" style={styles.metadataLabel}>Modelo</Text>
        <Text size="sm" bold style={styles.metadataValue}>
          Auto-detectado
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
    margin: 16,
  },
  emptyContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    margin: 16,
  },
  resultsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
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
  loadingAnimation: {
    alignItems: 'center',
    gap: 8,
  },
  brainAnimation: {
    fontSize: 48,
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
  loadingText: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
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
    lineHeight: 18,
  },
  resultsHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  resultsTitle: {
    color: '#1f2937',
    marginBottom: 4,
  },
  resultsSubtitle: {
    color: '#6b7280',
    marginBottom: 8,
  },
  approachBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approachText: {
    color: '#1d4ed8',
    fontWeight: '500',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 16,
  },
  predictionContainer: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  predictionCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  predictionLabel: {
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 8,
  },
  predictionValue: {
    color: '#0f172a',
  },
  errorValue: {
    color: '#dc2626',
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
    marginBottom: 8,
  },
  chartDescription: {
    color: '#64748b',
    textAlign: 'center',
  },
  noChartContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  noChartIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  noChartText: {
    color: '#6b7280',
  },
  variablesList: {
    gap: 8,
  },
  variableItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  variableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variableName: {
    color: '#374151',
  },
  variableValue: {
    color: '#6b7280',
    fontWeight: '500',
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metadataItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: '45%',
  },
  metadataLabel: {
    color: '#6b7280',
    marginBottom: 4,
  },
  metadataValue: {
    color: '#1f2937',
  },
});

export default SmartExplanationResults;
