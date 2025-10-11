import { KalacalFormData, KalacalOptions, KalacalResponse } from '@/components/kalacal/types';
import { Ocorrencia, OcorrenciaForm } from '@/components/ocorrencias/types';
import env from '@/config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiInfo, ApiResponse, AuthResponse, LoginCredentials, MetricasSistema, RefreshTokenResponse, RegisterData, User, XaiHealthcheck, XaiPaciente, XaiResultadoRequest, XaiResultadoResponse } from './types';

interface ApiConfig {
    baseURL: string;
    apiKey: string;
    timeout: number;
}

const API_CONFIG: ApiConfig = {
    baseURL: env.EXPO_PUBLIC_API_URL,
    apiKey: 'web_kala_2024_secure_key_456', // API Key correta conforme análise do backend
    timeout: 60000 // Aumentar timeout para XAI (60 segundos)
};

const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_CONFIG.apiKey
    }
});

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Debug: Log headers sendo enviados
        console.log('🔍 [DEBUG] Request Headers:', {
            'Authorization': config.headers.Authorization,
            'X-API-Key': config.headers['X-API-Key'],
            'Content-Type': config.headers['Content-Type']
        });
        console.log('🔍 [DEBUG] Request URL:', config.url);
        console.log('🔍 [DEBUG] Request Method:', config.method);
        if (config.data) {
            console.log('🔍 [DEBUG] Request Data:', JSON.stringify(config.data, null, 2));
        }
        
        return config;
    },
    (error: AxiosError) => {
        console.error('❌ [DEBUG] Request interceptor error:', error);
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log('✅ [DEBUG] Response Status:', response.status);
        console.log('✅ [DEBUG] Response Data:', response.data);
        return response;
    },
    async (error: AxiosError) => {
        console.error('❌ [DEBUG] Response Error Status:', error.response?.status);
        console.error('❌ [DEBUG] Response Error Data:', error.response?.data);
        console.error('❌ [DEBUG] Response Error Message:', error.message);
        
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await KalaCalAPI.refreshToken(refreshToken);
                    await AsyncStorage.setItem('accessToken', response.data.access);

                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError: unknown) {
                console.error('❌ [DEBUG] Token refresh failed:', refreshError);
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
            }
        }

        return Promise.reject(error);
    }
);

class KalaCalAPI {
    static handleError(error: AxiosError): ApiResponse {
        if (error.response) {
            const responseData = error.response.data as any;
            return {
                success: false,
                error: responseData?.message || responseData?.detail || 'Erro na requisição',
                status: error.response.status,
                data: responseData
            };
        } else if (error.request) {
            return {
                success: false,
                error: 'Erro de conexão. Verifique sua internet.',
                status: null
            };
        } else {
            return {
                success: false,
                error: error.message || 'Erro desconhecido',
                status: null
            };
        }
    }

    static async makeRequest<T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<ApiResponse<T>> {
        try {
            const response = await requestFn();
            return {
                success: true,
                data: response.data,
                status: response.status,
            };
        } catch (unknownError) {
            const err = unknownError as unknown;
            if (axios.isAxiosError(err)) {
                return {
                    success: false,
                    error: (err.response?.data as any)?.detail || err.message || "Erro desconhecido",
                    status: err.response?.status,
                    data: err.response?.data as any
                };
            }

            return {
                success: false,
                error: err instanceof Error ? err.message : "Erro desconhecido",
            };
        }
    }

    // ===== ENDPOINTS PÚBLICOS (apenas API Key) =====

    static async getAPIInfo(): Promise<ApiResponse<ApiInfo>> {
        return this.makeRequest<ApiInfo>(() => apiClient.get<ApiInfo>('/api/auth/info/'));
    }

    static async getAuthStatus(): Promise<ApiResponse<any>> {
        return this.makeRequest<any>(() => apiClient.get('/api/auth/status/'));
    }

    // ===== AUTENTICAÇÃO =====

    static async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
        const result = await this.makeRequest<AuthResponse>(() =>
            apiClient.post<AuthResponse>('/api/auth/register/', userData)
        );

        if (result.success && result.data?.access) {
            await AsyncStorage.multiSet([
                ['accessToken', result.data.access],
                ['refreshToken', result.data.refresh],
                ['user', JSON.stringify(result.data.user)]
            ]);
        }

        return result;
    }

    static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
        const result = await this.makeRequest<AuthResponse>(() =>
            apiClient.post<AuthResponse>('/api/auth/login/', credentials, {
                headers: { "Content-Type": "application/json" }
            })
        );

        if (result.success && result.data?.access) {
            await AsyncStorage.multiSet([
                ['accessToken', result.data.access],
                ['refreshToken', result.data.refresh],
                // ['user', JSON.stringify(result.data.user)]
            ]);
        }

        return result;
    }

    static async logout(): Promise<ApiResponse<void>> {
        try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');

            if (refreshToken) {
                await this.makeRequest(() =>
                    apiClient.post('/api/auth/logout/', { refresh: refreshToken })
                );
            }
        } catch (error: unknown) {
            console.error('Erro no logout do servidor:', error);
        } finally {
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        }

        return { success: true };
    }

    static async refreshToken(refreshToken: string): Promise<AxiosResponse<RefreshTokenResponse>> {
        // Não usar interceptador aqui para evitar loop infinito
        return axios.post<RefreshTokenResponse>(
            `${API_CONFIG.baseURL}/api/auth/refresh/`,
            { refresh: refreshToken },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_CONFIG.apiKey
                }
            }
        );
    }

    // ===== PERFIL DO USUÁRIO (Requer JWT) =====

    static async getProfile(): Promise<ApiResponse<User>> {
        return this.makeRequest<User>(() => apiClient.get<User>('/api/auth/profile/'));
    }

    static async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
        const result = await this.makeRequest<User>(() =>
            apiClient.put<User>('/api/auth/profile/update/', userData)
        );

        if (result.success && result.data) {
            // Atualizar dados do usuário no AsyncStorage
            await AsyncStorage.setItem('user', JSON.stringify(result.data));
        }

        return result;
    }

    // ===== CASOS (Requer JWT) =====

    static async getCasos(): Promise<ApiResponse<Ocorrencia[]>> {
        return this.makeRequest<Ocorrencia[]>(() => apiClient.get<Ocorrencia[]>('/api/casos/'));
    }

    static async createCaso(casoData: FormData): Promise<ApiResponse<OcorrenciaForm>> {
        return this.makeRequest<OcorrenciaForm>(() => apiClient.post<OcorrenciaForm>('/api/casos/', casoData, {
            headers: { "Content-Type": "multipart/form-data" },
        }));
    }

    static async getCaso(id: number): Promise<ApiResponse<OcorrenciaForm>> {
        return this.makeRequest<OcorrenciaForm>(() => apiClient.get<OcorrenciaForm>(`/api/casos/${id}/`));
    }

    static async updateCaso(id: number, casoData: FormData): Promise<ApiResponse<OcorrenciaForm>> {
        return this.makeRequest<OcorrenciaForm>(() => apiClient.put<Ocorrencia>(`/api/casos/${id}/`, casoData, {
            headers: { "Content-Type": "multipart/form-data" }
        }));
    }

    static async deleteCaso(id: number): Promise<ApiResponse<void>> {
        return this.makeRequest(() => apiClient.delete(`/api/casos/${id}/`));
    }

    // ===== KALACAL CALCULATOR (Requer JWT) =====

    static async calcularProbabilidade(dadosCalculo: KalacalFormData): Promise<ApiResponse<KalacalResponse>> {
        return this.makeRequest<KalacalResponse>(() =>
            apiClient.post('/api/kalacal/calcular/', dadosCalculo)
        );
    }

    static async getOpcoesFormulario(): Promise<ApiResponse<KalacalOptions>> {
        return this.makeRequest<KalacalOptions>(() => apiClient.get<KalacalOptions>('/api/kalacal/opcoes/'));
    }

    static async getMetricasSistema(): Promise<ApiResponse<MetricasSistema>> {
        return this.makeRequest<MetricasSistema>(() => apiClient.get<MetricasSistema>('/api/kalacal/metricas/'));
    }

    // ===== MÉTODOS DE CONVENIÊNCIA =====

    static async isAuthenticated(): Promise<boolean> {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            return !!token;
        } catch (error: unknown) {
            return false;
        }
    }

    static async getCurrentUser(): Promise<User | null> {
        try {
            const userString = await AsyncStorage.getItem('user');
            return userString ? JSON.parse(userString) : null;
        } catch (error: unknown) {
            return null;
        }
    }

    static async clearAuthData(): Promise<void> {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    }

    // ===== XAI (Explainable AI) =====

    // Healthcheck público (sem necessidade de JWT)
    static async getXaiHealthcheck(): Promise<ApiResponse<XaiHealthcheck>> {
        // Força não enviar Authorization se houver token, mantendo apenas X-API-Key
        return this.makeRequest<XaiHealthcheck>(() => apiClient.get<XaiHealthcheck>('/api/xai/teste/', {
            headers: { 'Authorization': '' }
        }));
    }

    // Resultado principal (requer JWT + X-API-Key)
    static async getXaiResultado(payload: XaiResultadoRequest): Promise<ApiResponse<XaiResultadoResponse>> {
        return this.makeRequest<XaiResultadoResponse>(() => apiClient.post<XaiResultadoResponse>('/api/xai/resultado/', payload));
    }

    // CRUD Pacientes (opcional / debug) — requer JWT + X-API-Key
    static async listXaiPacientes(): Promise<ApiResponse<XaiPaciente[]>> {
        return this.makeRequest<XaiPaciente[]>(() => apiClient.get<XaiPaciente[]>('/api/xai/pacientes/'));
    }

    static async createXaiPaciente(data: XaiPaciente): Promise<ApiResponse<XaiPaciente>> {
        return this.makeRequest<XaiPaciente>(() => apiClient.post<XaiPaciente>('/api/xai/pacientes/', data));
    }

    static async getXaiPaciente(id: number): Promise<ApiResponse<XaiPaciente>> {
        return this.makeRequest<XaiPaciente>(() => apiClient.get<XaiPaciente>(`/api/xai/pacientes/${id}/`));
    }

    static async updateXaiPaciente(id: number, data: XaiPaciente): Promise<ApiResponse<XaiPaciente>> {
        return this.makeRequest<XaiPaciente>(() => apiClient.put<XaiPaciente>(`/api/xai/pacientes/${id}/`, data));
    }

    static async patchXaiPaciente(id: number, data: Partial<XaiPaciente>): Promise<ApiResponse<XaiPaciente>> {
        return this.makeRequest<XaiPaciente>(() => apiClient.patch<XaiPaciente>(`/api/xai/pacientes/${id}/`, data));
    }

    static async deleteXaiPaciente(id: number): Promise<ApiResponse<void>> {
        return this.makeRequest<void>(() => apiClient.delete<void>(`/api/xai/pacientes/${id}/`));
    }
}

export default KalaCalAPI;