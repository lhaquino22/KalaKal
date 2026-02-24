import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";

// Mock UI components
jest.mock("@/components/ui/text", () => ({
  Text: ({ children, ...props }: any) => {
    const RN = require("react-native");
    return <RN.Text {...props}>{children}</RN.Text>;
  },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onPress, ...props }: any) => {
    const RN = require("react-native");
    return (
      <RN.TouchableOpacity onPress={onPress} {...props}>
        {children}
      </RN.TouchableOpacity>
    );
  },
  ButtonText: ({ children, ...props }: any) => {
    const RN = require("react-native");
    return <RN.Text {...props}>{children}</RN.Text>;
  },
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({ children, ...props }: any) => {
    const RN = require("react-native");
    return <RN.View {...props}>{children}</RN.View>;
  },
  InputField: (props: any) => {
    const RN = require("react-native");
    return <RN.TextInput {...props} />;
  },
}));

jest.mock("@/components/ui/loading-spinner", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/commons", () => ({
  colors: {
    mainColor: "#dc2626",
    defaultTextColor: "#333",
    disabledColor: "#ccc",
  },
}));

jest.mock("@/lib/dayjs", () => {
  const dayjs = require("dayjs");
  return { __esModule: true, default: dayjs };
});

// Mock KalaCalAPI
const mockGetXaiResultadoCompleto = jest.fn();
const mockGetXaiResultado = jest.fn();

jest.mock("@/services/KalaCalAPI", () => ({
  __esModule: true,
  default: {
    getXaiResultadoCompleto: (...args: any[]) => mockGetXaiResultadoCompleto(...args),
    getXaiResultado: (...args: any[]) => mockGetXaiResultado(...args),
  },
}));

// Mock ecalacalApi to use the same mock
jest.mock("@/services/ecalacalApi", () => {
  const actual = jest.requireActual("@/services/ecalacalApi");
  return {
    ...actual,
    __esModule: true,
  };
});

// Mock constants/modelsConfig
jest.mock("@/constants/modelsConfig", () => {
  const EXPANDED_FIELDS = [
    {
      key: "data_nascimento",
      label: "Data de Nascimento",
      type: "birthdate",
      required: true,
      section: "obrigatorio",
      origin: "clinica",
      importance: "obrigatoria",
      priorityOrder: 0,
    },
    {
      key: "peso",
      label: "Peso (kg)",
      type: "number",
      required: true,
      section: "obrigatorio",
      origin: "clinica",
      importance: "obrigatoria",
      priorityOrder: 0,
      min: 0.5,
      max: 300,
      placeholder: "Ex: 12.5",
      helper: "Peso corporal em quilogramas",
    },
    {
      key: "edema",
      label: "Edema?",
      type: "boolean",
      required: true,
      section: "obrigatorio",
      origin: "clinica",
      importance: "obrigatoria",
      priorityOrder: 0,
      helper: "Presenca de edema",
    },
    {
      key: "urina",
      label: "Alteracao na cor da Urina?",
      type: "boolean",
      required: true,
      section: "obrigatorio",
      origin: "clinica",
      importance: "obrigatoria",
      priorityOrder: 0,
      helper: "Alteracao urinaria",
    },
    {
      key: "faltadear",
      label: "Falta de ar?",
      type: "boolean",
      required: true,
      section: "obrigatorio",
      origin: "clinica",
      importance: "obrigatoria",
      priorityOrder: 0,
      helper: "Dispneia",
    },
    {
      key: "hemorragia",
      label: "Hemorragia?",
      type: "boolean",
      required: true,
      section: "obrigatorio",
      origin: "clinica",
      importance: "obrigatoria",
      priorityOrder: 0,
      helper: "Presenca de hemorragia",
    },
    {
      key: "aids",
      label: "AIDS",
      type: "boolean",
      required: false,
      section: "clinico",
      origin: "clinica",
      importance: "muito_importante",
      priorityOrder: 1,
      helper: "HIV/AIDS",
    },
    {
      key: "plaque",
      label: "Plaquetas",
      type: "number",
      required: false,
      section: "laboratorial",
      origin: "laboratorial",
      importance: "muito_importante",
      priorityOrder: 2,
      min: 0,
      max: 2000,
      placeholder: "Ex: 150",
      helper: "Contagem de plaquetas",
    },
  ];

  return {
    EXPANDED_FIELDS,
    SECTION_LABELS: {
      obrigatorio: "Dados Obrigatorios",
      clinico: "Dados Clinicos (Opcionais)",
      laboratorial: "Dados Laboratoriais (Opcionais)",
      tratamento: "Tratamento (Opcional)",
    } as Record<string, string>,
    getNextSuggestedVariable: (filledFields: Record<string, any>) => {
      const additional = EXPANDED_FIELDS.filter(
        (f: any) => !f.required && (filledFields[f.key] === null || filledFields[f.key] === undefined)
      );
      return additional.length > 0 ? additional[0] : null;
    },
    ExpandedFieldConfig: {} as any,
    MODELS_CONFIG: {},
    FIELD_CONFIG: {},
  };
});

// -- ECalacalApi tests (unit integration) --

import ECalacalApi from "@/services/ecalacalApi";

describe("ECalacalApi - Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls resultado-completo with assistido mode", async () => {
    mockGetXaiResultadoCompleto.mockResolvedValueOnce({
      success: true,
      data: {
        valor_predito: 25.3,
        erro_modelo: 5.2,
        imagem_base64: "data:image/png;base64,abc",
        variaveis: ["peso", "edema", "aids"],
        modo: "assistido",
        campos_informados: { peso: 12.5, edema: 1 },
        campos_imputados: { aids: 0, plaque: 150 },
        modelo_utilizado: "completa",
      },
    });

    const result = await ECalacalApi.gerarExplicacaoCompleta(
      { Idademeses: 48, peso: 12.5, edema: true },
      "assistido"
    );

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.modo).toBe("assistido");
    expect(result.data?.campos_imputados).toEqual({ aids: 0, plaque: 150 });
    expect(mockGetXaiResultadoCompleto).toHaveBeenCalledWith(
      expect.objectContaining({
        modo: "assistido",
        Idademeses: 48,
        peso: 12.5,
        edema: 1, // boolean converted to 0/1
      })
    );
  });

  it("calls resultado-completo with padrao mode", async () => {
    mockGetXaiResultadoCompleto.mockResolvedValueOnce({
      success: true,
      data: {
        valor_predito: 18.0,
        erro_modelo: 4.5,
        imagem_base64: null,
        variaveis: ["peso", "edema"],
        modo: "padrao",
        campos_informados: { peso: 12.5, edema: 1 },
        campos_imputados: {},
        modelo_utilizado: "clinicas",
      },
    });

    const result = await ECalacalApi.gerarExplicacaoCompleta(
      { Idademeses: 48, peso: 12.5, edema: false },
      "padrao"
    );

    expect(result.success).toBe(true);
    expect(result.data?.campos_imputados).toEqual({});
    expect(mockGetXaiResultadoCompleto).toHaveBeenCalledWith(
      expect.objectContaining({
        modo: "padrao",
        edema: 0,
      })
    );
  });

  it("sends null for ignored/empty fields", async () => {
    mockGetXaiResultadoCompleto.mockResolvedValueOnce({
      success: true,
      data: {
        valor_predito: 20,
        erro_modelo: 5,
        imagem_base64: null,
        variaveis: [],
        modo: "assistido",
        campos_informados: {},
        campos_imputados: { aids: 0 },
        modelo_utilizado: "clinicas",
      },
    });

    await ECalacalApi.gerarExplicacaoCompleta(
      { Idademeses: 48, peso: 12.5, edema: true, aids: null, plaque: undefined, leuco: "" },
      "assistido"
    );

    const sentPayload = mockGetXaiResultadoCompleto.mock.calls[0][0];
    expect(sentPayload.aids).toBeNull();
    expect(sentPayload.plaque).toBeNull();
    expect(sentPayload.leuco).toBeNull();
  });

  it("handles API error gracefully (400)", async () => {
    mockGetXaiResultadoCompleto.mockResolvedValueOnce({
      success: false,
      error: "Dados invalidos",
      status: 400,
    });

    const result = await ECalacalApi.gerarExplicacaoCompleta(
      { Idademeses: 48, peso: 12.5, edema: true },
      "padrao"
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("handles network error", async () => {
    const networkError = new Error("Network Error");
    (networkError as any).code = "ECONNABORTED";
    mockGetXaiResultadoCompleto.mockRejectedValueOnce(networkError);

    const result = await ECalacalApi.gerarExplicacaoCompleta(
      { Idademeses: 48, peso: 12.5, edema: true },
      "assistido"
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Timeout");
  });

  it("handles server error (500)", async () => {
    const serverError: any = new Error("Server Error");
    serverError.response = { status: 500, data: { message: "Internal error" } };
    mockGetXaiResultadoCompleto.mockRejectedValueOnce(serverError);

    const result = await ECalacalApi.gerarExplicacaoCompleta(
      { Idademeses: 48, peso: 12.5, edema: true },
      "assistido"
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Internal error");
  });
});

// -- useExpandedExplainability hook tests --

import { renderHook } from "@testing-library/react-native";
import { useExpandedExplainability } from "@/hooks/useExpandedExplainability";

describe("useExpandedExplainability - Hook Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with padrao mode", () => {
    const { result } = renderHook(() => useExpandedExplainability());
    expect(result.current.mode).toBe("padrao");
    expect(result.current.explanation).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("updates mode when setMode is called", () => {
    const { result } = renderHook(() => useExpandedExplainability());
    act(() => {
      result.current.setMode("assistido");
    });
    expect(result.current.mode).toBe("assistido");
  });

  it("sets loading while generating explanation", async () => {
    mockGetXaiResultadoCompleto.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                data: {
                  valor_predito: 20,
                  erro_modelo: 5,
                  imagem_base64: null,
                  variaveis: [],
                  modo: "padrao",
                  campos_informados: {},
                  campos_imputados: {},
                  modelo_utilizado: "clinicas",
                },
              }),
            100
          )
        )
    );

    const { result } = renderHook(() => useExpandedExplainability());

    let generatePromise: Promise<void>;
    act(() => {
      generatePromise = result.current.generateExplanation({
        Idademeses: 48,
        peso: 12.5,
        edema: true,
      });
    });

    // Loading should be true during generation
    expect(result.current.loading).toBe(true);

    await act(async () => {
      await generatePromise!;
    });

    expect(result.current.loading).toBe(false);
  });

  it("sets error when required fields are missing", async () => {
    const { result } = renderHook(() => useExpandedExplainability());

    await act(async () => {
      await result.current.generateExplanation({
        edema: true,
        // Missing Idademeses and peso
      });
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain("obrigat");
  });

  it("clears explanation state", async () => {
    mockGetXaiResultadoCompleto.mockResolvedValueOnce({
      success: true,
      data: {
        valor_predito: 20,
        erro_modelo: 5,
        imagem_base64: null,
        variaveis: [],
        modo: "padrao",
        campos_informados: {},
        campos_imputados: {},
        modelo_utilizado: "clinicas",
      },
    });

    const { result } = renderHook(() => useExpandedExplainability());

    await act(async () => {
      await result.current.generateExplanation({
        Idademeses: 48,
        peso: 12.5,
        edema: true,
      });
    });

    expect(result.current.explanation).not.toBeNull();

    act(() => {
      result.current.clearExplanation();
    });

    expect(result.current.explanation).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.patientData).toBeNull();
  });

  it("updates suggested variable based on filled fields", () => {
    const { result } = renderHook(() => useExpandedExplainability());

    act(() => {
      result.current.updateSuggestion({
        data_nascimento: "15/12/2000",
        peso: 12.5,
        edema: true,
      });
    });

    // Should suggest next unfilled additional variable
    expect(result.current.suggestedVariable).not.toBeNull();
  });
});
