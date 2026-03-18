export interface ModelConfig {
  name: string;
  description: string;
  rmse: number;
  features: string[];
  color: string;
  icon: string;
  recommended?: boolean;
}

export const MODELS_CONFIG: Record<string, ModelConfig> = {
  aids: {
    name: 'AIDS',
    description: 'Modelo especializado em predições relacionadas a AIDS',
    rmse: 18.0,
    features: ['Idademeses', 'edema', 'peso', 'aids'],
    color: '#dc2626', // Vermelho
    icon: '🦠'
  },
  clinicas: {
    name: 'Clínicas',
    description: 'Modelo básico com variáveis clínicas essenciais',
    rmse: 19.8,
    features: ['Idademeses', 'edema', 'peso'],
    color: '#2563eb', // Azul
    icon: '🏥'
  },
  completa: {
    name: 'Completa',
    description: 'Modelo mais abrangente com todas as variáveis',
    rmse: 16.7, // Melhor performance
    features: ['Idademeses', 'edema', 'peso', 'aids', 'plaque'],
    color: '#16a34a', // Verde
    icon: '🎯',
    recommended: true
  },
  plaque: {
    name: 'Plaque',
    description: 'Modelo especializado em análise de plaque',
    rmse: 18.7,
    features: ['Idademeses', 'edema', 'peso', 'plaque'],
    color: '#ca8a04', // Amarelo
    icon: '🔬'
  }
};

export interface FieldConfig {
  label: string;
  type: 'number' | 'boolean' | 'string' | 'birthdate';
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
  placeholder?: string;
  helper: string;
}

export const FIELD_CONFIG: Record<string, FieldConfig> = {
  Idademeses: {
    label: 'Data de Nascimento',
    type: 'birthdate',
    min: 0,
    max: 1200,
    step: 1,
    required: true,
    placeholder: 'DD/MM/AAAA',
    helper: 'Data de nascimento do paciente'
  },
  edema: {
    label: 'Edema',
    type: 'boolean',
    required: true,
    helper: 'Presença de edema no paciente'
  },
  peso: {
    label: 'Peso (kg)',
    type: 'number',
    min: 0.1,
    max: 200,
    step: 0.1,
    required: true,
    placeholder: 'Ex: 65.5',
    helper: 'Peso do paciente em quilogramas'
  },
  aids: {
    label: 'AIDS',
    type: 'boolean',
    required: true,
    helper: 'Paciente portador de AIDS'
  },
  plaque: {
    label: 'Plaque',
    type: 'number',
    min: 0,
    max: 100,
    step: 0.1,
    required: false,
    placeholder: 'Ex: 4.5',
    helper: 'Valor da medição de plaque'
  }
};

// ===== Configuração expandida para modo assistido (17 variáveis) =====

export type ExpandedFieldType = 'number' | 'boolean' | 'birthdate';

export interface ExpandedFieldConfig {
  key: string;
  label: string;
  type: ExpandedFieldType;
  required: boolean;
  section: 'obrigatorio' | 'clinico' | 'laboratorial' | 'tratamento';
  origin: 'clinica' | 'laboratorial' | 'tratamento' | 'clinica_lab';
  importance: 'muito_importante' | 'importante' | 'pouco_importante' | 'obrigatorio';
  priorityOrder: number;
  placeholder?: string;
  helper: string;
  min?: number;
  max?: number;
  step?: number;
}

export const EXPANDED_FIELDS: ExpandedFieldConfig[] = [
  // --- Obrigatórios ---
  {
    key: 'Idademeses', label: 'Data de Nascimento', type: 'birthdate',
    required: true, section: 'obrigatorio', origin: 'clinica',
    importance: 'obrigatorio', priorityOrder: 0,
    placeholder: 'DD/MM/AAAA', helper: 'Data de nascimento do paciente',
  },
  {
    key: 'peso', label: 'Peso (kg)', type: 'number',
    required: true, section: 'obrigatorio', origin: 'clinica',
    importance: 'obrigatorio', priorityOrder: 0,
    placeholder: 'Ex: 65.5', helper: 'Peso do paciente em quilogramas',
    min: 0.1, max: 300, step: 0.1,
  },
  {
    key: 'edema', label: 'Edema?', type: 'boolean',
    required: true, section: 'obrigatorio', origin: 'clinica',
    importance: 'obrigatorio', priorityOrder: 0,
    helper: 'Presença de edema no paciente',
  },
  {
    key: 'urina', label: 'Alteração na cor da Urina?', type: 'boolean',
    required: false, section: 'clinico', origin: 'clinica',
    importance: 'importante', priorityOrder: 1,
    helper: 'Alteração na coloração da urina',
  },
  {
    key: 'faltadear', label: 'Falta de ar ou dispneia?', type: 'boolean',
    required: false, section: 'clinico', origin: 'clinica',
    importance: 'importante', priorityOrder: 1,
    helper: 'Presença de falta de ar ou dispneia',
  },
  {
    key: 'hemorragia', label: 'Hemorragia?', type: 'boolean',
    required: false, section: 'clinico', origin: 'clinica',
    importance: 'importante', priorityOrder: 1,
    helper: 'Presença de hemorragia',
  },
  // --- Adicionais: Clínicos ---
  {
    key: 'aids', label: 'AIDS', type: 'boolean',
    required: false, section: 'clinico', origin: 'clinica_lab',
    importance: 'muito_importante', priorityOrder: 1,
    helper: 'Paciente portador de HIV/AIDS',
  },
  {
    key: 'pneumonia', label: 'Pneumonia?', type: 'boolean',
    required: false, section: 'clinico', origin: 'clinica',
    importance: 'muito_importante', priorityOrder: 4,
    helper: 'Presença de pneumonia',
  },
  {
    key: 'sepse', label: 'Sepse?', type: 'boolean',
    required: false, section: 'clinico', origin: 'clinica',
    importance: 'muito_importante', priorityOrder: 5,
    helper: 'Presença de sepse',
  },
  {
    key: 'venoclise', label: 'Venóclise?', type: 'boolean',
    required: false, section: 'clinico', origin: 'clinica',
    importance: 'muito_importante', priorityOrder: 6,
    helper: 'Venóclise realizada (relacionada a hemorragia)',
  },
  {
    key: 'peleadmiss', label: 'Pele na admissão?', type: 'boolean',
    required: false, section: 'clinico', origin: 'clinica',
    importance: 'importante', priorityOrder: 8,
    helper: 'Manifestação cutânea na admissão (passível a erros)',
  },
  {
    key: 'ira', label: 'Insuficiência Renal Aguda?', type: 'boolean',
    required: false, section: 'clinico', origin: 'clinica',
    importance: 'importante', priorityOrder: 10,
    helper: 'Insuficiência renal aguda (IRA)',
  },
  {
    key: 'oliguria', label: 'Oligúria?', type: 'boolean',
    required: false, section: 'clinico', origin: 'clinica',
    importance: 'pouco_importante', priorityOrder: 11,
    helper: 'Redução do volume urinário',
  },
  // --- Adicionais: Laboratoriais ---
  {
    key: 'plaque', label: 'Plaquetas', type: 'number',
    required: false, section: 'laboratorial', origin: 'laboratorial',
    importance: 'muito_importante', priorityOrder: 2,
    placeholder: 'Ex: 150', helper: 'Contagem de plaquetas',
    min: 0, max: 2000, step: 1,
  },
  {
    key: 'ast', label: 'AST', type: 'number',
    required: false, section: 'laboratorial', origin: 'laboratorial',
    importance: 'muito_importante', priorityOrder: 3,
    placeholder: 'Ex: 30', helper: 'Aspartato aminotransferase (geralmente feita com ALT)',
    min: 0, max: 10000, step: 1,
  },
  {
    key: 'leuco', label: 'Leucócitos', type: 'number',
    required: false, section: 'laboratorial', origin: 'laboratorial',
    importance: 'muito_importante', priorityOrder: 7,
    placeholder: 'Ex: 6000', helper: 'Contagem de leucócitos',
    min: 0, max: 100000, step: 100,
  },
  // --- Adicionais: Tratamento ---
  {
    key: 'plasma', label: 'Plasma?', type: 'boolean',
    required: false, section: 'tratamento', origin: 'tratamento',
    importance: 'importante', priorityOrder: 9,
    helper: 'Uso de plasma no tratamento',
  },
];

export function getNextSuggestedVariable(
  filledFields: Record<string, any>
): ExpandedFieldConfig | null {
  const additionalFields = EXPANDED_FIELDS
    .filter(f => !f.required)
    .sort((a, b) => a.priorityOrder - b.priorityOrder);

  for (const field of additionalFields) {
    const value = filledFields[field.key];
    if (value === null || value === undefined || value === '') {
      return field;
    }
  }
  return null;
}

export const SECTION_LABELS: Record<string, string> = {
  obrigatorio: 'Dados Obrigatórios',
  clinico: 'Dados Clínicos (Opcionais)',
  laboratorial: 'Dados Laboratoriais (Opcionais)',
  tratamento: 'Tratamento (Opcional)',
};
