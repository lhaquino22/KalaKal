export interface KalacalOptions {
    faixas_etarias: FaixasEtaria[]
    sitios_sangramento: SitiosSangramento[]
    modelos: Modelo[]
    sinais_clinicos: SinaisClinico[]
    dados_laboratoriais: DadosLaboratoriai[]
}

export interface KalacalResponse {
    caso_id: string | string[]
    escore: number
    escore_maximo: number
    probabilidade_morte: number
    modelo_usado: string
    interpretacao: string
    calculo_id: number
    calculado_em: string
  }

export interface KalacalFormData {
    caso_id?: string
    modelo: string
    faixa_etaria_kalacal: number
    sitios_sangramento: number
    edema: boolean
    aids: boolean
    ictericia: boolean
    dispneia: boolean
    infeccao: boolean
    vomitos: boolean
    leucopenia: boolean
    plaquetopenia: boolean
    insuficiencia_renal: boolean
    hepatite: boolean
    observacoes: string
  }

export interface FaixasEtaria {
    value: number
    label: string
}

export interface SitiosSangramento {
    value: number
    label: string
}

export interface Modelo {
    value: string
    label: string
}

export interface SinaisClinico {
    key: string
    label: string
}

export interface DadosLaboratoriai {
    key: string
    label: string
}

export interface FormValues {
    age_range: string;
    clinical_model: string;
    bleeding_sites: string;
    other_symptons: string[];
}