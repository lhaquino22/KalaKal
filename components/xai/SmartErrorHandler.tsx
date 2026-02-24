import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';

interface SmartErrorHandlerProps {
  error: { message: string; data?: any } | null;
  onRetry: () => void;
  onClear: () => void;
}

interface ModelSuggestion {
  model: string;
  fields: string[];
  description: string;
}

const SmartErrorHandler: React.FC<SmartErrorHandlerProps> = ({ 
  error, 
  onRetry, 
  onClear 
}) => {
  if (!error) return null;

  // Analisar o erro para fornecer sugestões inteligentes
  const getModelSuggestions = (): ModelSuggestion[] => {
    const suggestions: ModelSuggestion[] = [
      {
        model: 'Clínicas',
        fields: ['Idademeses', 'edema', 'peso'],
        description: 'Modelo básico - funciona apenas com dados essenciais'
      },
      {
        model: 'AIDS',
        fields: ['Idademeses', 'edema', 'peso', 'aids'],
        description: 'Adicione informação sobre AIDS para análise especializada'
      },
      {
        model: 'Plaque',
        fields: ['Idademeses', 'edema', 'peso', 'plaque'],
        description: 'Adicione valor de plaque para análise especializada'
      },
      {
        model: 'Completa',
        fields: ['Idademeses', 'edema', 'peso', 'aids', 'plaque'],
        description: 'Modelo mais abrangente - adicione AIDS e plaque'
      }
    ];

    return suggestions;
  };

  const getErrorType = (): 'validation' | 'network' | 'server' | 'unknown' => {
    const message = error.message.toLowerCase();
    
    if (message.includes('obrigatório') || message.includes('deve ser') || message.includes('inválido')) {
      return 'validation';
    } else if (message.includes('conexão') || message.includes('timeout') || message.includes('network')) {
      return 'network';
    } else if (message.includes('500') || message.includes('servidor') || message.includes('server')) {
      return 'server';
    } else {
      return 'unknown';
    }
  };

  const getErrorIcon = (type: string): string => {
    switch (type) {
      case 'validation': return '⚠️';
      case 'network': return '🌐';
      case 'server': return '🔧';
      default: return '❌';
    }
  };

  const getErrorTitle = (type: string): string => {
    switch (type) {
      case 'validation': return 'Dados Inválidos';
      case 'network': return 'Problema de Conexão';
      case 'server': return 'Erro do Servidor';
      default: return 'Erro Inesperado';
    }
  };

  const errorType = getErrorType();
  const suggestions = getModelSuggestions();

  return (
    <View style={styles.container}>
      <View style={styles.errorHeader}>
        <Text style={styles.errorIcon}>{getErrorIcon(errorType)}</Text>
        <View style={styles.errorInfo}>
          <Text size="md" bold style={styles.errorTitle}>
            {getErrorTitle(errorType)}
          </Text>
          <Text size="sm" style={styles.errorMessage}>
            {error.message}
          </Text>
        </View>
      </View>

      {errorType === 'validation' && (
        <View style={styles.suggestionsSection}>
          <Text size="sm" bold style={styles.suggestionsTitle}>
            Sugestões
          </Text>
          <Text size="xs" style={styles.suggestionsSubtitle}>
            Modelos disponíveis baseados nos seus dados:
          </Text>

          <View style={styles.suggestionsList}>
            {suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <View style={styles.suggestionHeader}>
                  <Text size="sm" bold style={styles.suggestionModel}>
                    {suggestion.model}
                  </Text>
                </View>
                <Text size="xs" style={styles.suggestionDescription}>
                  {suggestion.description}
                </Text>
                <View style={styles.suggestionFields}>
                  <Text size="xs" style={styles.fieldsLabel}>Campos necessários:</Text>
                  <Text size="xs" style={styles.fieldsText}>
                    {suggestion.fields.join(', ')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {errorType === 'network' && (
        <View style={styles.networkHelp}>
          <Text size="sm" bold style={styles.helpTitle}>
            Possíveis soluções:
          </Text>
          <View style={styles.helpList}>
            <Text size="xs" style={styles.helpItem}>• Verifique sua conexão com a internet</Text>
            <Text size="xs" style={styles.helpItem}>• Tente novamente em alguns segundos</Text>
            <Text size="xs" style={styles.helpItem}>• Verifique se o servidor está funcionando</Text>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.clearButton}
          onPress={onClear}
          activeOpacity={0.7}
        >
          <Text style={styles.clearButtonText}>✕ Limpar</Text>
        </TouchableOpacity>
      </View>

      {error.data && (
        <View style={styles.debugSection}>
          <Text size="xs" style={styles.debugTitle}>
            Dados enviados:
          </Text>
          <Text size="xs" style={styles.debugData}>
            {Object.entries(error.data).map(([key, value]) => 
              `${key}: ${value}`
            ).join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    margin: 16,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 24,
  },
  errorInfo: {
    flex: 1,
  },
  errorTitle: {
    color: '#dc2626',
    marginBottom: 4,
  },
  errorMessage: {
    color: '#7f1d1d',
    lineHeight: 18,
  },
  suggestionsSection: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    color: '#1f2937',
    marginBottom: 4,
  },
  suggestionsSubtitle: {
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 16,
  },
  suggestionsList: {
    gap: 12,
  },
  suggestionItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  suggestionHeader: {
    marginBottom: 4,
  },
  suggestionModel: {
    color: '#1f2937',
  },
  suggestionDescription: {
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 14,
  },
  suggestionFields: {
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 4,
  },
  fieldsLabel: {
    color: '#4b5563',
    fontWeight: '500',
    marginBottom: 2,
  },
  fieldsText: {
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  networkHelp: {
    marginBottom: 16,
  },
  helpTitle: {
    color: '#1f2937',
    marginBottom: 8,
  },
  helpList: {
    gap: 4,
  },
  helpItem: {
    color: '#6b7280',
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  debugSection: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  debugTitle: {
    color: '#4b5563',
    fontWeight: '500',
    marginBottom: 4,
  },
  debugData: {
    color: '#6b7280',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
});

export default SmartErrorHandler;
