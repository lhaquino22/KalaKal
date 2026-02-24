import React from "react";
import { Image, ImageBackground, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER_MAX_HEIGHT = 200;

export default function HeaderHome() {
  const insets = useSafeAreaInsets();
  const topOffset = insets.top + 10;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerBack}>
        <ImageBackground
          source={require("../../assets/images/header_back.png")}
          style={styles.image}
        />
      </View>
      <View style={[styles.headerFront, { top: topOffset }]}>
        <Image
          source={require("../../assets/images/logo_back.png")}
          style={styles.headerFrontImage}
        />
      </View>
      <View style={[styles.logoContainer, { top: topOffset }]}>
        <Image
          source={require("../../assets/images/logo_horizontal.png")}
          style={styles.logoImage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 5,
  },
  headerBack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MAX_HEIGHT,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  headerFront: {
    position: "absolute",
    left: 20,
    right: 20,
    height: 190,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  headerFrontImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  logoContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    height: 190,
    paddingHorizontal: 20,
  },
});
