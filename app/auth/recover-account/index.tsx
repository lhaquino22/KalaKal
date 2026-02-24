import KalaCalAPI from "@/services/KalaCalAPI";
import { AccountRecoveryPayload } from "@/services/types";
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

export default function RecoverAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [payload, setPayload] = useState<AccountRecoveryPayload>({
    email: "",
    reason: "",
    details: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof AccountRecoveryPayload, value: string) => {
    setPayload((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!payload.email.trim()) {
      Alert.alert("Campo obrigatório", "Informe o e-mail da sua conta.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await KalaCalAPI.requestAccountRecovery({
        email: payload.email.trim(),
        reason: payload.reason?.trim() || undefined,
        details: payload.details?.trim() || undefined,
      });

      if (result.success) {
        Alert.alert(
          "Solicitação enviada",
          "Recebemos sua solicitação. Você receberá um e-mail com os próximos passos em até 48 horas.",
          [
            {
              text: "Voltar ao login",
              onPress: () => router.replace("/auth/login"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Não foi possível enviar",
          result.error || "Tente novamente em alguns instantes."
        );
      }
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
              Recuperar conta
            </Text>
            <Text style={{ marginTop: 8, color: "#6B7280", fontSize: 15 }}>
              Informe os dados abaixo para que possamos revisar sua solicitação
              de reativação ou recuperação de acesso.
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
                value={payload.email}
                onChangeText={(text) => handleChange("email", text)}
              />
            </View>

            <View>
              <Text style={{ color: "#6B7280", marginBottom: 6 }}>
                Motivo (opcional)
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
                placeholder="Conta excluída por engano, acesso perdido, etc."
                value={payload.reason}
                onChangeText={(text) => handleChange("reason", text)}
              />
            </View>

            <View>
              <Text style={{ color: "#6B7280", marginBottom: 6 }}>
                Detalhes adicionais (opcional)
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  backgroundColor: "#F9FAFB",
                  minHeight: 120,
                  textAlignVertical: "top",
                }}
                placeholder="Informe qualquer detalhe que nos ajude a confirmar sua identidade."
                multiline
                value={payload.details}
                onChangeText={(text) => handleChange("details", text)}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity
          style={{
            backgroundColor: isSubmitting ? "#FCA5A5" : "#DC2626",
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
            <Text
              style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
            >
              Enviar solicitação
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}


