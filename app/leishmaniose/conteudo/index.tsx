import style from "@/components/conteudo/style";
import Text from "@/components/Text";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";

const taxonomia = [
  { label: "Ordem", value: "Kinetoplastida" },
  { label: "Família", value: "Trypanosomatidae" },
  { label: "Gênero", value: "Leishmania" },
  { label: "Complexo", value: "L. donovani" },
  { label: "Espécies", value: "L. chagasi, L. donovani, L. infantum" },
];

export default function ConteudoScreen() {
  const { content, title } = useLocalSearchParams<{
    content: string;
    title: string;
  }>();

  return (
    <ScrollView style={style.container}>
      <View style={style.content}>
        <Text style={style.text}>{content}</Text>

        {title === "Agente Etiológico" && (
          <View style={style.taxonomyContainer}>
            <Text style={style.taxonomyTitle}>Classificação Taxonômica</Text>
            {taxonomia.map((item, index) => (
              <View
                key={item.label}
                style={[
                  style.taxonomyRow,
                  index < taxonomia.length - 1 && style.taxonomyRowBorder,
                ]}
              >
                <Text style={style.taxonomyLabel}>{item.label}</Text>
                <Text style={style.taxonomyValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
