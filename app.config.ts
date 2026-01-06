export default {
  expo: {
    name: "KalaCal",
    slug: "KalaCal",
    owner: "kalacal-dev",
    version: "0.0.3-alpha",
    orientation: "portrait",
    icon: "./assets/myIcon.png",
    scheme: "kalacal",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.miaskaleb30.KalaCal",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/myIcon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.miaskaleb30.KalaCal",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "kalacal",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "react-native-maps",
        {
          androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/splash.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "ee148428-ba1e-4f60-9e28-8c8fc962a295",
      },
    },
  },
};
