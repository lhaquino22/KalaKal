import { Text } from "@/components/ui/text";
import React, { Component } from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import estilo from "./styles";

interface MenuCardItemProps {
  image: ImageSourcePropType;
  title?: string;
}

export default class MenuCardItem extends Component<MenuCardItemProps> {
  render() {
    const { image, title } = this.props;
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
}
