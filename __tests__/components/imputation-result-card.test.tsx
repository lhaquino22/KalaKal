import React from "react";
import { render, screen } from "@testing-library/react-native";

// Mock dependencies
jest.mock("@/components/ui/text", () => ({
  Text: ({ children, ...props }: any) => {
    const RN = require("react-native");
    return <RN.Text {...props}>{children}</RN.Text>;
  },
}));

jest.mock("@/constants/modelsConfig", () => ({
  EXPANDED_FIELDS: [
    { key: "aids", label: "AIDS", type: "boolean" },
    { key: "plaque", label: "Plaquetas", type: "number" },
    { key: "leuco", label: "Leucocitos", type: "number" },
    { key: "pneumonia", label: "Pneumonia?", type: "boolean" },
    { key: "sepse", label: "Sepse?", type: "boolean" },
    { key: "ast", label: "AST", type: "number" },
    { key: "urina", label: "Urina?", type: "boolean" },
  ],
}));

import ImputationResultCard from "@/components/xai/ImputationResultCard";

describe("ImputationResultCard", () => {
  it("renders without crashing when there are imputed fields", () => {
    const { toJSON } = render(
      <ImputationResultCard
        camposInformados={{ peso: 12.5, edema: 1 }}
        camposImputados={{ aids: 0, plaque: 150 }}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it("returns null when no fields were imputed", () => {
    const { toJSON } = render(
      <ImputationResultCard
        camposInformados={{ peso: 12.5, edema: 1, aids: 0 }}
        camposImputados={{}}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it("renders the header title", () => {
    render(
      <ImputationResultCard
        camposInformados={{ peso: 12.5 }}
        camposImputados={{ aids: 0, plaque: 150 }}
      />
    );
    expect(screen.getByText("Dados Complementados por IA")).toBeTruthy();
  });

  it("renders imputed fields with IA tag", () => {
    render(
      <ImputationResultCard
        camposInformados={{ peso: 12.5 }}
        camposImputados={{ aids: 0, plaque: 150.5 }}
      />
    );
    // Should show IA tags for each imputed field
    const aiTags = screen.getAllByText("IA");
    expect(aiTags.length).toBe(2);
  });

  it("displays field labels for imputed fields", () => {
    render(
      <ImputationResultCard
        camposInformados={{ peso: 12.5 }}
        camposImputados={{ aids: 0, plaque: 150 }}
      />
    );
    expect(screen.getByText("AIDS")).toBeTruthy();
    expect(screen.getByText("Plaquetas")).toBeTruthy();
  });

  it("formats boolean imputed values as Sim/Nao", () => {
    render(
      <ImputationResultCard
        camposInformados={{ peso: 12.5 }}
        camposImputados={{ aids: 1, pneumonia: 0 }}
      />
    );
    expect(screen.getByText("Sim")).toBeTruthy();
    expect(screen.getByText(/N.o/)).toBeTruthy();
  });

  it("formats numeric imputed values correctly", () => {
    render(
      <ImputationResultCard
        camposInformados={{ peso: 12.5 }}
        camposImputados={{ plaque: 150.3 }}
      />
    );
    expect(screen.getByText("150.3")).toBeTruthy();
  });

  it("formats integer values without decimals", () => {
    render(
      <ImputationResultCard
        camposInformados={{ peso: 12.5 }}
        camposImputados={{ leuco: 6000 }}
      />
    );
    expect(screen.getByText("6000")).toBeTruthy();
  });

  it("renders the disclaimer text", () => {
    render(
      <ImputationResultCard
        camposInformados={{ peso: 12.5 }}
        camposImputados={{ aids: 0 }}
      />
    );
    expect(
      screen.getByText(/Valores estimados com base em dados estat.sticos/)
    ).toBeTruthy();
  });

  it("renders table headers", () => {
    render(
      <ImputationResultCard
        camposInformados={{ peso: 12.5 }}
        camposImputados={{ aids: 0 }}
      />
    );
    expect(screen.getByText("Campo")).toBeTruthy();
    expect(screen.getByText("Valor Estimado")).toBeTruthy();
  });

  it("handles multiple imputed fields", () => {
    render(
      <ImputationResultCard
        camposInformados={{ peso: 12.5, edema: 1 }}
        camposImputados={{
          aids: 0,
          plaque: 150,
          leuco: 6000,
          pneumonia: 1,
          sepse: 0,
        }}
      />
    );
    // 5 imputed fields should produce 5 IA tags
    const aiTags = screen.getAllByText("IA");
    expect(aiTags.length).toBe(5);
  });
});
