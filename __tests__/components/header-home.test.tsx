import React from "react";
import { render } from "@testing-library/react-native";
import HeaderHome from "@/components/header/header-home";

describe("HeaderHome", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<HeaderHome />);
    expect(toJSON()).toBeTruthy();
  });

  it("is a function component (not class component)", () => {
    expect(typeof HeaderHome).toBe("function");
    expect(HeaderHome.prototype?.render).toBeUndefined();
  });

  it("uses safe area insets for top positioning (not hardcoded 40)", () => {
    const { toJSON } = render(<HeaderHome />);
    const json = JSON.stringify(toJSON());

    // Mock insets.top = 47, so topOffset = 47 + 10 = 57
    // The rendered output should contain top:57 but NOT top:40
    expect(json).toContain('"top":57');
    expect(json).not.toMatch(/"top"\s*:\s*40[^0-9]/);
  });
});
