import { ocorrenciaSchema } from "@/components/ocorrencias/schemas/ocorrencia-schema";
import { OcorrenciaForm, SexoOption } from "@/components/ocorrencias/types";
import KalaCalAPI from "@/services/KalaCalAPI";
import api from "@/services/KalaCalAPI";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons/faCalendarDays";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import z from "zod";

interface DropdownProps {
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder: string;
}

interface ModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  options: string[];
  currentValue: string;
  onSelect: (value: string) => void;
  title: string;
}

const toApiDateFormat = (dateString: string): string => {
  if (!dateString || !dateString.includes("/")) return dateString;
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}`;
};

const fromApiDateFormat = (dateString: string): string => {
  if (!dateString || !dateString.includes("-")) return dateString;
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

export default function EditarOcorrenciaScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<OcorrenciaForm | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [errors, setErrors] = useState<z.ZodError["formErrors"]["fieldErrors"]>(
    {}
  );
  const [showTipoCasoModal, setShowTipoCasoModal] = useState<boolean>(false);
  const [showSexoModal, setShowSexoModal] = useState<boolean>(false);
  const [showGestanteModal, setShowGestanteModal] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [dateField, setDateField] = useState<
    "data_nascimento" | "data_notificacao"
  >("data_notificacao");

  const tipoCasoOptions: ("humano" | "animal")[] = ["humano", "animal"];
  const sexoOptions: SexoOption[] = ["masculino", "feminino", "Outro"];
  const gestanteOptions: ("Sim" | "Não")[] = ["Sim", "Não"];

  useEffect(() => {
    if (!id) return;

    async function fetchOcorrencia() {
      try {
        setIsFetching(true);
        const response = await KalaCalAPI.getCaso(Number(id));
        const dadosApi = response.data;
        if (!dadosApi) {
          Alert.alert("Erro", "Dados da ocorrência não encontrados.");
          router.back();
          return;
        }
        setFormData({
          ...dadosApi,
          data_nascimento: fromApiDateFormat(dadosApi.data_nascimento),
          data_notificacao: fromApiDateFormat(dadosApi.data_notificacao),
        });
      } catch (error) {
        console.error("Erro ao buscar dados da ocorrência:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados para edição.");
        router.back();
      } finally {
        setIsFetching(false);
      }
    }

    fetchOcorrencia();
  }, [id]);

  const handleValueChange = <T extends keyof OcorrenciaForm>(
    field: T,
    value: OcorrenciaForm[T]
  ): void => {
    if (!formData) return;
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async (): Promise<void> => {
    if (!formData) return;

    const result = ocorrenciaSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      Alert.alert(
        "Erro de Validação",
        "Por favor, corrija os campos indicados."
      );
      return;
    }

    setIsLoading(true);

    const dadosParaApi = {
      ...result.data,
      data_nascimento: toApiDateFormat(result.data.data_nascimento),
      data_notificacao: toApiDateFormat(result.data.data_notificacao),
    };

    const dataAsFormData = new FormData();
    Object.entries(dadosParaApi).forEach(([key, value]) => {
      dataAsFormData.append(key, String(value));
    });

    try {
      const response = await KalaCalAPI.updateCaso(Number(id), dataAsFormData)

      if (response.status === 200) {
        Alert.alert("Sucesso!", "Ocorrência atualizada com sucesso.");
        router.back();
      }
    } catch (error) {
      console.error("Erro detalhado ao salvar:", error);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    if (dateString.includes("/")) return dateString;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dateString: string): Date => {
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return new Date(dateString);
  };

  const handleDateChange = (event: any, selectedDate?: Date): void => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate.toISOString());
      handleValueChange(dateField, formattedDate);
    }
  };

  const openDatePicker = (
    field: "data_nascimento" | "data_notificacao"
  ): void => {
    setDateField(field);
    setShowDatePicker(true);
  };

  const renderDropdown = ({
    value,
    options,
    onSelect,
    placeholder,
  }: DropdownProps): JSX.Element => (
    <View className="relative">
      <View className="bg-gray-100 rounded-lg px-4 py-3 flex-row justify-between items-center">
        <Text className="text-base text-gray-800 capitalize">
          {value || placeholder}
        </Text>
        <Text className="text-orange-500 text-lg">▼</Text>
      </View>
    </View>
  );

  const renderModal = ({
    visible,
    setVisible,
    options,
    currentValue,
    onSelect,
    title,
  }: ModalProps): JSX.Element => (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-center items-center"
        activeOpacity={1}
        onPress={() => setVisible(false)}
      >
        <View className="bg-white rounded-xl mx-8 py-4 min-w-[250px]">
          <Text className="text-lg font-semibold text-center mb-4 px-4">
            {title}
          </Text>
          {options.map((option: string, index: number) => (
            <TouchableOpacity
              key={index}
              className={`py-3 px-4 ${
                currentValue === option ? "bg-orange-100" : ""
              }`}
              onPress={() => {
                onSelect(option);
                setVisible(false);
              }}
            >
              <Text
                className={`text-base text-center capitalize ${
                  currentValue === option
                    ? "text-orange-600 font-semibold"
                    : "text-gray-800"
                }`}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (isFetching || !formData) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="orange" />
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 bg-gray-100 px-4 pt-5">
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-6">
              Dados Pessoais
            </Text>

            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-2">
                Identificador do paciente*
              </Text>
              <TextInput
                className={`bg-gray-100 rounded-lg px-4 py-3 text-base text-gray-800 ${
                  errors.identificador ? "border border-red-500" : ""
                }`}
                value={formData.identificador}
                onChangeText={(text: string) =>
                  handleValueChange("identificador", text)
                }
                placeholder="Digite o identificador"
                placeholderTextColor="#9CA3AF"
              />
              {errors.identificador && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.identificador[0]}
                </Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-2">Tipo de Caso*</Text>
              <TouchableOpacity onPress={() => setShowTipoCasoModal(true)}>
                <View
                  className={`bg-gray-100 rounded-lg ${
                    errors.tipo_caso ? "border border-red-500" : ""
                  }`}
                >
                  {renderDropdown({
                    value: formData.tipo_caso,
                    options: tipoCasoOptions,
                    onSelect: (value: string) =>
                      handleValueChange(
                        "tipo_caso",
                        value as "humano" | "animal"
                      ),
                    placeholder: "Selecione o tipo",
                  })}
                </View>
              </TouchableOpacity>
              {errors.tipo_caso && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.tipo_caso[0]}
                </Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-2">
                Data de Nascimento*
              </Text>
              <TouchableOpacity
                onPress={() => openDatePicker("data_nascimento")}
              >
                <View
                  className={`bg-gray-100 rounded-lg px-4 py-3 flex-row justify-between items-center ${
                    errors.data_nascimento ? "border border-red-500" : ""
                  }`}
                >
                  <Text className="text-base text-gray-800">
                    {formData.data_nascimento || "Selecione uma data"}
                  </Text>
                  <FontAwesomeIcon icon={faCalendarDays} />
                </View>
              </TouchableOpacity>
              {errors.data_nascimento && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.data_nascimento[0]}
                </Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-2">Sexo*</Text>
              <TouchableOpacity onPress={() => setShowSexoModal(true)}>
                <View
                  className={`bg-gray-100 rounded-lg ${
                    errors.sexo ? "border border-red-500" : ""
                  }`}
                >
                  {renderDropdown({
                    value: formData.sexo,
                    options: sexoOptions,
                    onSelect: (value: string) =>
                      handleValueChange("sexo", value),
                    placeholder: "Selecione o sexo",
                  })}
                </View>
              </TouchableOpacity>
              {errors.sexo && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.sexo[0]}
                </Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-2">
                Data da Notificação*
              </Text>
              <TouchableOpacity
                onPress={() => openDatePicker("data_notificacao")}
              >
                <View
                  className={`bg-gray-100 rounded-lg px-4 py-3 flex-row justify-between items-center ${
                    errors.data_notificacao ? "border border-red-500" : ""
                  }`}
                >
                  <Text className="text-base text-gray-800">
                    {formData.data_notificacao || "Selecione uma data"}
                  </Text>
                  <FontAwesomeIcon icon={faCalendarDays} />
                </View>
              </TouchableOpacity>
              {errors.data_notificacao && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.data_notificacao[0]}
                </Text>
              )}
            </View>

            {formData.sexo === "feminino" && (
              <View className="mb-2">
                <Text className="text-sm text-gray-600 mb-2">Gestante*</Text>
                <TouchableOpacity onPress={() => setShowGestanteModal(true)}>
                  <View
                    className={`bg-gray-100 rounded-lg ${
                      errors.gestante ? "border border-red-500" : ""
                    }`}
                  >
                    {renderDropdown({
                      value: formData.gestante ? "Sim" : "Não",
                      options: gestanteOptions,
                      onSelect: (value: string) =>
                        handleValueChange("gestante", value === "Sim"),
                      placeholder: "Selecione uma opção",
                    })}
                  </View>
                </TouchableOpacity>
                {errors.gestante && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.gestante[0]}
                  </Text>
                )}
              </View>
            )}
          </View>

          <TouchableOpacity
            className="bg-orange-500 rounded-xl py-4 mx-2 mb-8"
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text className="text-white text-lg font-bold text-center">
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={parseDate(formData[dateField])}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date("1900-01-01")}
            locale="pt-BR"
          />
        )}

        {renderModal({
          visible: showTipoCasoModal,
          setVisible: setShowTipoCasoModal,
          options: tipoCasoOptions,
          currentValue: formData.tipo_caso,
          onSelect: (value) =>
            handleValueChange("tipo_caso", value as "humano" | "animal"),
          title: "Selecionar Tipo de Caso",
        })}

        {renderModal({
          visible: showSexoModal,
          setVisible: setShowSexoModal,
          options: sexoOptions,
          currentValue: formData.sexo,
          onSelect: (value: string) => handleValueChange("sexo", value),
          title: "Selecionar Sexo",
        })}

        {renderModal({
          visible: showGestanteModal,
          setVisible: setShowGestanteModal,
          options: gestanteOptions,
          currentValue: formData.gestante ? "Sim" : "Não",
          onSelect: (value: string) =>
            handleValueChange("gestante", value === "Sim"),
          title: "Gestante",
        })}
      </View>
    </>
  );
}
