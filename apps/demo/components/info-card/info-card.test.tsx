import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { InfoCard } from "./info-card";

vi.mock("bones", async () => (await import("@/test/mocks")).bonesWithDataMockFactory());

afterEach(cleanup);

describe("InfoCard", () => {
  test("renders label and key-value rows", () => {
    const rows = [
      { label: "Catch Rate", value: "45" },
      { label: "Base Exp", value: "64" },
    ];
    render(<InfoCard title="Training" labels={["Catch Rate", "Base Exp"]} rows={rows} />);
    expect(screen.getByText("Training")).toBeDefined();
    expect(screen.getByText("Catch Rate")).toBeDefined();
    expect(screen.getByText("45")).toBeDefined();
    expect(screen.getByText("Base Exp")).toBeDefined();
    expect(screen.getByText("64")).toBeDefined();
  });
});
