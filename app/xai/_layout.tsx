import "@/global.css";
import { Stack } from "expo-router";
import React from "react";

export default function XaiLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          title: "XAI - Explicabilidade",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "🧠 XAI - Explicabilidade",
          }}
        />
      </Stack>
    </>
  );
}
