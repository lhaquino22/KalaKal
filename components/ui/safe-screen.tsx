import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";

interface SafeScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}

export default function SafeScreen({
  children,
  edges = ["top", "bottom", "left", "right"],
  style,
}: SafeScreenProps) {
  return (
    <SafeAreaView style={[{ flex: 1 }, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}
