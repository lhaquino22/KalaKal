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
  Text,
  StatusBar,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EntrarScreen() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const SignIn = async () => {
    if (!username.trim() || !senha.trim()) {
      Alert.alert("Ocorreu um erro", "Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      const result = await login({
        username: username.trim(),
        password: senha.trim(),
      });
      if (result.success) {
        router.replace("/home/(tabs)/menu");
      } else {
        Alert.alert(
          "Ocorreu um erro no login",
          result.error || "Email ou senha incorretos. Tente novamente."
        );
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      Alert.alert(
        "Erro",
        "Não foi possível conectar ao servidor. Verifique sua conexão."
      );
    } finally {
      setLoading(false);
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
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <ImageBackground
              source={require("@/assets/images/background.png")}
              style={estilo.image}
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
                    style={estilo.textInput}
                    placeholder={"Usuário"}
                    onChangeText={setUsername}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    keyboardType="email-address"
                    value={username}
                  />
                  <TextInput
                    style={estilo.textInput}
                    placeholder={"Senha"}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    secureTextEntry={true}
                    onChangeText={setSenha}
                    returnKeyType="done"
                    onSubmitEditing={() => SignIn()}
                    value={senha}
                  />
                </View>
                <View style={estilo.buttonsContainer}>
                  <TouchableOpacity onPress={() => SignIn()}>
                    <Image
                      source={require("@/assets/images/login.png")}
                      style={estilo.buttons}
                    />
                  </TouchableOpacity>
                  <Link href="/auth/register" asChild>
                    <TouchableOpacity>
                      <Image
                        source={require("@/assets/images/cadastro.png")}
                        style={estilo.buttons}
                      />
                    </TouchableOpacity>
                  </Link>
                </View>
                <View style={{ marginTop: 16, gap: 12 }}>
                  <Link href="/auth/forgot-password" asChild>
                    <TouchableOpacity>
                      <Text
                        style={{
                          color: "#FFFFFF",
                          textAlign: "center",
                          textDecorationLine: "underline",
                          fontWeight: "600",
                        }}
                      >
                        Esqueci minha senha
                      </Text>
                    </TouchableOpacity>
                  </Link>
                  <Link href="/auth/recover-account" asChild>
                    <TouchableOpacity>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          textAlign: "center",
                          fontSize: 13,
                        }}
                      >
                        Reativar conta desativada
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
