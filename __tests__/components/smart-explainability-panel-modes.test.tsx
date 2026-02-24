import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

// Mock UI components
jest.mock("@/components/ui/text", () => ({
  Text: ({ children, ...props }: any) => {
    const RN = require("react-native");
    return <RN.Text {...props}>{children}</RN.Text>;
  },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => {
    const RN = require("react-native");
    return (
      <RN.TouchableOpacity {...props}>{children}</RN.TouchableOpacity>
    );
  },
  ButtonText: ({ children, ...props }: any) => {
    const RN = require("react-native");
    return <RN.Text {...props}>{children}</RN.Text>;
  },
}));

// Mock child components
jest.mock("@/components/xai/SimpleExplicabilityForm", () => {
  const RN = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => (
      <RN.View testID="simple-form">
        <RN.Text>SimpleExplicabilityForm</RN.Text>
      </RN.View>
    ),
  };
});

jest.mock("@/components/xai/ExpandedPatientForm", () => {
  const RN = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => (
      <RN.View testID="expanded-form">
        <RN.Text>ExpandedPatientForm</RN.Text>
      </RN.View>
    ),
  };
});

jest.mock("@/components/xai/SmartExplanationResults", () => {
  const RN = require("react-native");
  return {
    __esModule: true,
    default: () => <RN.View testID="results"><RN.Text>Results</RN.Text></RN.View>,
  };
});

jest.mock("@/components/xai/SmartErrorHandler", () => {
  const RN = require("react-native");
  return {
    __esModule: true,
    default: () => <RN.View testID="error-handler"><RN.Text>Error</RN.Text></RN.View>,
  };
});

jest.mock("@/components/xai/ImputationResultCard", () => {
  const RN = require("react-native");
  return {
    __esModule: true,
    default: () => <RN.View testID="imputation-card"><RN.Text>Imputation</RN.Text></RN.View>,
  };
});

// Mock hooks
const mockStandardHook = {
  explanation: null,
  loading: false,
  error: null,
  patientData: null,
  generateExplanation: jest.fn(),
  clearExplanation: jest.fn(),
  retryExplanation: jest.fn(),
};

const mockExpandedHook = {
  mode: "padrao" as "padrao" | "assistido",
  setMode: jest.fn(),
  explanation: null,
  loading: false,
  error: null,
  patientData: null,
  suggestedVariable: null,
  generateExplanation: jest.fn(),
  clearExplanation: jest.fn(),
  retryExplanation: jest.fn(),
  updateSuggestion: jest.fn(),
};

jest.mock("@/hooks/useMultiModelExplainability", () => ({
  useSmartExplainability: () => mockStandardHook,
}));

jest.mock("@/hooks/useExpandedExplainability", () => ({
  useExpandedExplainability: () => mockExpandedHook,
  AnalysisMode: {},
}));

import SmartExplainabilityPanel from "@/components/xai/SmartExplainabilityPanel";

describe("SmartExplainabilityPanel - Mode Toggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExpandedHook.mode = "padrao";
    mockExpandedHook.explanation = null;
    mockExpandedHook.loading = false;
    mockExpandedHook.error = null;
    mockStandardHook.explanation = null;
    mockStandardHook.loading = false;
    mockStandardHook.error = null;
  });

  it("renders without crashing", () => {
    const { toJSON } = render(<SmartExplainabilityPanel />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders mode toggle with "Análise Direta" and "Análise Completa"', () => {
    render(<SmartExplainabilityPanel />);
    expect(screen.getByText(/An.lise Direta/)).toBeTruthy();
    expect(screen.getByText(/An.lise Completa/)).toBeTruthy();
  });

  it("defaults to standard mode with SimpleExplicabilityForm", () => {
    render(<SmartExplainabilityPanel />);
    expect(screen.getByTestId("simple-form")).toBeTruthy();
    expect(screen.queryByTestId("expanded-form")).toBeNull();
  });

  it("switches to assisted mode showing ExpandedPatientForm", () => {
    // Simulate switching to assisted mode
    mockExpandedHook.mode = "assistido";

    render(<SmartExplainabilityPanel />);
    expect(screen.getByTestId("expanded-form")).toBeTruthy();
    expect(screen.queryByTestId("simple-form")).toBeNull();
  });

  it("calls setMode when pressing mode toggle", () => {
    render(<SmartExplainabilityPanel />);
    const assistedButton = screen.getByText(/An.lise Completa/);
    fireEvent.press(assistedButton);
    expect(mockExpandedHook.setMode).toHaveBeenCalledWith("assistido");
  });

  it("calls clearExplanation on both hooks when switching modes", () => {
    render(<SmartExplainabilityPanel />);
    const assistedButton = screen.getByText(/An.lise Completa/);
    fireEvent.press(assistedButton);
    expect(mockStandardHook.clearExplanation).toHaveBeenCalled();
    expect(mockExpandedHook.clearExplanation).toHaveBeenCalled();
  });

  it("switches back to standard mode", () => {
    mockExpandedHook.mode = "assistido";
    render(<SmartExplainabilityPanel />);
    const standardButton = screen.getByText(/An.lise Direta/);
    fireEvent.press(standardButton);
    expect(mockExpandedHook.setMode).toHaveBeenCalledWith("padrao");
  });

  it("shows direct mode description when in standard mode", () => {
    render(<SmartExplainabilityPanel />);
    expect(
      screen.getByText(/Usa apenas os dados informados/)
    ).toBeTruthy();
  });

  it("shows complete mode description when in assisted mode", () => {
    mockExpandedHook.mode = "assistido";
    render(<SmartExplainabilityPanel />);
    expect(
      screen.getByText(/Estima dados faltantes automaticamente/)
    ).toBeTruthy();
  });

  it("shows Nova Análise button when explanation is available", () => {
    mockStandardHook.explanation = { valor_predito: 10 } as any;
    render(<SmartExplainabilityPanel />);
    expect(screen.getByText("Nova Análise")).toBeTruthy();
  });
});
