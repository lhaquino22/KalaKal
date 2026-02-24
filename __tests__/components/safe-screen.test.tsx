import React from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import SafeScreen from "@/components/ui/safe-screen";

describe("SafeScreen", () => {
  it("renders children correctly", () => {
    render(
      <SafeScreen>
        <Text>Test Content</Text>
      </SafeScreen>
    );

    expect(screen.getByText("Test Content")).toBeTruthy();
  });

  it("renders with default edges (all four)", () => {
    const { UNSAFE_getByType } = render(
      <SafeScreen>
        <Text>Content</Text>
      </SafeScreen>
    );

    // SafeScreen wraps in a View (from our mock of SafeAreaView)
    // The component should render without errors with default edges
    expect(screen.getByText("Content")).toBeTruthy();
  });

  it("accepts custom edges without crashing", () => {
    render(
      <SafeScreen edges={["bottom"]}>
        <Text>Bottom Only</Text>
      </SafeScreen>
    );

    expect(screen.getByText("Bottom Only")).toBeTruthy();
  });

  it("accepts custom styles", () => {
    render(
      <SafeScreen style={{ backgroundColor: "red" }}>
        <Text>Styled</Text>
      </SafeScreen>
    );

    expect(screen.getByText("Styled")).toBeTruthy();
  });

  it("is a function component", () => {
    expect(typeof SafeScreen).toBe("function");
    expect(SafeScreen.prototype?.render).toBeUndefined();
  });
});
