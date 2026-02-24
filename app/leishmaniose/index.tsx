import { colors } from "@/commons";
import Item from "@/components/Item";
import itens from "@/components/leishmaniose/object";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";

export default function LeishmanioseScreen() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={estilo.container}>
        <View style={estilo.container}>
          <Text style={estilo.introText}>
            Informações sobre a Leishmaniose Visceral (Calazar): etiologia, vetores, sintomas e epidemiologia.
          </Text>
          <View style={estilo.content}>
            {itens.map((s) => (
              <Item
                key={s.titulo}
                showIcon={true}
                icon={s.icon}
                iconColor={colors.secondaryColor}
                style={{ margin: 0 }}
                item={{ title: s.titulo, content: s.descricao }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const estilo = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  introText: {
    fontSize: 14,
    color: "#6B7280",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
    lineHeight: 20,
  },
  content: {
    justifyContent: "center",
    flex: 1,
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});
