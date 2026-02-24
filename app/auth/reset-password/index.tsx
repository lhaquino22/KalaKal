import KalaCalAPI from "@/services/KalaCalAPI";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; uid?: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const insets = useSafeAreaInsets();
  const [isValidLink, setIsValidLink] = useState(true);

  useEffect(() => {
    // Verifica se os parâmetros necessários estão presentes
    if (!params.token || !params.uid) {
      setIsValidLink(false);
    }
  }, [params.token, params.uid]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "A senha deve ter pelo menos 8 caracteres.";
    }
    if (!/[A-Z]/.test(password)) {
      return "A senha deve conter pelo menos uma letra maiúscula.";
    }
    if (!/[a-z]/.test(password)) {
      return "A senha deve conter pelo menos uma letra minúscula.";
    }
    if (!/[0-9]/.test(password)) {
      return "A senha deve conter pelo menos um número.";
    }
    return null;
  };

  const handleSubmit = async () => {
    // Validações
    if (!newPassword.trim()) {
      Alert.alert("Campo obrigatório", "Informe a nova senha.");
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert("Campo obrigatório", "Confirme a nova senha.");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      Alert.alert("Senha inválida", passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Senhas diferentes", "A confirmação não corresponde à nova senha.");
      return;
    }

    if (!params.token || !params.uid) {
      Alert.alert("Link inválido", "O link de redefinição é inválido ou expirou.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await KalaCalAPI.resetPassword({
        token: params.token,
        uid: params.uid,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });

      if (result.success) {
        Alert.alert(
          "Senha alterada",
          "Sua senha foi redefinida com sucesso! Agora você pode fazer login com a nova senha.",
          [
            {
              text: "Ir para login",
              onPress: () => router.replace("/auth/login"),
            },
          ]
        );
      } else {
        // Tratamento de erros específicos
        const errorMessage = result.error || "Não foi possível redefinir a senha.";
        
        if (errorMessage.toLowerCase().includes("token") || 
            errorMessage.toLowerCase().includes("expirado") ||
            errorMessage.toLowerCase().includes("inválido")) {
          Alert.alert(
            "Link expirado",
            "Este link de redefinição já foi usado ou expirou. Solicite um novo link.",
            [
              {
                text: "Solicitar novo link",
                onPress: () => router.replace("/auth/forgot-password"),
              },
            ]
          );
        } else {
          Alert.alert("Erro", errorMessage);
        }
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível processar sua solicitação. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tela de link inválido
  if (!isValidLink) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFF",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <StatusBar style="dark" />
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#FEE2E2",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Ionicons name="link-outline" size={40} color="#DC2626" />
        </View>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#111827",
            textAlign: "center",
          }}
        >
          Link inválido
        </Text>
        <Text
          style={{
            marginTop: 12,
            color: "#6B7280",
            fontSize: 15,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          Este link de redefinição de senha é inválido ou expirou.
          Solicite um novo link para redefinir sua senha.
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 32,
            backgroundColor: "#2563EB",
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 18,
          }}
          onPress={() => router.replace("/auth/forgot-password")}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
            Solicitar novo link
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 16 }}
          onPress={() => router.replace("/auth/login")}
        >
          <Text style={{ color: "#2563EB", fontWeight: "600", fontSize: 15 }}>
            Voltar ao login
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFF" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, flex: 1 }}>
          <TouchableOpacity
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#F4F4F5",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => router.replace("/auth/login")}
          >
            <Ionicons name="close" size={22} color="#111827" />
          </TouchableOpacity>

          <View style={{ marginTop: 32 }}>
            <Text style={{ fontSize: 28, fontWeight: "700", color: "#111827" }}>
              Redefinir senha
            </Text>
            <Text style={{ marginTop: 8, color: "#6B7280", fontSize: 15 }}>
              Crie uma nova senha para sua conta. Escolha uma senha forte que
              você não use em outros sites.
            </Text>
          </View>

          <View style={{ marginTop: 32, gap: 16 }}>
            <View>
              <Text style={{ color: "#6B7280", marginBottom: 6 }}>
                Nova senha
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    paddingRight: 50,
                    fontSize: 16,
                    backgroundColor: "#F9FAFB",
                  }}
                  placeholder="Mínimo 8 caracteres"
                  autoCapitalize="none"
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={!isSubmitting}
                />
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    right: 16,
                    top: 14,
                  }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text style={{ color: "#6B7280", marginBottom: 6 }}>
                Confirmar nova senha
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    paddingRight: 50,
                    fontSize: 16,
                    backgroundColor: "#F9FAFB",
                  }}
                  placeholder="Digite novamente a senha"
                  autoCapitalize="none"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!isSubmitting}
                />
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    right: 16,
                    top: 14,
                  }}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                backgroundColor: "#F0F9FF",
                borderRadius: 12,
                padding: 16,
                gap: 8,
              }}
            >
              <Text style={{ color: "#0369A1", fontWeight: "600", fontSize: 14 }}>
                Requisitos da senha:
              </Text>
              <View style={{ gap: 4 }}>
                <PasswordRequirement
                  met={newPassword.length >= 8}
                  text="Mínimo de 8 caracteres"
                />
                <PasswordRequirement
                  met={/[A-Z]/.test(newPassword)}
                  text="Uma letra maiúscula"
                />
                <PasswordRequirement
                  met={/[a-z]/.test(newPassword)}
                  text="Uma letra minúscula"
                />
                <PasswordRequirement
                  met={/[0-9]/.test(newPassword)}
                  text="Um número"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity
          style={{
            backgroundColor: isSubmitting ? "#93C5FD" : "#2563EB",
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: "center",
          }}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              Salvar nova senha
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Componente auxiliar para mostrar requisitos de senha
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Ionicons
        name={met ? "checkmark-circle" : "ellipse-outline"}
        size={16}
        color={met ? "#059669" : "#9CA3AF"}
      />
      <Text
        style={{
          color: met ? "#059669" : "#6B7280",
          fontSize: 13,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

