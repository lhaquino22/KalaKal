import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import dayjs from '@/lib/dayjs';

interface ExplicabilityFormData {
  // Campos básicos sempre presentes
  dataNascimento: string;
  edema: boolean;
  peso: number | '';
  
  // Campos opcionais
  aids?: boolean;
  plaque?: number | '';
}

interface OptionalFields {
  aids: boolean;
  plaque: boolean;
}

interface SmartExplicabilityFormProps {
  onSubmit: (formData: Record<string, any>) => void;
  loading?: boolean;
  className?: string;
}

const SmartExplicabilityForm: React.FC<SmartExplicabilityFormProps> = ({ 
  onSubmit, 
  loading = false, 
  className = '' 
}) => {
  const [formData, setFormData] = useState<ExplicabilityFormData>({
    dataNascimento: '',
    edema: false,
    peso: ''
  });

  // Função para formatar data no formato DD/MM/YYYY enquanto o usuário digita
  const formatDateInput = (text: string): string => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');
    
    // Aplica a máscara DD/MM/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  // Função para calcular idade em meses a partir da data de nascimento
  const calculateAgeInMonths = (birthDate: string): number | null => {
    if (!birthDate || birthDate.length !== 10) return null;
    
    const [day, month, year] = birthDate.split('/').map(Number);
    if (!day || !month || !year) return null;
    
    const birth = dayjs(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
    if (!birth.isValid()) return null;
    
    const today = dayjs();
    const months = today.diff(birth, 'month');
    
    return months >= 0 ? months : null;
  };

  const [optionalFields, setOptionalFields] = useState<OptionalFields>({
    aids: false,
    plaque: false
  });

  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getCurrentFields = (): string[] => {
    const fields = ['dataNascimento', 'edema', 'peso'];
    
    if (optionalFields.aids) fields.push('aids');
    if (optionalFields.plaque) fields.push('plaque');
    
    return fields;
  };

  const getPredictedModel = (): { model: string; confidence: string; description: string } => {
    const currentFields = getCurrentFields();
    const fieldSet = new Set(currentFields);
    
    if (fieldSet.has('aids') && fieldSet.has('plaque')) {
      return { 
        model: 'Completa', 
        confidence: 'Alta', 
        description: 'Modelo mais abrangente com todas as variáveis' 
      };
    } else if (fieldSet.has('aids')) {
      return { 
        model: 'AIDS', 
        confidence: 'Alta', 
        description: 'Modelo especializado em predições relacionadas a AIDS' 
      };
    } else if (fieldSet.has('plaque')) {
      return { 
        model: 'Plaque', 
        confidence: 'Alta', 
        description: 'Modelo especializado em análise de plaque' 
      };
    } else {
      return { 
        model: 'Clínicas', 
        confidence: 'Média', 
        description: 'Modelo básico com variáveis clínicas essenciais' 
      };
    }
  };

  const handleBasicFieldChange = (field: keyof ExplicabilityFormData, value: any) => {
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

  const handleOptionalFieldToggle = (field: keyof OptionalFields) => {
    setOptionalFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const ageInMonths = calculateAgeInMonths(formData.dataNascimento);
    if (!formData.dataNascimento || formData.dataNascimento.length !== 10) {
      newErrors.dataNascimento = 'Data de nascimento é obrigatória (DD/MM/AAAA)';
    } else if (ageInMonths === null) {
      newErrors.dataNascimento = 'Data de nascimento inválida';
    } else if (ageInMonths <= 0) {
      newErrors.dataNascimento = 'A data de nascimento deve ser no passado';
    } else if (ageInMonths > 1200) {
      newErrors.dataNascimento = 'Idade deve ser menor que 100 anos';
    }

    if (!formData.peso || formData.peso <= 0) {
      newErrors.peso = 'Peso é obrigatório e deve ser maior que 0';
    } else if (formData.peso > 200) {
      newErrors.peso = 'Peso deve ser menor que 200kg';
    }

    if (optionalFields.plaque && (!formData.plaque || formData.plaque < 0)) {
      newErrors.plaque = 'Se informado, plaque deve ser um valor válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Calcular idade em meses a partir da data de nascimento
    const ageInMonths = calculateAgeInMonths(formData.dataNascimento);

    // Preparar dados no formato esperado pela API (enviando Idademeses)
    const submitData: Record<string, any> = {
      Idademeses: ageInMonths,
      edema: formData.edema,
      peso: Number(formData.peso)
    };

    // Adicionar campos opcionais se selecionados
    if (optionalFields.aids) {
      submitData.aids = true; // Sempre true quando selecionado
    }

    if (optionalFields.plaque && formData.plaque) {
      submitData.plaque = Number(formData.plaque);
    }

    onSubmit(submitData);
  };

  const isFormValid = (): boolean => {
    const ageInMonths = calculateAgeInMonths(formData.dataNascimento);
    return !!(formData.dataNascimento && formData.dataNascimento.length === 10 && 
              ageInMonths !== null && ageInMonths > 0 &&
              formData.peso && 
              (!optionalFields.plaque || formData.plaque));
  };

  const predictedModel = getPredictedModel();

  return (
    <ScrollView style={[styles.container, className && { className }]}>
      <View style={styles.formContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text size="lg" bold style={styles.title}>
            🧠 Análise de Explicabilidade Inteligente
          </Text>
          <Text size="sm" style={styles.subtitle}>
            A API detectará automaticamente o melhor modelo baseado nos dados fornecidos
          </Text>
        </View>

        {/* Campos Básicos */}
        <View style={styles.section}>
          <Text size="md" bold style={styles.sectionTitle}>
            📋 Dados Básicos (Obrigatórios)
          </Text>

          <View style={styles.formGroup}>
            <Text size="sm" bold style={styles.fieldLabel}>
              Data de Nascimento <Text style={styles.required}>*</Text>
            </Text>
            <Input style={[styles.input, errors.dataNascimento && styles.inputError]}>
              <InputField
                value={formData.dataNascimento}
                onChangeText={(text) => handleBasicFieldChange('dataNascimento', formatDateInput(text))}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                maxLength={10}
              />
            </Input>
            {errors.dataNascimento && (
              <Text size="xs" style={styles.errorMessage}>{errors.dataNascimento}</Text>
            )}
            {formData.dataNascimento.length === 10 && calculateAgeInMonths(formData.dataNascimento) !== null && (
              <Text size="xs" style={styles.fieldHelperSuccess}>
                Idade: {calculateAgeInMonths(formData.dataNascimento)} meses ({Math.floor((calculateAgeInMonths(formData.dataNascimento) || 0) / 12)} anos e {(calculateAgeInMonths(formData.dataNascimento) || 0) % 12} meses)
              </Text>
            )}
            <Text size="xs" style={styles.fieldHelper}>Data de nascimento do paciente</Text>
          </View>

          <View style={styles.formGroup}>
            <Text size="sm" bold style={styles.fieldLabel}>
              Peso (kg) <Text style={styles.required}>*</Text>
            </Text>
            <Input style={[styles.input, errors.peso && styles.inputError]}>
              <InputField
                value={formData.peso?.toString() || ''}
                onChangeText={(text) => handleBasicFieldChange('peso', text === '' ? '' : Number(text))}
                placeholder="Ex: 65.5"
                keyboardType="numeric"
              />
            </Input>
            {errors.peso && (
              <Text size="xs" style={styles.errorMessage}>{errors.peso}</Text>
            )}
            <Text size="xs" style={styles.fieldHelper}>Peso do paciente em quilogramas</Text>
          </View>

          <View style={styles.formGroup}>
            <Text size="sm" bold style={styles.fieldLabel}>
              Edema <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.booleanSelector}>
              <TouchableOpacity 
                style={[
                  styles.booleanOption,
                  formData.edema === true && styles.booleanOptionSelected
                ]}
                onPress={() => handleBasicFieldChange('edema', true)}
                activeOpacity={0.7}
              >
                <Text size="sm" style={[
                  styles.booleanOptionText,
                  formData.edema === true && styles.booleanOptionTextSelected
                ]}>
                  ✓ Sim
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.booleanOption,
                  formData.edema === false && styles.booleanOptionSelected
                ]}
                onPress={() => handleBasicFieldChange('edema', false)}
                activeOpacity={0.7}
              >
                <Text size="sm" style={[
                  styles.booleanOptionText,
                  formData.edema === false && styles.booleanOptionTextSelected
                ]}>
                  ✗ Não
                </Text>
              </TouchableOpacity>
            </View>
            <Text size="xs" style={styles.fieldHelper}>Presença de edema no paciente</Text>
          </View>
        </View>

        {/* Campos Opcionais */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.optionalHeader}
            onPress={() => setShowOptionalFields(!showOptionalFields)}
            activeOpacity={0.7}
          >
            <Text size="md" bold style={styles.sectionTitle}>
              ⚙️ Dados Adicionais (Opcional)
            </Text>
            <Text style={styles.toggleIcon}>
              {showOptionalFields ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {showOptionalFields && (
            <View style={styles.optionalFields}>
              <View style={styles.formGroup}>
                <Text size="sm" bold style={styles.fieldLabel}>
                  AIDS
                </Text>
                <View style={styles.booleanSelector}>
                  <TouchableOpacity 
                    style={[
                      styles.booleanOption,
                      optionalFields.aids === true && styles.booleanOptionSelected
                    ]}
                    onPress={() => handleOptionalFieldToggle('aids')}
                    activeOpacity={0.7}
                  >
                    <Text size="sm" style={[
                      styles.booleanOptionText,
                      optionalFields.aids === true && styles.booleanOptionTextSelected
                    ]}>
                      ✓ Sim
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.booleanOption,
                      optionalFields.aids === false && styles.booleanOptionSelected
                    ]}
                    onPress={() => setOptionalFields(prev => ({ ...prev, aids: false }))}
                    activeOpacity={0.7}
                  >
                    <Text size="sm" style={[
                      styles.booleanOptionText,
                      optionalFields.aids === false && styles.booleanOptionTextSelected
                    ]}>
                      ✗ Não
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text size="xs" style={styles.fieldHelper}>
                  Permite usar modelo especializado em AIDS
                </Text>
              </View>

              <View style={styles.formGroup}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => handleOptionalFieldToggle('plaque')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    optionalFields.plaque && styles.checkboxSelected
                  ]}>
                    {optionalFields.plaque && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text size="sm" style={styles.checkboxLabel}>
                    Incluir valor de Plaque
                  </Text>
                </TouchableOpacity>

                {optionalFields.plaque && (
                  <View style={styles.plaqueField}>
                    <Text size="sm" bold style={styles.fieldLabel}>
                      Plaque
                    </Text>
                    <Input style={[styles.input, errors.plaque && styles.inputError]}>
                      <InputField
                        value={formData.plaque?.toString() || ''}
                        onChangeText={(text) => handleBasicFieldChange('plaque', text === '' ? '' : Number(text))}
                        placeholder="Ex: 4.5"
                        keyboardType="numeric"
                      />
                    </Input>
                    {errors.plaque && (
                      <Text size="xs" style={styles.errorMessage}>{errors.plaque}</Text>
                    )}
                    <Text size="xs" style={styles.fieldHelper}>
                      Valor da medição de plaque
                    </Text>
                  </View>
                )}
                <Text size="xs" style={styles.fieldHelper}>
                  Permite usar modelo especializado em análise de plaque
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Indicador de Modelo */}
        <ModelIndicator 
          model={predictedModel.model}
          confidence={predictedModel.confidence}
          description={predictedModel.description}
          currentFields={getCurrentFields()}
        />

        {/* Botão de Submissão */}
        <View style={styles.submitSection}>
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading || !isFormValid()}
            style={[
              styles.submitButton,
              (!isFormValid() || loading) && styles.submitButtonDisabled
            ]}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <LoadingSpinner size={20} color="white" />
                <Text style={styles.submitButtonText}>
                  Analisando...
                </Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.submitButtonIcon}>🚀</Text>
                <Text style={styles.submitButtonText}>
                  Gerar Explicação Inteligente
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

interface ModelIndicatorProps {
  model: string;
  confidence: string;
  description: string;
  currentFields: string[];
}

const ModelIndicator: React.FC<ModelIndicatorProps> = ({ 
  model, 
  confidence, 
  description, 
  currentFields 
}) => {
  const getConfidenceColor = (conf: string) => {
    switch (conf.toLowerCase()) {
      case 'alta': return '#16a34a';
      case 'média': return '#ca8a04';
      case 'baixa': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.modelIndicator}>
      <Text size="xs" style={styles.indicatorTitle}>
        Modelo previsto: <Text bold>{model}</Text> ({confidence.toLowerCase()} confiança)
      </Text>
      
      <View style={styles.fieldsUsed}>
        <Text size="xs" style={styles.fieldsLabel}>
          Campos: {currentFields.join(', ')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    color: '#1f2937',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  fieldHelper: {
    color: '#6b7280',
    marginTop: 4,
  },
  fieldHelperSuccess: {
    color: '#16a34a',
    marginTop: 4,
    fontWeight: '500',
  },
  errorMessage: {
    color: '#dc2626',
    marginTop: 4,
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
  },
  booleanOptionSelected: {
    backgroundColor: '#3b82f6',
  },
  booleanOptionText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  booleanOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  optionalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleIcon: {
    fontSize: 16,
    color: '#6b7280',
  },
  optionalFields: {
    gap: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: '#374151',
    flex: 1,
  },
  conditionalField: {
    marginTop: 8,
    marginLeft: 32,
  },
  plaqueField: {
    marginTop: 12,
  },
  modelIndicator: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  indicatorTitle: {
    color: '#475569',
    marginBottom: 4,
  },
  fieldsUsed: {
    marginTop: 4,
  },
  fieldsLabel: {
    color: '#64748b',
    fontStyle: 'italic',
  },
  submitSection: {
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
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
    backgroundColor: '#9ca3af',
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});

export default SmartExplicabilityForm;
