import "@/global.css";
import { Stack } from "expo-router";
import React from "react";

export default function XaiLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          title: "iKalaCal",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "iKalaCal",
          }}
        />
      </Stack>
    </>
  );
}
