import "@/global.css";
import { Stack } from "expo-router";
import React from "react";

export default function KalacalLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          title: "KalaCal",
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}
