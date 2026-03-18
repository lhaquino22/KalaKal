import "@/global.css";
import { Stack } from "expo-router";
import React from "react";

export default function OcorrenciasLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          title: "Ocorrências",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Mapeamento dos Casos",
          }}
        />
        <Stack.Screen
          name="criar/index"
          options={{
            title: "Criar Ocorrência",
          }}
        />
        <Stack.Screen
          name="editar/[id]/index"
          options={{
            title: "Editar Ocorrência",
          }}
        />
        <Stack.Screen
          name="[id]/index"
          options={{
            title: "Detalhes da Ocorrência",
          }}
        />
      </Stack>
    </>
  );
}
