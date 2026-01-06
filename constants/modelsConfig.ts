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
