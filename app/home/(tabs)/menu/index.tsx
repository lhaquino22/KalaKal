import HeaderHome from "@/components/header/header-home";
import object from "@/components/home-screen/object";
import estilo from "@/components/home-screen/styles";
import MenuCardItem from "@/components/menu-card-item";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

export default function Menu() {
  return (
    <View style={{ backgroundColor: "#fafafa", flex: 1 }}>
      <HeaderHome />
      <View style={estilo.pad}>
        {object.map((item, index) => {
          return (
            <View style={estilo.itemsRow} key={index}>
              <TouchableOpacity
                style={estilo.fill}
                onPress={() => router.push(item[0].screen)}
              >
                <MenuCardItem image={item[0].image} title={item[0].titulo} />
              </TouchableOpacity>
              {item[1] ? (
                <TouchableOpacity
                  style={estilo.fill}
                  onPress={() => router.push(item[1].screen)}
                >
                  <MenuCardItem image={item[1].image} title={item[1].titulo} />
                </TouchableOpacity>
              ) : (
                <View style={estilo.fill} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
