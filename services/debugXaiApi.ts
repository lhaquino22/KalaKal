// Configuração temporária para debug da API XAI
export const DEBUG_API_CONFIG = {
  baseURL: 'http://192.168.1.29:8080',
  apiKey: 'web_kala_2024_secure_key_456', // API Key correta conforme backend
  timeout: 60000 // 60 segundos para XAI
};

// Função para testar a API diretamente
export const testXaiAPI = async (patientData: Record<string, any>) => {
  try {
    console.log('🔍 [DEBUG] Testing XAI API with config:', DEBUG_API_CONFIG);
    
    // Converter booleans para números
    const processedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(patientData)) {
      if (typeof value === 'boolean') {
        processedData[key] = value ? 1 : 0;
      } else {
        processedData[key] = value;
      }
    }
    
    const payload = {
      pacienteDados: processedData
    };
    
    console.log('🔍 [DEBUG] Payload being sent:', JSON.stringify(payload, null, 2));
    
    // Fazer requisição direta
    const response = await fetch(`${DEBUG_API_CONFIG.baseURL}/api/xai/resultado/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': DEBUG_API_CONFIG.apiKey,
        // Note: JWT será adicionado automaticamente pelo interceptor
      },
      body: JSON.stringify(payload)
    });
    
    console.log('🔍 [DEBUG] Response status:', response.status);
    console.log('🔍 [DEBUG] Response headers:', response.headers);
    
    const responseText = await response.text();
    console.log('🔍 [DEBUG] Response text:', responseText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }
    
    return JSON.parse(responseText);
    
  } catch (error) {
    console.error('❌ [DEBUG] Test XAI API Error:', error);
    throw error;
  }
};
