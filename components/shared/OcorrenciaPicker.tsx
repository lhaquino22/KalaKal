import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "../ui/text";
import { Ocorrencia } from "../ocorrencias/types";
import KalaCalAPI from "@/services/KalaCalAPI";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";

interface OcorrenciaPickerProps {
  value?: string;
  onChange: (id?: string) => void;
}

export default function OcorrenciaPicker({ value, onChange }: OcorrenciaPickerProps) {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchOcorrencias = async () => {
    if (fetched) return;
    setLoading(true);
    try {
      const response = await KalaCalAPI.getCasos();
      if (response.success && response.data) {
        setOcorrencias(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar ocorrencias:", error);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  const handleOpen = () => {
    fetchOcorrencias();
    setModalVisible(true);
  };

  const selectedOcorrencia = ocorrencias.find((o) => String(o.id) === value);
  const displayText = selectedOcorrencia
    ? `${selectedOcorrencia.identificador} (${selectedOcorrencia.tipo_display || selectedOcorrencia.tipo_caso})`
    : "Nenhuma (calculo avulso)";

  return (
    <View>
      <TouchableOpacity
        onPress={handleOpen}
        className="bg-gray-100 rounded-lg px-4 py-3 flex-row items-center justify-between"
      >
        <Text className={`text-base ${value ? "text-gray-800" : "text-gray-400"}`}>
          {displayText}
        </Text>
        <FontAwesomeIcon icon={faChevronDown} color="#9CA3AF" size={14} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl max-h-[70%] pb-8">
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-800">
                Associar a uma Ocorrencia
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesomeIcon icon={faXmark} color="#6B7280" size={20} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#f97316" />
              </View>
            ) : (
              <ScrollView className="px-4">
                <TouchableOpacity
                  onPress={() => {
                    onChange(undefined);
                    setModalVisible(false);
                  }}
                  className={`py-3 px-3 my-1 rounded-lg ${
                    !value ? "bg-orange-50 border border-orange-300" : "bg-gray-50"
                  }`}
                >
                  <Text className={`text-base ${!value ? "text-orange-600 font-semibold" : "text-gray-600"}`}>
                    Nenhuma (calculo avulso)
                  </Text>
                </TouchableOpacity>

                {ocorrencias.map((ocorrencia) => {
                  const isSelected = String(ocorrencia.id) === value;
                  return (
                    <TouchableOpacity
                      key={ocorrencia.id}
                      onPress={() => {
                        onChange(String(ocorrencia.id));
                        setModalVisible(false);
                      }}
                      className={`py-3 px-3 my-1 rounded-lg ${
                        isSelected ? "bg-orange-50 border border-orange-300" : "bg-gray-50"
                      }`}
                    >
                      <Text className={`text-base font-medium ${isSelected ? "text-orange-600" : "text-gray-800"}`}>
                        {ocorrencia.identificador}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {ocorrencia.tipo_display || ocorrencia.tipo_caso} - {ocorrencia.municipio}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {ocorrencias.length === 0 && (
                  <View className="py-6 items-center">
                    <Text className="text-gray-400 text-center">
                      Nenhuma ocorrencia cadastrada.{"\n"}
                      O calculo sera feito de forma avulsa.
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
