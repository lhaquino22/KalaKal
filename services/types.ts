export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    status?: number | null;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    is_active: boolean;
    date_joined: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface RefreshTokenResponse {
    access: string;
}

export interface ApiInfo {
    status: string;
    version: string;
    message?: string;
}

export interface Caso {
    id: number;
    titulo: string;
    descricao?: string;
    created_at: string;
    updated_at: string;
    user: number;
}

export interface CasoCreateData {
    titulo: string;
    descricao?: string;
}

export interface CalculoProbabilidade {
    [key: string]: any;
}

export interface OpcoesFormulario {
    [key: string]: any;
}

export interface MetricasSistema {
    [key: string]: any;
}

// ===== XAI (Explainable AI) =====

export interface XaiResultadoResponse {
    valor_predito: number;
    erro_modelo: number;
    imagem_base64: string; // data:image/png;base64,...
    variaveis: string[];
    abordagem?: string;
    total_features?: number;
}

export type XaiResultadoRequest = { [key: string]: any };

export interface XaiHealthcheck {
    status: string;
}

export interface XaiPaciente {
    id?: number;
    nome: string;
    ectoscopia: number;
    mucosas: number;
    card: number;
    hg: number;
    perfusao: number;
    leuco: number;
    eosi: number;
    consciente: number;
    hem: number;
    febre: number;
}