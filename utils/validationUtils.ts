import { FIELD_CONFIG } from '@/constants/modelsConfig';

export interface ValidationError {
  [field: string]: string;
}

export const validatePatientData = (
  data: Record<string, any>,
  requiredFields: string[]
): ValidationError => {
  const errors: ValidationError = {};

  requiredFields.forEach(field => {
    const fieldConfig = FIELD_CONFIG[field];
    const value = data[field];

    // Verificar se campo obrigatório está presente
    if (fieldConfig.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${fieldConfig.label} é obrigatório`;
      return;
    }

    // Se valor está presente, validar tipo e limites
    if (value !== undefined && value !== null && value !== '') {
      if (fieldConfig.type === 'number') {
        const numValue = Number(value);
        
        if (isNaN(numValue)) {
          errors[field] = `${fieldConfig.label} deve ser um número válido`;
          return;
        }

        if (fieldConfig.min !== undefined && numValue < fieldConfig.min) {
          errors[field] = `${fieldConfig.label} deve ser maior ou igual a ${fieldConfig.min}`;
          return;
        }

        if (fieldConfig.max !== undefined && numValue > fieldConfig.max) {
          errors[field] = `${fieldConfig.label} deve ser menor ou igual a ${fieldConfig.max}`;
          return;
        }
      }

      if (fieldConfig.type === 'boolean' && typeof value !== 'boolean') {
        errors[field] = `${fieldConfig.label} deve ser verdadeiro ou falso`;
        return;
      }
    }
  });

  // Validações específicas de negócio
  if (data.Idademeses && !errors.Idademeses) {
    const idade = Number(data.Idademeses);
    if (idade < 0 || idade > 1200) {
      errors.Idademeses = 'Idade deve estar entre 0 e 1200 meses';
    }
  }

  if (data.peso && !errors.peso) {
    const peso = Number(data.peso);
    if (peso <= 0 || peso > 200) {
      errors.peso = 'Peso deve estar entre 0.1 e 200 kg';
    }
  }

  if (data.plaque && !errors.plaque) {
    const plaque = Number(data.plaque);
    if (plaque < 0 || plaque > 100) {
      errors.plaque = 'Valor de plaque deve estar entre 0 e 100';
    }
  }

  return errors;
};

export const formatFieldValue = (field: string, value: any): any => {
  const fieldConfig = FIELD_CONFIG[field];
  
  if (!fieldConfig) return value;

  if (fieldConfig.type === 'number' && value !== '' && value !== null && value !== undefined) {
    return Number(value);
  }

  if (fieldConfig.type === 'boolean') {
    return Boolean(value);
  }

  return value;
};

export const getFieldDisplayValue = (field: string, value: any): string => {
  const fieldConfig = FIELD_CONFIG[field];
  
  if (!fieldConfig) return String(value);

  if (fieldConfig.type === 'boolean') {
    return value ? 'Sim' : 'Não';
  }

  if (fieldConfig.type === 'number' && value !== null && value !== undefined && value !== '') {
    const numValue = Number(value);
    if (fieldConfig.step && fieldConfig.step < 1) {
      return numValue.toFixed(1);
    }
    return String(numValue);
  }

  return String(value || '');
};
