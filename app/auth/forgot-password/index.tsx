import KalaCalAPI from "@/services/KalaCalAPI";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert("Campo obrigatório", "Informe o e-mail da sua conta.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert("E-mail inválido", "Por favor, informe um e-mail válido.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await KalaCalAPI.forgotPassword({ email: trimmedEmail });

      // Sempre mostra mensagem de sucesso por segurança
      // (não revelar se o e-mail existe ou não)
      Alert.alert(
        "Solicitação registrada",
        "Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha. Verifique sua caixa de entrada e spam.",
        [
          {
            text: "Voltar ao login",
            onPress: () => router.replace("/auth/login"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível processar sua solicitação. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>

          <View style={{ marginTop: 32 }}>
            <Text style={{ fontSize: 28, fontWeight: "700", color: "#111827" }}>
              Esqueci minha senha
            </Text>
            <Text style={{ marginTop: 8, color: "#6B7280", fontSize: 15 }}>
              Informe o e-mail cadastrado na sua conta. Enviaremos um link para
              você redefinir sua senha.
            </Text>
          </View>

          <View style={{ marginTop: 32, gap: 16 }}>
            <View>
              <Text style={{ color: "#6B7280", marginBottom: 6 }}>
                E-mail da conta
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  backgroundColor: "#F9FAFB",
                }}
                placeholder="nome@exemplo.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                editable={!isSubmitting}
              />
            </View>

            <View
              style={{
                backgroundColor: "#FEF3C7",
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <Ionicons name="time-outline" size={20} color="#D97706" />
              <Text style={{ flex: 1, color: "#92400E", fontSize: 14 }}>
                O link de redefinição expira em 60 minutos. Caso não receba o
                e-mail, verifique a pasta de spam.
              </Text>
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
              Enviar link de redefinição
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

