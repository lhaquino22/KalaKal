import { faMicroscope } from "@fortawesome/free-solid-svg-icons/faMicroscope";
import { faNotesMedical } from "@fortawesome/free-solid-svg-icons/faNotesMedical";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons/faTriangleExclamation";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import OcorrenciaPicker from "../shared/OcorrenciaPicker";
import React, { useMemo } from "react";
import { ScrollView, View } from "react-native";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "../ui/checkbox";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "../ui/form-control";
import { Pressable } from "../ui/pressable";
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "../ui/radio";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import { KalacalFormData, KalacalOptions, KalacalResponse } from "./types";

export default function PaginatedForm({
  currentStep,
  formData,
  setFormData,
  options,
  errors,
  apiResult,
}: {
  currentStep: number;
  formData: KalacalFormData;
  setFormData: React.Dispatch<React.SetStateAction<KalacalFormData>>;
  options: KalacalOptions | null;
  errors: any;
  apiResult: KalacalResponse | undefined;
}) {
  const handleValueChange = <T extends keyof KalacalFormData>(
    field: T,
    value: KalacalFormData[T]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const AgeRangeForm = useMemo(
    () => (
      <ScrollView className="w-full mt-4" showsVerticalScrollIndicator={false}>
        <VStack space="md" className="w-full">
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText>
                Associar a uma Ocorrencia (opcional)
              </FormControlLabelText>
            </FormControlLabel>
            <OcorrenciaPicker
              value={formData.caso_id}
              onChange={(id) => handleValueChange("caso_id", id as any)}
            />
          </FormControl>

          <FormControl
            isRequired
            isInvalid={!!errors?.faixa_etaria_kalacal}
            className="mt-4"
          >
            <FormControlLabel>
              <FormControlLabelText>Faixa Etária</FormControlLabelText>
            </FormControlLabel>
            <RadioGroup
              value={String(formData.faixa_etaria_kalacal)}
              className="gap-2"
              onChange={(selectedValue: string) => {
                const numericValue = parseInt(selectedValue, 10);
                handleValueChange("faixa_etaria_kalacal", numericValue);
              }}
            >
              {options?.faixas_etarias.map((option) => (
                <Radio key={option.value} value={String(option.value)}>
                  <RadioIndicator>
                    <RadioIcon />
                  </RadioIndicator>
                  <RadioLabel>{option.label}</RadioLabel>
                </Radio>
              ))}
            </RadioGroup>
          </FormControl>

          <View className="w-full h-[1px] bg-gray-200 my-4" />

          <FormControl isRequired isInvalid={!!errors?.modelo}>
            <FormControlLabel>
              <FormControlLabelText>Escolha o Modelo</FormControlLabelText>
            </FormControlLabel>
            <VStack space="sm">
              <Pressable
                onPress={() => handleValueChange("modelo", "clinico")}
                className={`border rounded-lg p-5 flex-row items-center ${
                  formData.modelo === "clinico"
                    ? "border-orange-600 bg-orange-500"
                    : "border-gray-200 bg-white"
                }`}
              >
                <FontAwesomeIcon
                  icon={faNotesMedical}
                  color={formData.modelo === "clinico" ? "white" : "#f97316"}
                  size={20}
                />
                <Text
                  className={`ml-3 font-semibold ${
                    formData.modelo === "clinico"
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  Usar modelo clínico
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  handleValueChange("modelo", "clinico_laboratorial")
                }
                className={`border rounded-lg p-5 flex-row items-center ${
                  formData.modelo === "clinico_laboratorial"
                    ? "border-orange-600 bg-orange-500"
                    : "border-gray-200 bg-white"
                }`}
              >
                <FontAwesomeIcon
                  icon={faMicroscope}
                  color={
                    formData.modelo === "clinico_laboratorial"
                      ? "white"
                      : "#f97316"
                  }
                  size={20}
                />
                <Text
                  className={`ml-3 font-semibold ${
                    formData.modelo === "clinico_laboratorial"
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  Usar modelo clínico e laboratorial
                </Text>
              </Pressable>
            </VStack>
          </FormControl>
          <View className="bg-[#FBF5DA] text-[#824417] px-3 py-2 rounded-md flex flex-row gap-4 mt-3">
            <View className="">
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                color="#824417"
                size={18}
              />
            </View>
            <Text className="text-[#824417] text-sm flex-1 leading-4">
              Atenção: Estas estimativas de probabilidade de óbito NÃO devem
              ser interpretadas como a chance de morte de um paciente
              específico, mas como um indicador da gravidade da doença em
              populações de pacientes semelhantes em outro local ou período.
            </Text>
          </View>
        </VStack>
      </ScrollView>
    ),
    [formData, errors, options]
  );

  const SymptomsForm = useMemo(
    () => (
      <ScrollView className="w-full mt-6">
        <VStack space="md" className="w-full">
          <FormControl isRequired isInvalid={!!errors?.sitios_sangramento}>
            <FormControlLabel>
              <FormControlLabelText>
                Número de locais de sangramento
              </FormControlLabelText>
            </FormControlLabel>
            <RadioGroup
              value={String(formData.sitios_sangramento)}
              className="gap-2"
              onChange={(selectedValue: string) => {
                const numericValue = parseInt(selectedValue, 10);
                handleValueChange("sitios_sangramento", numericValue);
              }}
            >
              {options?.sitios_sangramento.map((option) => (
                <Radio key={option.value} value={String(option.value)}>
                  <RadioIndicator>
                    <RadioIcon />
                  </RadioIndicator>
                  <RadioLabel>{option.label}</RadioLabel>
                </Radio>
              ))}
            </RadioGroup>
          </FormControl>

          <View className="w-full h-[1px] bg-gray-200 my-4" />

          <FormControl>
            <FormControlLabel>
              <FormControlLabelText>
                Outros sinais e sintomas
              </FormControlLabelText>
            </FormControlLabel>
            <VStack space="sm">
              {options?.sinais_clinicos.map((option) => (
                <Checkbox
                  key={option.key}
                  value={option.key}
                  isChecked={
                    formData[option.key as keyof KalacalFormData] as boolean
                  }
                  onChange={(isChecked: boolean) =>
                    handleValueChange(
                      option.key as keyof KalacalFormData,
                      isChecked
                    )
                  }
                >
                  <CheckboxIndicator>
                    <CheckboxIcon />
                  </CheckboxIndicator>
                  <CheckboxLabel>{option.label}</CheckboxLabel>
                </Checkbox>
              ))}
            </VStack>
          </FormControl>
        </VStack>
      </ScrollView>
    ),
    [formData, errors, options]
  );

  const ResultsForm = useMemo(() => {
    const selectedAgeRange = options?.faixas_etarias.find(
      (opt) => opt.value === formData.faixa_etaria_kalacal
    )?.label;

    return (
      <ScrollView className="w-full mt-6" showsVerticalScrollIndicator={false}>
        <VStack space="lg" className="w-full pb-8">
          <View className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Relatório do Paciente
            </Text>

            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600 font-medium">Ocorrencia</Text>
              <Text className="text-gray-800 font-medium">
                {apiResult?.caso_id || "Avulso"}
              </Text>
            </View>

            <View className="w-full h-[1px] bg-gray-200 my-2" />

            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600 font-medium">Faixa Etária</Text>
              <Text className="text-gray-800 font-medium">
                {selectedAgeRange || "Não especificado"}
              </Text>
            </View>

            <View className="w-full h-[1px] bg-gray-200 my-2" />

            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600 font-medium">Modelo</Text>
              <Text className="text-gray-800 font-medium capitalize">
                {apiResult?.modelo_usado || "Não especificado"}
              </Text>
            </View>

            <Text className="text-lg font-semibold text-gray-800 mt-4 mb-2">
              Resultados
            </Text>

            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600 font-medium">Interpretação</Text>
              <Text className="text-orange-500 font-bold text-lg">
                {apiResult?.interpretacao || "N/A"}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600 font-medium">Score</Text>
              <Text className="text-orange-500 font-bold text-lg">
                {apiResult?.escore || "N/A"}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600 font-medium">Score máximo</Text>
              <Text className="text-orange-500 font-bold text-lg">
                {apiResult?.escore_maximo || "N/A"}
              </Text>
            </View>

            <View className="w-full h-[1px] bg-gray-200 my-2" />

            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600 font-medium">
                Probabilidade de óbito
              </Text>
              <Text className="text-orange-500 font-bold text-xl">
                {apiResult?.probabilidade_morte + " %" || "N/A"}
              </Text>
            </View>
          </View>
        </VStack>
      </ScrollView>
    );
  }, [formData, apiResult, options]);

  switch (currentStep) {
    case 0:
      return AgeRangeForm;
    case 1:
      return SymptomsForm;
    case 2:
      return ResultsForm;
    default:
      return <Text>Formulário não encontrado</Text>;
  }
}
