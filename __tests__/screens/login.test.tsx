import React from "react";
import { Platform } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";

// Mock styles
jest.mock("@/components/login/styles", () => ({
  __esModule: true,
  default: {
    image: { flex: 1 },
    logo: { width: 200, height: 200 },
    inputContainer: { width: "100%" },
    textInput: { borderWidth: 1, padding: 10, color: "#fff" },
    buttonsContainer: { marginTop: 20 },
    buttons: { width: 150, height: 50 },
  },
}));

// Mock Loading component
jest.mock("@/components/ui/loading/loader", () => ({
  __esModule: true,
  default: () => null,
}));

// Mock useAuth hook
const mockLogin = jest.fn();
jest.mock("@/hooks/useAPI", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

import EntrarScreen from "@/app/auth/login/index";

describe("LoginScreen (EntrarScreen)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { toJSON } = render(<EntrarScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders username and password fields", () => {
    render(<EntrarScreen />);

    expect(screen.getByPlaceholderText("Usuário")).toBeTruthy();
    expect(screen.getByPlaceholderText("Senha")).toBeTruthy();
  });

  it("has KeyboardAvoidingView with correct behavior (not height)", () => {
    const { toJSON } = render(<EntrarScreen />);
    const json = JSON.stringify(toJSON());

    // behavior="height" causes visual glitches - must NOT be used
    expect(json).not.toContain('"behavior":"height"');
  });

  it("updates username on text change", () => {
    render(<EntrarScreen />);

    const usernameInput = screen.getByPlaceholderText("Usuário");
    fireEvent.changeText(usernameInput, "myuser");

    expect(usernameInput.props.value).toBe("myuser");
  });

  it("updates password on text change", () => {
    render(<EntrarScreen />);

    const passwordInput = screen.getByPlaceholderText("Senha");
    fireEvent.changeText(passwordInput, "secret123");

    expect(passwordInput.props.value).toBe("secret123");
  });

  it("has password field with secureTextEntry", () => {
    render(<EntrarScreen />);

    const passwordInput = screen.getByPlaceholderText("Senha");
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('renders "Esqueci minha senha" link', () => {
    render(<EntrarScreen />);
    expect(screen.getByText("Esqueci minha senha")).toBeTruthy();
  });

  it('renders "Reativar conta desativada" link', () => {
    render(<EntrarScreen />);
    expect(screen.getByText("Reativar conta desativada")).toBeTruthy();
  });
});
