import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { colors } from '@/commons';
import dayjs from '@/lib/dayjs';

interface SimpleFormData {
  dataNascimento: string;
  edema: boolean | null;
  peso: number | '';
  aids?: boolean | null;
  plaque?: number | '';
}

interface SimpleExplicabilityFormProps {
  onSubmit: (formData: Record<string, any>) => void;
  loading?: boolean;
  className?: string;
}

const SimpleExplicabilityForm: React.FC<SimpleExplicabilityFormProps> = ({ 
  onSubmit, 
  loading = false, 
  className = '' 
}) => {
  const [formData, setFormData] = useState<SimpleFormData>({
    dataNascimento: '',
    edema: null,
    peso: '',
    aids: null,
    plaque: ''
  });

  // Função para formatar data no formato DD/MM/YYYY enquanto o usuário digita
  const formatDateInput = (text: string): string => {
    const numbers = text.replace(/\D/g, '');
    
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationOpacity] = useState(new Animated.Value(0));

  // Detectar modelo baseado nos campos preenchidos
  const getDetectedModel = (): { model: string; confidence: string } => {
    const ageInMonths = calculateAgeInMonths(formData.dataNascimento);
    const hasBasicFields = ageInMonths !== null && ageInMonths > 0 && formData.peso && formData.edema !== null;
    const hasAidsInfo = formData.aids !== null; // Tem informação sobre AIDS (sim ou não)
    const hasPlaque = formData.plaque && formData.plaque > 0;

    if (!hasBasicFields) {
      return { model: '', confidence: '' };
    }

    if (hasAidsInfo && hasPlaque) {
      return { model: 'Completa', confidence: 'Alta' };
    } else if (hasAidsInfo) {
      return { model: 'AIDS', confidence: 'Alta' };
    } else if (hasPlaque) {
      return { model: 'Plaque', confidence: 'Alta' };
    } else {
      return { model: 'Clínicas', confidence: 'Média' };
    }
  };

  const detectedModel = getDetectedModel();

  // Mostrar notificação quando modelo for detectado
  useEffect(() => {
    if (detectedModel.model && !loading) {
      setShowNotification(true);
      Animated.timing(notificationOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide após 3 segundos
      const timer = setTimeout(() => {
        Animated.timing(notificationOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowNotification(false));
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShowNotification(false);
      notificationOpacity.setValue(0);
    }
  }, [detectedModel.model, loading]);

  const handleFieldChange = (field: keyof SimpleFormData, value: any) => {
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
      newErrors.peso = 'Peso é obrigatório';
    } else if (formData.peso > 200) {
      newErrors.peso = 'Peso deve ser menor que 200kg';
    }

    if (formData.edema === null) {
      newErrors.edema = 'Selecione uma opção para Edema';
    }

    if (formData.plaque && formData.plaque < 0) {
      newErrors.plaque = 'Plaque deve ser um valor válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Calcular idade em meses a partir da data de nascimento
    const ageInMonths = calculateAgeInMonths(formData.dataNascimento);

    const submitData: Record<string, any> = {
      Idademeses: ageInMonths,
      edema: formData.edema,
      peso: Number(formData.peso)
    };

    // Enviar informação de AIDS se foi fornecida (true ou false)
    if (formData.aids !== null) {
      submitData.aids = formData.aids;
    }

    if (formData.plaque) {
      submitData.plaque = Number(formData.plaque);
    }

    onSubmit(submitData);
  };

  const isFormValid = (): boolean => {
    const ageInMonths = calculateAgeInMonths(formData.dataNascimento);
    return !!(formData.dataNascimento && formData.dataNascimento.length === 10 && 
              ageInMonths !== null && ageInMonths > 0 &&
              formData.peso && formData.edema !== null);
  };

  return (
    <ScrollView style={[styles.container]}>
      <View style={styles.formContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text size="sm" style={styles.subtitle}>
            Preencha os dados para gerar a análise
          </Text>
        </View>

        {/* Notificação Discreta do Modelo */}
        {showNotification && (
          <Animated.View 
            style={[styles.notification, { opacity: notificationOpacity }]}
          >
            <View style={styles.notificationContent}>
              <Text style={styles.notificationIcon}>🎯</Text>
              <Text size="xs" style={styles.notificationText}>
                Modelo <Text bold>{detectedModel.model}</Text> será utilizado
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Lista de Campos Simples */}
        <View style={styles.fieldsList}>
          {/* Data de Nascimento */}
          <View style={styles.fieldItem}>
            <Text size="sm" style={styles.fieldLabel}>
              Data de Nascimento <Text style={styles.required}>*</Text>
            </Text>
            <Input style={[styles.input, errors.dataNascimento && styles.inputError]}>
              <InputField
                value={formData.dataNascimento}
                onChangeText={(text) => handleFieldChange('dataNascimento', formatDateInput(text))}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                maxLength={10}
              />
            </Input>
            {errors.dataNascimento && (
              <Text size="xs" style={styles.errorText}>{errors.dataNascimento}</Text>
            )}
            {formData.dataNascimento.length === 10 && calculateAgeInMonths(formData.dataNascimento) !== null && (
              <Text size="xs" style={styles.fieldHelperSuccess}>
                Idade: {calculateAgeInMonths(formData.dataNascimento)} meses ({Math.floor((calculateAgeInMonths(formData.dataNascimento) || 0) / 12)} anos e {(calculateAgeInMonths(formData.dataNascimento) || 0) % 12} meses)
              </Text>
            )}
          </View>

          {/* Peso */}
          <View style={styles.fieldItem}>
            <Text size="sm" style={styles.fieldLabel}>
              Peso (kg) <Text style={styles.required}>*</Text>
            </Text>
            <Input style={[styles.input, errors.peso && styles.inputError]}>
              <InputField
                value={formData.peso?.toString() || ''}
                onChangeText={(text) => handleFieldChange('peso', text === '' ? '' : Number(text))}
                placeholder="Ex: 65.5"
                keyboardType="numeric"
              />
            </Input>
            {errors.peso && (
              <Text size="xs" style={styles.errorText}>{errors.peso}</Text>
            )}
          </View>

          {/* Edema */}
          <View style={styles.fieldItem}>
            <Text size="sm" style={styles.fieldLabel}>
              Edema <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.toggleContainer, errors.edema && styles.toggleContainerError]}>
              <TouchableOpacity 
                style={[
                  styles.toggleOption,
                  formData.edema === true && styles.toggleOptionActive
                ]}
                onPress={() => handleFieldChange('edema', true)}
                activeOpacity={0.7}
              >
                <Text size="sm" style={[
                  styles.toggleText,
                  formData.edema === true && styles.toggleTextActive
                ]}>
                  Sim
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.toggleOption,
                  formData.edema === false && styles.toggleOptionActive
                ]}
                onPress={() => handleFieldChange('edema', false)}
                activeOpacity={0.7}
              >
                <Text size="sm" style={[
                  styles.toggleText,
                  formData.edema === false && styles.toggleTextActive
                ]}>
                  Não
                </Text>
              </TouchableOpacity>
            </View>
            {errors.edema && (
              <Text size="xs" style={styles.errorText}>{errors.edema}</Text>
            )}
          </View>

          {/* AIDS */}
          <View style={styles.fieldItem}>
            <Text size="sm" style={styles.fieldLabel}>
              AIDS
            </Text>
            <Text size="xs" style={styles.fieldHelper}>
              Sim/Não ativa modelo especializado. N/A usa modelo básico.
            </Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[
                  styles.toggleOption,
                  formData.aids === true && styles.toggleOptionActive
                ]}
                onPress={() => handleFieldChange('aids', true)}
                activeOpacity={0.7}
              >
                <Text size="sm" style={[
                  styles.toggleText,
                  formData.aids === true && styles.toggleTextActive
                ]}>
                  Sim
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.toggleOption,
                  formData.aids === false && styles.toggleOptionActive
                ]}
                onPress={() => handleFieldChange('aids', false)}
                activeOpacity={0.7}
              >
                <Text size="sm" style={[
                  styles.toggleText,
                  formData.aids === false && styles.toggleTextActive
                ]}>
                  Não
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.toggleOptionNeutral,
                  formData.aids === null && styles.toggleOptionNeutralActive
                ]}
                onPress={() => handleFieldChange('aids', null)}
                activeOpacity={0.7}
              >
                <Text size="sm" style={[
                  styles.toggleTextNeutral,
                  formData.aids === null && styles.toggleTextNeutralActive
                ]}>
                  N/A
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Plaque */}
          <View style={styles.fieldItem}>
            <Text size="sm" style={styles.fieldLabel}>
              Plaquetas
            </Text>
            <Input style={[styles.input, errors.plaque && styles.inputError]}>
              <InputField
                value={formData.plaque?.toString() || ''}
                onChangeText={(text) => handleFieldChange('plaque', text === '' ? '' : Number(text))}
                placeholder="Ex: 4.5 (opcional)"
                keyboardType="numeric"
              />
            </Input>
            {errors.plaque && (
              <Text size="xs" style={styles.errorText}>{errors.plaque}</Text>
            )}
          </View>
        </View>

        {/* Botão de Submissão */}
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
            <Text style={styles.submitButtonText}>
              Analisar
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    color: colors.mainColor,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.defaultTextColor,
    textAlign: 'center',
    opacity: 0.7,
  },
  notification: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  notificationContent: {
    backgroundColor: '#FBF5DA',
    borderLeftWidth: 4,
    borderLeftColor: colors.secondaryColor,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  notificationText: {
    color: '#824417',
    flex: 1,
  },
  fieldsList: {
    gap: 20,
  },
  fieldItem: {
    gap: 8,
  },
  fieldLabel: {
    color: colors.defaultTextColor,
    fontWeight: '600',
  },
  fieldHelper: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  fieldHelperSuccess: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '500',
  },
  required: {
    color: colors.mainColor,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: colors.mainColor,
  },
  errorText: {
    color: colors.mainColor,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  toggleContainerError: {
    borderColor: colors.mainColor,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  toggleOptionActive: {
    backgroundColor: colors.mainColor,
  },
  toggleOptionNeutral: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'white',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  toggleOptionNeutralActive: {
    backgroundColor: '#f3f4f6',
    borderLeftColor: '#d1d5db',
  },
  toggleText: {
    color: colors.defaultTextColor,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  toggleTextNeutral: {
    color: '#6b7280',
    fontWeight: '500',
  },
  toggleTextNeutralActive: {
    color: '#374151',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.mainColor,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: colors.disabledColor,
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

export default SimpleExplicabilityForm;
