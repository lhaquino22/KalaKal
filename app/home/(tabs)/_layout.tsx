import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";

export default function TabLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#ff6633",
          headerShown: false,
          tabBarInactiveTintColor: "lightgray",
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="menu/index"
          options={{
            title: "Menu",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="home" size={25} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="conta/index"
          options={{
            title: "Meu Perfil",
            headerShown: true,
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user" size={25} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
