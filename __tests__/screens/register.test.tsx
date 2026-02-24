import React from "react";
import { Platform } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";

// Mock styles
jest.mock("@/components/login/styles", () => ({
  __esModule: true,
  default: {
    container: { flex: 1 },
    logo: { width: 200, height: 200 },
    inputContainer: { width: "100%" },
    textInput: { borderWidth: 1, padding: 10, color: "#fff" },
    inputError: { borderColor: "red" },
    errorText: { color: "red", fontSize: 12 },
    buttonsContainer: { marginTop: 20 },
    button: { backgroundColor: "orange", padding: 15, borderRadius: 8 },
    buttonText: { color: "#fff", textAlign: "center" },
    registerLink: { marginTop: 10 },
    registerText: { color: "#fff" },
  },
}));

// Mock Loading component
jest.mock("@/components/ui/loading/loader", () => ({
  __esModule: true,
  default: () => null,
}));

// Mock useAuth hook
const mockRegister = jest.fn();
jest.mock("@/hooks/useAPI", () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

import RegisterScreen from "@/app/auth/register/index";

describe("RegisterScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { toJSON } = render(<RegisterScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders all 6 form fields", () => {
    render(<RegisterScreen />);

    expect(screen.getByPlaceholderText("Nome de usuário")).toBeTruthy();
    expect(screen.getByPlaceholderText("E-mail")).toBeTruthy();
    expect(screen.getByPlaceholderText("Nome")).toBeTruthy();
    expect(screen.getByPlaceholderText("Sobrenome")).toBeTruthy();
    expect(screen.getByPlaceholderText("Senha")).toBeTruthy();
    expect(screen.getByPlaceholderText("Confirmar Senha")).toBeTruthy();
  });

  it("has KeyboardAvoidingView with correct behavior", () => {
    const { toJSON } = render(<RegisterScreen />);
    const json = JSON.stringify(toJSON());

    // On Android (default test env), behavior should be undefined (not "height")
    // The key thing is that "height" should NOT be in the KAV behavior
    if (Platform.OS === "android") {
      // behavior=undefined means the prop won't appear in JSON
      expect(json).not.toContain('"behavior":"height"');
    }
  });

  it("has error containers with minHeight:18 to prevent layout shifts", () => {
    const { toJSON } = render(<RegisterScreen />);
    const json = JSON.stringify(toJSON());

    // Count occurrences of minHeight:18 in rendered output
    const matches = json.match(/"minHeight":18/g);
    // Should have 6 error containers (one per field)
    expect(matches).toBeTruthy();
    expect(matches!.length).toBe(6);
  });

  it("updates username field on text change", () => {
    render(<RegisterScreen />);

    const usernameInput = screen.getByPlaceholderText("Nome de usuário");
    fireEvent.changeText(usernameInput, "testuser");

    expect(usernameInput.props.value).toBe("testuser");
  });

  it("has password fields with secureTextEntry", () => {
    render(<RegisterScreen />);

    const passwordInput = screen.getByPlaceholderText("Senha");
    const confirmInput = screen.getByPlaceholderText("Confirmar Senha");

    expect(passwordInput.props.secureTextEntry).toBe(true);
    expect(confirmInput.props.secureTextEntry).toBe(true);
  });

  it("renders the register button", () => {
    render(<RegisterScreen />);
    expect(screen.getByText("Registrar")).toBeTruthy();
  });

  it('renders "Já tem uma conta?" link', () => {
    render(<RegisterScreen />);
    expect(screen.getByText("Já tem uma conta? Faça login")).toBeTruthy();
  });
});
