import estilo from "@/components/login/styles";
import Loading from "@/components/ui/loading/loader";
import { useAuth } from "@/hooks/useAPI";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    first_name: z.string().min(1, "Nome é obrigatório"),
    last_name: z.string().min(1, "Sobrenome é obrigatório"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    password_confirm: z
      .string()
      .min(8, "A confirmação deve ter pelo menos 8 caracteres"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "As senhas não coincidem",
    path: ["password_confirm"],
  });

type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<Partial<RegisterData>>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleChange = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleRegister = async () => {
    try {
      const validData = registerSchema.parse(formData);
      setErrors({});
      setLoading(true);

      try {
        const result = await register(validData);

        if (result.success) {
          Alert.alert(
            "Sucesso",
            "Cadastro realizado com sucesso! Você já pode fazer login.",
            [{ text: "OK", onPress: () => router.replace("/auth/login") }]
          );
        } else {
          Alert.alert(
            "Erro no cadastro",
            result.error ||
              "Não foi possível completar o cadastro. Verifique seus dados."
          );
        }
      } catch (error) {
        console.error("Erro ao registrar:", error);
        Alert.alert(
          "Erro",
          "Não foi possível conectar ao servidor. Verifique sua conexão."
        );
      } finally {
        setLoading(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        <Loading loading={loading} />
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <ImageBackground
              source={require("@/assets/images/background.png")}
              style={estilo.container}
              resizeMode="cover"
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 10,
                  paddingTop: insets.top,
                  paddingBottom: insets.bottom + 16,
                }}
              >
                <Image
                  source={require("@/assets/images/logo_vertical.png")}
                  style={estilo.logo}
                />
                <View style={estilo.inputContainer}>
                  <TextInput
                    style={[
                      estilo.textInput,
                      errors.username ? estilo.inputError : {},
                    ]}
                    placeholder="Nome de usuário"
                    onChangeText={(value) => handleChange("username", value)}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    value={formData.username}
                  />
                  <View style={{ minHeight: 18 }}>
                    {errors.username && (
                      <Text style={estilo.errorText}>{errors.username}</Text>
                    )}
                  </View>

                  <TextInput
                    style={[
                      estilo.textInput,
                      errors.email ? estilo.inputError : {},
                    ]}
                    placeholder="E-mail"
                    onChangeText={(value) => handleChange("email", value)}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    keyboardType="email-address"
                    value={formData.email}
                  />
                  <View style={{ minHeight: 18 }}>
                    {errors.email && (
                      <Text style={estilo.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  <TextInput
                    style={[
                      estilo.textInput,
                      errors.first_name ? estilo.inputError : {},
                    ]}
                    placeholder="Nome"
                    onChangeText={(value) => handleChange("first_name", value)}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    autoCapitalize="words"
                    returnKeyType="next"
                    value={formData.first_name}
                  />
                  <View style={{ minHeight: 18 }}>
                    {errors.first_name && (
                      <Text style={estilo.errorText}>{errors.first_name}</Text>
                    )}
                  </View>

                  <TextInput
                    style={[
                      estilo.textInput,
                      errors.last_name ? estilo.inputError : {},
                    ]}
                    placeholder="Sobrenome"
                    onChangeText={(value) => handleChange("last_name", value)}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    autoCapitalize="words"
                    returnKeyType="next"
                    value={formData.last_name}
                  />
                  <View style={{ minHeight: 18 }}>
                    {errors.last_name && (
                      <Text style={estilo.errorText}>{errors.last_name}</Text>
                    )}
                  </View>

                  <TextInput
                    style={[
                      estilo.textInput,
                      errors.password ? estilo.inputError : {},
                    ]}
                    placeholder="Senha"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    secureTextEntry={true}
                    onChangeText={(value) => handleChange("password", value)}
                    returnKeyType="next"
                    value={formData.password}
                  />
                  <View style={{ minHeight: 18 }}>
                    {errors.password && (
                      <Text style={estilo.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  <TextInput
                    style={[
                      estilo.textInput,
                      errors.password_confirm ? estilo.inputError : {},
                    ]}
                    placeholder="Confirmar Senha"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    secureTextEntry={true}
                    onChangeText={(value) =>
                      handleChange("password_confirm", value)
                    }
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                    value={formData.password_confirm}
                  />
                  <View style={{ minHeight: 18 }}>
                    {errors.password_confirm && (
                      <Text style={estilo.errorText}>
                        {errors.password_confirm}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={estilo.buttonsContainer}>
                  <TouchableOpacity
                    style={estilo.button}
                    onPress={handleRegister}
                    disabled={loading}
                  >
                    <Text style={estilo.buttonText}>Registrar</Text>
                  </TouchableOpacity>

                  <Link href="/auth/login" asChild>
                    <TouchableOpacity style={estilo.registerLink}>
                      <Text style={estilo.registerText}>
                        Já tem uma conta? Faça login
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </ImageBackground>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}
