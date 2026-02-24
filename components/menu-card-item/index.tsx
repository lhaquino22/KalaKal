import { Text } from "@/components/ui/text";
import React from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import estilo from "./styles";

interface MenuCardItemProps {
  image: ImageSourcePropType;
  title?: string;
}

export default function MenuCardItem({ image, title }: MenuCardItemProps) {
  return (
    <View style={estilo.container}>
      <Image source={image} style={estilo.image} />
      {title && (
        <Text size="xs" style={estilo.title}>
          {title}
        </Text>
      )}
    </View>
  );
}
