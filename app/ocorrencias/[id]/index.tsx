import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import KalaCalAPI from "@/services/KalaCalAPI";
import { HistoricoCompletoResponse, TimelineItem } from "@/services/types";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/commons";
import dayjs from "@/lib/dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCalculator, faBrain, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

type TabFilter = "todos" | "kalacal" | "xai";

export default function OcorrenciaDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<HistoricoCompletoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>("todos");

  useEffect(() => {
    async function fetchHistorico() {
      if (!id) return;
      try {
        const response = await KalaCalAPI.getHistoricoCompleto(id);
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.error || "Erro ao carregar historico");
        }
      } catch (err) {
        setError("Erro de conexao");
      } finally {
        setLoading(false);
      }
    }
    fetchHistorico();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color={colors.mainColor} />
        <Text className="mt-2 text-gray-600">Carregando historico...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-4">
        <Text className="text-red-500 text-center mb-4">{error || "Dados nao encontrados"}</Text>
        <Button onPress={() => router.back()}>
          <ButtonText>Voltar</ButtonText>
        </Button>
      </View>
    );
  }

  const filteredTimeline = data.timeline.filter((item) => {
    if (activeTab === "todos") return true;
    return item.tipo === activeTab;
  });

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: "todos", label: "Todos", count: data.timeline.length },
    { key: "kalacal", label: "KalaCal", count: data.total_kalacal },
    { key: "xai", label: "iKalaCal", count: data.total_xai },
  ];

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 bg-gray-50" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {/* Card Resumo do Caso */}
          <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              {data.caso?.identificador || `Caso #${id}`}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {data.caso?.tipo_display && (
                <View className="bg-orange-50 px-3 py-1 rounded-full">
                  <Text className="text-orange-600 text-sm">{data.caso.tipo_display}</Text>
                </View>
              )}
              {data.caso?.municipio && (
                <View className="bg-gray-100 px-3 py-1 rounded-full">
                  <Text className="text-gray-600 text-sm">{data.caso.municipio}</Text>
                </View>
              )}
            </View>
            <View className="flex-row mt-3 gap-4">
              <View className="items-center">
                <Text className="text-2xl font-bold text-orange-500">{data.total_kalacal}</Text>
                <Text className="text-xs text-gray-500">KalaCal</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-indigo-500">{data.total_xai}</Text>
                <Text className="text-xs text-gray-500">iKalaCal</Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 items-center ${
                  activeTab === tab.key ? "bg-orange-500" : ""
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === tab.key ? "text-white" : "text-gray-600"
                  }`}
                >
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Timeline */}
          {filteredTimeline.length === 0 ? (
            <View className="py-12 items-center">
              <Text className="text-gray-400 text-center">
                Nenhum calculo encontrado para este filtro.
              </Text>
            </View>
          ) : (
            filteredTimeline.map((item, index) => (
              <TimelineCard key={`${item.tipo}-${index}`} item={item} />
            ))
          )}

          <View className="h-4" />
        </ScrollView>
      </View>
    </>
  );
}

function TimelineCard({ item }: { item: TimelineItem }) {
  const isKalacal = item.tipo === "kalacal";
  const iconColor = isKalacal ? "#f97316" : "#6366F1";
  const borderColor = isKalacal ? "border-orange-200" : "border-indigo-200";
  const badgeBg = isKalacal ? "bg-orange-50" : "bg-indigo-50";
  const badgeText = isKalacal ? "text-orange-600" : "text-indigo-600";

  return (
    <View className={`bg-white rounded-xl p-4 mb-3 border ${borderColor}`}>
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <FontAwesomeIcon
            icon={isKalacal ? faCalculator : faBrain}
            size={16}
            color={iconColor}
          />
          <View className={`px-2 py-0.5 rounded-full ${badgeBg}`}>
            <Text className={`text-xs font-medium ${badgeText}`}>
              {isKalacal ? "KalaCal" : "iKalaCal"}
            </Text>
          </View>
        </View>
        <Text className="text-xs text-gray-400">
          {dayjs(item.data).format("DD/MM/YYYY HH:mm")}
        </Text>
      </View>

      {isKalacal ? (
        <KalacalCardContent dados={item.dados} />
      ) : (
        <XaiCardContent dados={item.dados} />
      )}
    </View>
  );
}

function KalacalCardContent({ dados }: { dados: Record<string, any> }) {
  return (
    <View className="gap-1">
      <View className="flex-row justify-between">
        <Text className="text-gray-600 text-sm">Modelo</Text>
        <Text className="text-gray-800 text-sm font-medium capitalize">
          {dados.modelo_usado || "N/A"}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-gray-600 text-sm">Escore</Text>
        <Text className="text-orange-500 text-sm font-bold">
          {dados.escore ?? "N/A"} / {dados.escore_maximo ?? "13"}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-gray-600 text-sm">Probabilidade de obito</Text>
        <Text className="text-orange-500 text-base font-bold">
          {dados.probabilidade_morte != null ? `${dados.probabilidade_morte}%` : "N/A"}
        </Text>
      </View>
      {dados.interpretacao && (
        <View className="bg-orange-50 px-3 py-1.5 rounded-lg mt-1">
          <Text className="text-orange-700 text-sm">{dados.interpretacao}</Text>
        </View>
      )}
    </View>
  );
}

function XaiCardContent({ dados }: { dados: Record<string, any> }) {
  return (
    <View className="gap-1">
      <View className="flex-row justify-between">
        <Text className="text-gray-600 text-sm">Modo</Text>
        <Text className="text-gray-800 text-sm font-medium capitalize">
          {dados.modo || "padrao"}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-gray-600 text-sm">Valor predito</Text>
        <Text className="text-indigo-500 text-sm font-bold">
          {dados.valor_predito != null ? dados.valor_predito.toFixed(4) : "N/A"}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-gray-600 text-sm">Erro do modelo</Text>
        <Text className="text-gray-500 text-sm">
          {dados.erro_modelo != null ? dados.erro_modelo.toFixed(4) : "N/A"}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-gray-600 text-sm">Features</Text>
        <Text className="text-gray-500 text-sm">{dados.total_features ?? "N/A"}</Text>
      </View>
    </View>
  );
}
