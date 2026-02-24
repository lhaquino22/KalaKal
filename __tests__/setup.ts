// Mock react-native-css-interop (NativeWind internals)
jest.mock("react-native-css-interop", () => ({
  cssInterop: jest.fn(),
  remapProps: jest.fn(),
}));

// Mock nativewind
jest.mock("nativewind", () => ({}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
  const RN = require("react-native");
  const mockReact = require("react");
  const insets = { top: 47, bottom: 34, left: 0, right: 0 };
  return {
    SafeAreaProvider: ({ children }: { children: any }) => children,
    SafeAreaView: ({ children, style, ...props }: any) =>
      mockReact.createElement(RN.View, { ...props, style }, children),
    useSafeAreaInsets: () => insets,
    initialWindowMetrics: {
      insets,
      frame: { x: 0, y: 0, width: 390, height: 844 },
    },
  };
});

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: ({ children }: { children: any }) => children,
}));

// Mock expo-status-bar
jest.mock("expo-status-bar", () => {
  const RN = require("react-native");
  return {
    StatusBar: RN.StatusBar,
  };
});

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => "Icon");

// Mock image assets (use numbers to simulate require() for images)
jest.mock("@/assets/images/background.png", () => 1);
jest.mock("@/assets/images/logo_vertical.png", () => 2);
jest.mock("@/assets/images/logo_horizontal.png", () => 3);
jest.mock("@/assets/images/login.png", () => 4);
jest.mock("@/assets/images/cadastro.png", () => 5);
jest.mock("@/assets/images/header_back.png", () => 6);
jest.mock("@/assets/images/logo_back.png", () => 7);

// Suppress console warnings in tests
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("componentWillReceiveProps") ||
      args[0].includes("act(...)"))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};
