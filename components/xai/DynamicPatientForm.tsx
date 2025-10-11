import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { MODELS_CONFIG, FIELD_CONFIG, ModelConfig, FieldConfig } from '@/constants/modelsConfig';
import { validatePatientData } from '@/utils/validationUtils';

interface DynamicPatientFormProps {
  selectedModel: string | null;
  onSubmit: (formData: Record<string, any>, modelKey: string) => void;
  loading?: boolean;
  initialData?: Record<string, any>;
  className?: string;
}

const DynamicPatientForm: React.FC<DynamicPatientFormProps> = ({ 
  selectedModel,
  onSubmit, 
  loading = false, 
  initialData = {},
  className = '' 
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    id: Date.now(),
    ...initialData
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const modelConfig: ModelConfig | undefined = selectedModel ? MODELS_CONFIG[selectedModel] : undefined;
  const requiredFields = modelConfig?.features || [];

  // Reset form quando modelo muda
  useEffect(() => {
    const newFormData: Record<string, any> = { id: Date.now() };
    
    // Manter apenas campos válidos para o novo modelo
    requiredFields.forEach(field => {
      if (formData[field] !== undefined) {
        newFormData[field] = formData[field];
      } else {
        // Valores padrão baseados no tipo
        const fieldConfig = FIELD_CONFIG[field];
        if (fieldConfig.type === 'boolean') {
          newFormData[field] = false;
        } else if (fieldConfig.type === 'number') {
          newFormData[field] = '';
        } else {
          newFormData[field] = '';
        }
      }
    });

    setFormData(newFormData);
    setErrors({});
  }, [selectedModel]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = () => {
    if (!selectedModel) {
      alert('Por favor, selecione um modelo primeiro.');
      return;
    }

    const validationErrors = validatePatientData(formData, requiredFields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Enviar apenas campos necessários para o modelo (sem incluir 'id')
    const modelData: Record<string, any> = {};
    requiredFields.forEach(field => {
      modelData[field] = formData[field];
    });

    onSubmit(modelData, selectedModel);
  };

  if (!selectedModel) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>👆</Text>
          <Text size="lg" style={styles.placeholderText}>
            Selecione um modelo acima para começar
          </Text>
          <Text size="sm" style={styles.placeholderSubtext}>
            Cada modelo requer diferentes tipos de dados clínicos
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, className && { className }]}>
      <View style={styles.formHeader}>
        <View style={styles.modelBadge}>
          <Text style={styles.modelIcon}>{modelConfig!.icon}</Text>
          <View style={styles.modelInfo}>
            <Text size="lg" bold style={styles.formTitle}>
              Dados para Modelo {modelConfig!.name}
            </Text>
            <Text size="sm" style={styles.formDescription}>
              {modelConfig!.description}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.formGrid}>
        {requiredFields.map(field => {
          const fieldConfig: FieldConfig = FIELD_CONFIG[field];
          
          return (
            <FormField
              key={field}
              field={field}
              fieldConfig={fieldConfig}
              value={formData[field]}
              error={errors[field]}
              onChange={(value) => handleChange(field, value)}
            />
          );
        })}
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={loading}
          style={[
            styles.submitButton, 
            { backgroundColor: modelConfig!.color },
            loading && styles.submitButtonDisabled
          ]}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner size={20} color="white" />
              <Text style={styles.submitButtonText}>
                Analisando com {modelConfig!.name}...
              </Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.submitButtonIcon}>{modelConfig!.icon}</Text>
              <Text style={styles.submitButtonText}>
                Gerar Explicação - {modelConfig!.name}
              </Text>
              <Text style={styles.submitButtonArrow}>→</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.formFooter}>
        <View style={styles.modelSummary}>
          <Text size="sm" style={styles.summaryText}>
            <Text bold>Modelo selecionado:</Text> {modelConfig!.name}
          </Text>
          <Text size="sm" style={styles.summaryText}>
            <Text bold>RMSE:</Text> {modelConfig!.rmse}%
          </Text>
          <Text size="sm" style={styles.summaryText}>
            <Text bold>Variáveis:</Text> {requiredFields.length}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

interface FormFieldProps {
  field: string;
  fieldConfig: FieldConfig;
  value: any;
  error?: string;
  onChange: (value: any) => void;
}

const FormField: React.FC<FormFieldProps> = ({ 
  field, 
  fieldConfig, 
  value, 
  error, 
  onChange 
}) => {
  return (
    <View style={styles.formGroup}>
      <Text size="sm" bold style={styles.fieldLabel}>
        {fieldConfig.label}
        {fieldConfig.required && <Text style={styles.required}>*</Text>}
      </Text>

      {fieldConfig.type === 'boolean' ? (
        <View style={styles.booleanSelector}>
          <TouchableOpacity 
            style={[
              styles.booleanOption,
              value === true && styles.booleanOptionSelected
            ]}
            onPress={() => onChange(true)}
            activeOpacity={0.7}
          >
            <Text size="sm" style={[
              styles.booleanOptionText,
              value === true && styles.booleanOptionTextSelected
            ]}>
              ✓ Sim
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.booleanOption,
              value === false && styles.booleanOptionSelected
            ]}
            onPress={() => onChange(false)}
            activeOpacity={0.7}
          >
            <Text size="sm" style={[
              styles.booleanOptionText,
              value === false && styles.booleanOptionTextSelected
            ]}>
              ✗ Não
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Input style={[styles.input, error && styles.inputError]}>
          <InputField
            value={value?.toString() || ''}
            onChangeText={(text) => {
              if (fieldConfig.type === 'number') {
                const numValue = text === '' ? '' : Number(text);
                onChange(numValue);
              } else {
                onChange(text);
              }
            }}
            placeholder={fieldConfig.placeholder}
            keyboardType={fieldConfig.type === 'number' ? 'numeric' : 'default'}
          />
        </Input>
      )}

      {fieldConfig.helper && (
        <Text size="xs" style={styles.fieldHelper}>
          {fieldConfig.helper}
        </Text>
      )}

      {error && (
        <Text size="xs" style={styles.errorMessage}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderText: {
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: '#6b7280',
    textAlign: 'center',
  },
  formHeader: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modelIcon: {
    fontSize: 24,
  },
  modelInfo: {
    flex: 1,
  },
  formTitle: {
    color: '#1f2937',
    marginBottom: 4,
  },
  formDescription: {
    color: '#6b7280',
  },
  formGrid: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  fieldLabel: {
    color: '#374151',
  },
  required: {
    color: '#dc2626',
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    // Checkbox styles
  },
  checkboxText: {
    color: '#374151',
  },
  booleanSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
  },
  booleanOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  booleanOptionSelected: {
    backgroundColor: '#3b82f6',
  },
  booleanOptionText: {
    color: '#6b7280',
    fontWeight: '500',
    fontSize: 14,
  },
  booleanOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  fieldHelper: {
    color: '#6b7280',
  },
  errorMessage: {
    color: '#dc2626',
  },
  formActions: {
    marginTop: 32,
    marginBottom: 16,
  },
  submitButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  submitButtonIcon: {
    fontSize: 20,
    color: 'white',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  submitButtonArrow: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  formFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modelSummary: {
    gap: 8,
  },
  summaryText: {
    color: '#6b7280',
  },
});

export default DynamicPatientForm;
