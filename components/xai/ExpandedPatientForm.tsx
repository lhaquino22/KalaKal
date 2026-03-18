import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { colors } from '@/commons';
import dayjs from '@/lib/dayjs';
import {
  EXPANDED_FIELDS,
  SECTION_LABELS,
  ExpandedFieldConfig,
  getNextSuggestedVariable,
} from '@/constants/modelsConfig';

interface ExpandedPatientFormProps {
  onSubmit: (formData: Record<string, any>) => void;
  loading?: boolean;
  onFieldsChange?: (filledFields: Record<string, any>) => void;
  mode?: 'padrao' | 'assistido';
}

type FormValues = Record<string, any>;

const ExpandedPatientForm: React.FC<ExpandedPatientFormProps> = ({
  onSubmit,
  loading = false,
  onFieldsChange,
  mode = 'assistido',
}) => {
  const isAssisted = mode === 'assistido';
  const [formData, setFormData] = useState<FormValues>(() => {
    const initial: FormValues = {};
    for (const field of EXPANDED_FIELDS) {
      if (field.type === 'birthdate') {
        initial[field.key] = '';
      } else if (field.type === 'number') {
        initial[field.key] = '';
      } else {
        // Boolean fields: required start as null, optional as null (Ignorado)
        initial[field.key] = null;
      }
    }
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestedVar, setSuggestedVar] = useState<ExpandedFieldConfig | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionOpacity] = useState(new Animated.Value(0));

  // Calcular idade em meses
  const calculateAgeInMonths = useCallback((birthDate: string): number | null => {
    if (!birthDate || birthDate.length !== 10) return null;
    const [day, month, year] = birthDate.split('/').map(Number);
    if (!day || !month || !year) return null;
    const birth = dayjs(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
    if (!birth.isValid()) return null;
    const months = dayjs().diff(birth, 'month');
    return months >= 0 ? months : null;
  }, []);

  // Formatar data DD/MM/YYYY
  const formatDateInput = (text: string): string => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  // Atualizar sugestão quando campos mudam
  useEffect(() => {
    const next = getNextSuggestedVariable(formData);
    setSuggestedVar(next);
    onFieldsChange?.(formData);

    if (next && !loading) {
      setShowSuggestion(true);
      Animated.timing(suggestionOpacity, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        Animated.timing(suggestionOpacity, {
          toValue: 0, duration: 300, useNativeDriver: true,
        }).start(() => setShowSuggestion(false));
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowSuggestion(false);
      suggestionOpacity.setValue(0);
    }
  }, [formData, loading, onFieldsChange]);

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const requiredFields = EXPANDED_FIELDS.filter(f => f.required);

    for (const field of requiredFields) {
      const value = formData[field.key];
      if (field.type === 'birthdate') {
        const age = calculateAgeInMonths(value);
        if (!value || value.length !== 10) {
          newErrors[field.key] = 'Campo obrigatório (DD/MM/AAAA)';
        } else if (age === null) {
          newErrors[field.key] = 'Data inválida';
        } else if (age <= 0) {
          newErrors[field.key] = 'Data deve ser no passado';
        } else if (age > 1200) {
          newErrors[field.key] = 'Idade deve ser menor que 100 anos';
        }
      } else if (field.type === 'number') {
        if (!value && value !== 0) {
          newErrors[field.key] = 'Campo obrigatório';
        } else if (field.min !== undefined && Number(value) < field.min) {
          newErrors[field.key] = `Valor mínimo: ${field.min}`;
        } else if (field.max !== undefined && Number(value) > field.max) {
          newErrors[field.key] = `Valor máximo: ${field.max}`;
        }
      } else if (field.type === 'boolean') {
        if (value === null || value === undefined) {
          newErrors[field.key] = 'Selecione uma opção';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const submitData: Record<string, any> = {};
    for (const field of EXPANDED_FIELDS) {
      const value = formData[field.key];
      if (field.type === 'birthdate') {
        submitData.Idademeses = calculateAgeInMonths(value);
      } else if (field.type === 'number') {
        submitData[field.key] = value !== '' ? Number(value) : null;
      } else {
        // Boolean: true, false ou null (Ignorado)
        submitData[field.key] = value;
      }
    }
    onSubmit(submitData);
  };

  const isFormValid = (): boolean => {
    const requiredFields = EXPANDED_FIELDS.filter(f => f.required);
    for (const field of requiredFields) {
      const value = formData[field.key];
      if (field.type === 'birthdate') {
        const age = calculateAgeInMonths(value);
        if (!age || age <= 0) return false;
      } else if (field.type === 'number') {
        if (!value && value !== 0) return false;
      } else if (field.type === 'boolean') {
        if (value === null || value === undefined) return false;
      }
    }
    return true;
  };

  // Agrupar campos por seção
  const sections = ['obrigatorio', 'clinico', 'laboratorial', 'tratamento'] as const;

  const renderBooleanField = (field: ExpandedFieldConfig) => {
    const value = formData[field.key];
    const isIgnored = value === null;
    const showAiIcon = isAssisted && !field.required && isIgnored;

    return (
      <View key={field.key} style={styles.fieldItem}>
        <View style={styles.fieldLabelRow}>
          <Text size="sm" style={styles.fieldLabel}>
            {field.label} {field.required && <Text style={styles.required}>*</Text>}
          </Text>
          {showAiIcon && (
            <View style={styles.aiIconContainer}>
              <Text style={styles.aiIcon}>IA</Text>
            </View>
          )}
        </View>
        <Text size="xs" style={styles.fieldHelper}>{field.helper}</Text>
        <View style={[styles.toggleContainer, errors[field.key] ? styles.toggleContainerError : null]}>
          <TouchableOpacity
            style={[styles.toggleOption, value === true && styles.toggleOptionActive]}
            onPress={() => handleFieldChange(field.key, true)}
            activeOpacity={0.7}
          >
            <Text size="sm" style={[styles.toggleText, value === true && styles.toggleTextActive]}>
              Sim
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleOption, value === false && styles.toggleOptionActive]}
            onPress={() => handleFieldChange(field.key, false)}
            activeOpacity={0.7}
          >
            <Text size="sm" style={[styles.toggleText, value === false && styles.toggleTextActive]}>
              Não
            </Text>
          </TouchableOpacity>
          {!field.required && (
            <TouchableOpacity
              style={[styles.toggleOptionNeutral, value === null && styles.toggleOptionNeutralActive]}
              onPress={() => handleFieldChange(field.key, null)}
              activeOpacity={0.7}
            >
              <Text size="sm" style={[styles.toggleTextNeutral, value === null && styles.toggleTextNeutralActive]}>
                {isAssisted ? 'Ignorado' : 'Não informado'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {errors[field.key] && (
          <Text size="xs" style={styles.errorText}>{errors[field.key]}</Text>
        )}
      </View>
    );
  };

  const renderNumberField = (field: ExpandedFieldConfig) => (
    <View key={field.key} style={styles.fieldItem}>
      <View style={styles.fieldLabelRow}>
        <Text size="sm" style={styles.fieldLabel}>
          {field.label} {field.required && <Text style={styles.required}>*</Text>}
        </Text>
        {isAssisted && !field.required && (!formData[field.key] || formData[field.key] === '') && (
          <View style={styles.aiIconContainer}>
            <Text style={styles.aiIcon}>IA</Text>
          </View>
        )}
      </View>
      <Text size="xs" style={styles.fieldHelper}>{field.helper}</Text>
      <Input style={[styles.input, errors[field.key] ? styles.inputError : null]}>
        <InputField
          value={formData[field.key]?.toString() || ''}
          onChangeText={(text) => handleFieldChange(field.key, text === '' ? '' : Number(text))}
          placeholder={field.placeholder || ''}
          keyboardType="numeric"
        />
      </Input>
      {errors[field.key] && (
        <Text size="xs" style={styles.errorText}>{errors[field.key]}</Text>
      )}
    </View>
  );

  const renderBirthdateField = (field: ExpandedFieldConfig) => {
    const value = formData[field.key];
    const ageInMonths = calculateAgeInMonths(value);

    return (
      <View key={field.key} style={styles.fieldItem}>
        <Text size="sm" style={styles.fieldLabel}>
          {field.label} <Text style={styles.required}>*</Text>
        </Text>
        <Input style={[styles.input, errors[field.key] ? styles.inputError : null]}>
          <InputField
            value={value}
            onChangeText={(text) => handleFieldChange(field.key, formatDateInput(text))}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            maxLength={10}
          />
        </Input>
        {errors[field.key] && (
          <Text size="xs" style={styles.errorText}>{errors[field.key]}</Text>
        )}
        {value?.length === 10 && ageInMonths !== null && (
          <Text size="xs" style={styles.fieldHelperSuccess}>
            Idade: {ageInMonths} meses ({Math.floor(ageInMonths / 12)} anos e {ageInMonths % 12} meses)
          </Text>
        )}
      </View>
    );
  };

  const renderField = (field: ExpandedFieldConfig) => {
    switch (field.type) {
      case 'birthdate': return renderBirthdateField(field);
      case 'number': return renderNumberField(field);
      case 'boolean': return renderBooleanField(field);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContent}>
        <View style={styles.header}>
          <Text size="sm" style={styles.subtitle}>
            {isAssisted
              ? 'Campos com IA serão estimados automaticamente'
              : 'Preencha os dados disponíveis para a análise'}
          </Text>
        </View>

        {/* Sugestão de próxima variável */}
        {showSuggestion && suggestedVar && (
          <Animated.View style={[styles.suggestionBanner, { opacity: suggestionOpacity }]}>
            <Text size="xs" style={styles.suggestionText}>
              Preencher <Text bold>"{suggestedVar.label}"</Text> melhoraria a acurácia do modelo
            </Text>
          </Animated.View>
        )}

        {/* Campos agrupados por seção */}
        {sections.map(section => {
          const sectionFields = EXPANDED_FIELDS.filter(f => f.section === section);
          if (sectionFields.length === 0) return null;

          return (
            <View key={section} style={styles.sectionContainer}>
              <Text size="md" bold style={styles.sectionTitle}>
                {SECTION_LABELS[section]}
              </Text>
              <View style={styles.fieldsList}>
                {sectionFields.map(renderField)}
              </View>
            </View>
          );
        })}

        {/* Botão de submissão */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || !isFormValid()}
          style={[styles.submitButton, (!isFormValid() || loading) && styles.submitButtonDisabled]}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner size={20} color="white" />
              <Text style={styles.submitButtonText}>Analisando...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Analisar com IA</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  formContent: { padding: 20 },
  header: { marginBottom: 24, alignItems: 'center' },
  title: { color: colors.mainColor, marginBottom: 8 },
  subtitle: { color: colors.defaultTextColor, textAlign: 'center', opacity: 0.7 },
  suggestionBanner: {
    backgroundColor: '#EEF2FF',
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  suggestionText: { color: '#4338CA', fontSize: 12 },
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { color: '#374151', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  fieldsList: { gap: 16 },
  fieldItem: { gap: 6 },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldLabel: { color: colors.defaultTextColor, fontWeight: '600' },
  fieldHelper: { color: '#6b7280', fontSize: 11, fontStyle: 'italic' },
  fieldHelperSuccess: { color: '#16a34a', fontSize: 12, fontWeight: '500' },
  required: { color: colors.mainColor },
  aiIconContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiIcon: { color: '#6366F1', fontSize: 10, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, backgroundColor: 'white' },
  inputError: { borderColor: colors.mainColor },
  errorText: { color: colors.mainColor },
  toggleContainer: {
    flexDirection: 'row', borderRadius: 8, borderWidth: 1,
    borderColor: '#e0e0e0', overflow: 'hidden', backgroundColor: 'white',
  },
  toggleContainerError: { borderColor: colors.mainColor },
  toggleOption: {
    flex: 1, paddingVertical: 12, paddingHorizontal: 16,
    alignItems: 'center', backgroundColor: 'white',
  },
  toggleOptionActive: { backgroundColor: colors.mainColor },
  toggleOptionNeutral: {
    flex: 1, paddingVertical: 12, paddingHorizontal: 16,
    alignItems: 'center', backgroundColor: 'white',
    borderLeftWidth: 1, borderLeftColor: '#e0e0e0',
  },
  toggleOptionNeutralActive: { backgroundColor: '#f3f4f6', borderLeftColor: '#d1d5db' },
  toggleText: { color: colors.defaultTextColor, fontWeight: '500' },
  toggleTextActive: { color: 'white', fontWeight: '600' },
  toggleTextNeutral: { color: '#6b7280', fontWeight: '500' },
  toggleTextNeutralActive: { color: '#374151', fontWeight: '600' },
  submitButton: {
    backgroundColor: '#6366F1', paddingVertical: 16, borderRadius: 8,
    alignItems: 'center', marginTop: 32,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  submitButtonDisabled: { backgroundColor: colors.disabledColor, opacity: 0.7 },
  submitButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});

export default ExpandedPatientForm;
