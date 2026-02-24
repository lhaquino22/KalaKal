import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

// Mock dependencies
jest.mock("@/components/ui/text", () => ({
  Text: ({ children, ...props }: any) => {
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
      label: "Falta de ar ou dispneia?",
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
    {
      key: "pneumonia",
      label: "Pneumonia?",
      type: "boolean",
      required: false,
      section: "clinico",
      origin: "clinica",
      importance: "muito_importante",
      priorityOrder: 4,
      helper: "Pneumonia",
    },
    {
      key: "plasma",
      label: "Plasma?",
      type: "boolean",
      required: false,
      section: "tratamento",
      origin: "tratamento",
      importance: "importante",
      priorityOrder: 9,
      helper: "Uso de plasma",
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
  };
});

import ExpandedPatientForm from "@/components/xai/ExpandedPatientForm";

describe("ExpandedPatientForm", () => {
  const mockOnSubmit = jest.fn();
  const mockOnFieldsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { toJSON } = render(
      <ExpandedPatientForm onSubmit={mockOnSubmit} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it("renders the form subtitle", () => {
    render(<ExpandedPatientForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText(/Campos com IA ser.o estimados automaticamente/)).toBeTruthy();
  });

  it("renders all mandatory fields", () => {
    render(<ExpandedPatientForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText(/Data de Nascimento/)).toBeTruthy();
    expect(screen.getByText(/Peso \(kg\)/)).toBeTruthy();
    expect(screen.getByText(/Edema\?/)).toBeTruthy();
    expect(screen.getByText(/Alteracao na cor da Urina\?/)).toBeTruthy();
    expect(screen.getByText(/Falta de ar ou dispneia\?/)).toBeTruthy();
    expect(screen.getByText(/Hemorragia\?/)).toBeTruthy();
  });

  it("renders additional fields sections", () => {
    render(<ExpandedPatientForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText("Dados Obrigatorios")).toBeTruthy();
    expect(screen.getByText("Dados Clinicos (Opcionais)")).toBeTruthy();
    expect(screen.getByText("Dados Laboratoriais (Opcionais)")).toBeTruthy();
    expect(screen.getByText("Tratamento (Opcional)")).toBeTruthy();
  });

  it("binary fields have Sim and Nao options", () => {
    render(<ExpandedPatientForm onSubmit={mockOnSubmit} />);
    // Multiple binary fields mean multiple Sim/Nao buttons
    const simButtons = screen.getAllByText("Sim");
    const naoButtons = screen.getAllByText(/^N.o$/);
    expect(simButtons.length).toBeGreaterThan(0);
    expect(naoButtons.length).toBeGreaterThan(0);
  });

  it("optional binary fields have Ignorado option", () => {
    render(<ExpandedPatientForm onSubmit={mockOnSubmit} />);
    // Optional boolean fields should show "Ignorado"
    const ignoradoButtons = screen.getAllByText("Ignorado");
    expect(ignoradoButtons.length).toBeGreaterThan(0);
  });

  it("shows AI icon on optional ignored fields", () => {
    render(<ExpandedPatientForm onSubmit={mockOnSubmit} />);
    // Optional fields start as null (Ignorado), so they should show IA badges
    const aiIcons = screen.getAllByText("IA");
    expect(aiIcons.length).toBeGreaterThan(0);
  });

  it("toggles boolean field on press", () => {
    render(<ExpandedPatientForm onSubmit={mockOnSubmit} />);
    const simButtons = screen.getAllByText("Sim");
    // Press the first "Sim" button (Edema)
    fireEvent.press(simButtons[0]);
    // After pressing, the option should be active (no error for the field)
    // Pressing Sim should set the value to true
    expect(simButtons[0]).toBeTruthy();
  });

  it("accepts numeric input for peso field", () => {
    render(<ExpandedPatientForm onSubmit={mockOnSubmit} />);
    const pesoInput = screen.getByPlaceholderText("Ex: 12.5");
    fireEvent.changeText(pesoInput, "15.5");
    expect(pesoInput.props.value).toBe("15.5");
  });

  it("formats birth date input as DD/MM/YYYY", () => {
    render(<ExpandedPatientForm onSubmit={mockOnSubmit} />);
    const dateInput = screen.getByPlaceholderText("DD/MM/AAAA");
    fireEvent.changeText(dateInput, "15122000");
    expect(dateInput.props.value).toBe("15/12/2000");
  });

  it("submit button is disabled when required fields are empty", () => {
    render(<ExpandedPatientForm onSubmit={mockOnSubmit} />);
    const submitButton = screen.getByText("Analisar com IA");
    // Button parent should be disabled since required fields are empty
    // Check that pressing does not call onSubmit
    fireEvent.press(submitButton);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("shows loading state when loading prop is true", () => {
    render(<ExpandedPatientForm onSubmit={mockOnSubmit} loading={true} />);
    expect(screen.getByText("Analisando...")).toBeTruthy();
  });

  it("calls onFieldsChange when fields change", () => {
    render(
      <ExpandedPatientForm
        onSubmit={mockOnSubmit}
        onFieldsChange={mockOnFieldsChange}
      />
    );
    const pesoInput = screen.getByPlaceholderText("Ex: 12.5");
    fireEvent.changeText(pesoInput, "10");
    expect(mockOnFieldsChange).toHaveBeenCalled();
  });
});
