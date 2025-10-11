import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { MODELS_CONFIG, ModelConfig } from '@/constants/modelsConfig';

interface ModelSelectorProps {
  selectedModel: string | null;
  onModelChange: (modelKey: string) => void;
  className?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  onModelChange, 
  className = '' 
}) => {
  return (
    <View style={[styles.container]}>
      <View style={styles.header}>
        <Text size="lg" bold style={styles.title}>
          Escolha o Modelo de Análise
        </Text>
        <Text size="sm" style={styles.subtitle}>
          Cada modelo é especializado em diferentes aspectos clínicos
        </Text>
      </View>
      
      <View style={styles.modelsGrid}>
        {Object.entries(MODELS_CONFIG).map(([key, config]) => (
          <ModelCard
            key={key}
            modelKey={key}
            config={config}
            isSelected={selectedModel === key}
            onPress={() => onModelChange(key)}
          />
        ))}
      </View>
    </View>
  );
};

interface ModelCardProps {
  modelKey: string;
  config: ModelConfig;
  isSelected: boolean;
  onPress: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ 
  modelKey, 
  config, 
  isSelected, 
  onPress 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.modelCard,
        isSelected && styles.modelCardSelected,
        { borderColor: config.color }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.modelHeader}>
        <Text style={styles.modelIcon}>{config.icon}</Text>
        <View style={styles.modelInfo}>
          <Text size="md" bold style={styles.modelName}>
            {config.name}
          </Text>
          {config.recommended && (
            <View style={styles.recommendedBadge}>
              <Text size="xs" style={styles.recommendedText}>
                Recomendado
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <Text size="sm" style={styles.modelDescription}>
        {config.description}
      </Text>
      
      <View style={styles.modelStats}>
        <View style={styles.stat}>
          <Text size="xs" style={styles.statLabel}>RMSE:</Text>
          <Text size="sm" bold style={[styles.statValue, { color: config.color }]}>
            {config.rmse}%
          </Text>
        </View>
        <View style={styles.stat}>
          <Text size="xs" style={styles.statLabel}>Variáveis:</Text>
          <Text size="sm" bold style={[styles.statValue, { color: config.color }]}>
            {config.features.length}
          </Text>
        </View>
      </View>

      <View style={styles.modelFeatures}>
        <Text size="xs" style={styles.featuresText}>
          Features: {config.features.join(', ')}
        </Text>
      </View>
      
      {isSelected && (
        <View style={[styles.selectedIndicator, { backgroundColor: config.color }]}>
          <Text size="xs" style={styles.selectedText}>✓ Selecionado</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 6, // Manter um padding mínimo
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  modelsGrid: {
    flexDirection: 'column', // Mudar para coluna (vertical)
    gap: 12, // Espaçamento entre os cards
    paddingHorizontal: 0,
  },
  modelCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%', // Ocupar toda a largura disponível
    borderWidth: 2,
    borderColor: '#e5e7eb',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  modelCardSelected: {
    borderWidth: 3,
    elevation: 6,
    shadowOpacity: 0.2,
    transform: [{ scale: 1.02 }],
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  modelIcon: {
    fontSize: 32,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    color: '#1f2937',
    marginBottom: 4,
  },
  recommendedBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  recommendedText: {
    color: 'white',
    fontWeight: '600',
  },
  modelDescription: {
    color: '#4b5563',
    marginBottom: 16,
    lineHeight: 20,
  },
  modelStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontWeight: '600',
  },
  modelFeatures: {
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  featuresText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -1,
    right: -1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 8,
  },
  selectedText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ModelSelector;
