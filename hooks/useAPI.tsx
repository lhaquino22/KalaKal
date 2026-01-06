// hooks/useAuth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import KalaCalAPI from "../services/KalaCalAPI";
import { DeleteAccountPayload, LoginCredentials, RegisterData, User } from "../services/types";

// ===== INTERFACES =====
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (userData: RegisterData) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
  updateProfile: (userData: Partial<User>) => Promise<AuthResult>;
  refreshUserData: () => Promise<AuthResult>;
  checkAuthStatus: () => Promise<void>;
  deleteAccount: (payload: DeleteAccountPayload) => Promise<AuthResult>;
}

interface AuthResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ===== CONTEXTO =====

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

// ===== PROVIDER =====

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    try {
      setLoading(true);

      // Verificar se existe token salvo
      const token = await AsyncStorage.getItem("accessToken");
      const savedUser = await AsyncStorage.getItem("user");

      if (token && savedUser) {
        // Tentar validar o token fazendo uma requisição para o perfil
        const profileResult = await KalaCalAPI.getProfile();

        if (profileResult.success && profileResult.data) {
          setUser(profileResult.data);
          setIsAuthenticated(true);
        } else {
          // Token inválido, limpar dados
          await KalaCalAPI.clearAuthData();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Erro ao verificar status de autenticação:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    try {
      setLoading(true);
      const result = await KalaCalAPI.login(credentials);

      if (result.success && result.data) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: "Erro inesperado no login" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<AuthResult> => {
    try {
      setLoading(true);

      const result = await KalaCalAPI.register(userData);

      if (result.success && result.data) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: "Erro inesperado no registro" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<AuthResult> => {
    try {
      setLoading(true);

      await KalaCalAPI.logout();
      setUser(null);
      setIsAuthenticated(false);

      return { success: true };
    } catch (error) {
      console.error("Erro no logout:", error);
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: "Erro no logout" };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (
    userData: Partial<User>
  ): Promise<AuthResult> => {
    try {
      const result = await KalaCalAPI.updateProfile(userData);

      if (result.success && result.data) {
        setUser(result.data);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: "Erro ao atualizar perfil" };
    }
  };

  const deleteAccount = async (
    payload: DeleteAccountPayload
  ): Promise<AuthResult> => {
    try {
      setLoading(true);
      const result = await KalaCalAPI.deleteAccount(payload);

      if (result.success) {
        await KalaCalAPI.clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
        return { success: true, data: result.data };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: "Erro ao excluir conta" };
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async (): Promise<AuthResult> => {
    try {
      const result = await KalaCalAPI.getProfile();

      if (result.success && result.data) {
        setUser(result.data);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: "Erro ao buscar dados do usuário" };
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshUserData,
    checkAuthStatus,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
