import getKalacalOptions from "@/components/kalacal/api/get-options";
import { stepperItems } from "@/components/kalacal/lib/stepper-items";
import PaginatedForm from "@/components/kalacal/paginated-form";
import {
  step1Schema,
  step2Schema,
} from "@/components/kalacal/schemas/kalacal-form-schema";
import { Stepper } from "@/components/kalacal/stepper";
import {
  KalacalFormData,
  KalacalOptions,
  KalacalResponse,
} from "@/components/kalacal/types";
import { Button, ButtonText } from "@/components/ui/button";
import KalaCalAPI from "@/services/KalaCalAPI";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/commons";
import { Text } from "../../components/ui/text";

export default function KalaCal() {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [formOptions, setFormOptions] = useState<KalacalOptions | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<any>({});
  const [apiResult, setApiResult] = useState<KalacalResponse>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchingError, setFetchingError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const options = await getKalacalOptions();
        if (options) {
          setFormOptions(options);
        } else {
          setFetchingError(
            "Erro ao carregar as opções do Kalacal. Tente novamente mais tarde."
          );
        }
      } catch {
        console.log("Erro ao buscar opções do Kalacal");
        setFetchingError(
          "Erro ao carregar as opções do Kalacal. Tente novamente mais tarde."
        );
      }

      setIsFetching(false);
    }

    fetchOptions();
  }, []);

  const [formData, setFormData] = useState<KalacalFormData>({
    caso_id: "",
    modelo: "clinico",
    faixa_etaria_kalacal: -1,
    sitios_sangramento: -1,
    edema: false,
    aids: false,
    ictericia: false,
    dispneia: false,
    infeccao: false,
    vomitos: false,
    leucopenia: false,
    plaquetopenia: false,
    insuficiencia_renal: false,
    hepatite: false,
    observacoes: "",
  });

  const validateCurrentStep = () => {
    let result;
    if (currentStep === 0) {
      result = step1Schema.safeParse(formData);
    } else if (currentStep === 1) {
      result = step2Schema.safeParse(formData);
    } else {
      return true;
    }

    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      setErrors(formattedErrors);
      Alert.alert(
        "Dados incompletos",
        Object.values(formattedErrors)[0]?.[0] ||
          "Por favor, preencha os campos obrigatórios."
      );
      return false;
    }

    setErrors({});
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1) {
      handleSubmit();
    } else {
      if (validateCurrentStep()) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);

    const dataAsFormData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        dataAsFormData.append(key, String(value));
      }
    });

    try {
      setIsSubmitting(true);

      const response = await KalaCalAPI.calcularProbabilidade(formData);
      if (response.success && response.data) {
        setApiResult(response.data);
        setCurrentStep(stepperItems.length - 1);
      } else {
        setErrors({ form: response.error || "Erro ao processar o cálculo" });
        Alert.alert(
          "Erro ao calcular",
          response.data?.caso_id[0] || "Erro inesperado ao processar o cálculo"
        );
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      setErrors({ form: "Erro inesperado ao processar o cálculo" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.mainColor} />
          <Text className="mt-2">Carregando Kalacal...</Text>
        </View>
      </>
    );
  }

  if (fetchingError) {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 justify-center items-center px-4">
          <View className="flex justify-center items-center mb-4">
            <Text className="text-red-500 text-center">{fetchingError}</Text>
          </View>
          <Button>
            <ButtonText onPress={() => router.back()}>
              Retornar para a página anterior
            </ButtonText>
          </Button>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View className="items-center px-4 border rounded-xl border-gray-200 bg-white mt-5 mx-4 overflow-hidden" style={{ marginBottom: Math.max(insets.bottom, 5) }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <Stepper items={stepperItems} currentStep={currentStep} />
            <View className="mt-8">
              <Text
                className="text-2xl text-center"
                style={{
                  fontFamily: "Gidole",
                }}
              >
                KalaCal
              </Text>
            </View>

            <PaginatedForm
              currentStep={currentStep}
              formData={formData}
              setFormData={setFormData}
              options={formOptions}
              errors={errors}
              apiResult={apiResult}
            />

            <View className="flex-row justify-between mt-8 mb-4 gap-3 w-full">
              {currentStep > 0 && (
                <View className="w-1/2">
                  <Button
                    onPress={prevStep}
                    disabled={currentStep === 0}
                    className="flex-1"
                    action="secondary"
                    variant={currentStep === 0 ? "solid" : "solid"}
                  >
                    <ButtonText>Voltar</ButtonText>
                  </Button>
                </View>
              )}

              {currentStep === stepperItems.length - 1 ? (
                <Button
                  onPress={() => {
                    setFormData({
                      caso_id: "",
                      modelo: "clinico",
                      faixa_etaria_kalacal: -1,
                      sitios_sangramento: -1,
                      edema: false,
                      aids: false,
                      ictericia: false,
                      dispneia: false,
                      infeccao: false,
                      vomitos: false,
                      leucopenia: false,
                      plaquetopenia: false,
                      insuficiencia_renal: false,
                      hepatite: false,
                      observacoes: "",
                    });
                    setApiResult(undefined);
                    setCurrentStep(0);
                  }}
                  className="flex-1"
                >
                  <ButtonText className="text-white">
                    Nova Estimativa
                  </ButtonText>
                </Button>
              ) : (
                <Button
                  onPress={nextStep}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <ButtonText>
                    {isSubmitting ? "Processando..." : "Próximo"}
                  </ButtonText>
                </Button>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
