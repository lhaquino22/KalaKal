import React from "react";
import { render, screen } from "@testing-library/react-native";

// Mock @/components/ui/button
jest.mock("@/components/ui/button", () => {
  const RN = require("react-native");
  const mockReact = require("react");
  return {
    Button: ({ children, onPress, ...props }: any) =>
      mockReact.createElement(
        RN.TouchableOpacity,
        { onPress, testID: "continue-button", accessibilityRole: "button", ...props },
        children
      ),
    ButtonText: ({ children, ...props }: any) =>
      mockReact.createElement(RN.Text, props, children),
  };
});

import WelcomeScreen from "@/app/index";

describe("WelcomeScreen", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<WelcomeScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays "Bem Vindo!" text', () => {
    render(<WelcomeScreen />);
    expect(screen.getByText("Bem Vindo!")).toBeTruthy();
  });

  it('displays the "Continuar" button', () => {
    render(<WelcomeScreen />);
    expect(screen.getByText("Continuar")).toBeTruthy();
  });

  it("uses safe area insets for padding (not hardcoded values)", () => {
    const { toJSON } = render(<WelcomeScreen />);
    const json = JSON.stringify(toJSON());

    // Mock insets.top = 47, so paddingTop should be 47 + 40 = 87
    expect(json).toContain('"paddingTop":87');
    // Mock insets.bottom = 34, so paddingBottom should be 34 + 20 = 54
    expect(json).toContain('"paddingBottom":54');
  });

  it('uses justifyContent "space-between" layout', () => {
    const { toJSON } = render(<WelcomeScreen />);
    const json = JSON.stringify(toJSON());

    expect(json).toContain('"justifyContent":"space-between"');
  });
});
