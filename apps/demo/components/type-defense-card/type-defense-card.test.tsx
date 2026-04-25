import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { TypeDefenseCard } from "./type-defense-card";

vi.mock("bones", async () => (await import("@/test/mocks")).bonesWithDataMockFactory());

afterEach(cleanup);

const typeDefense = {
  weakTo: [
    { type: "fire", multiplier: 2 },
    { type: "psychic", multiplier: 2 },
  ],
  resistantTo: [
    { type: "water", multiplier: 0.5 },
    { type: "grass", multiplier: 0.25 },
  ],
  neutral: ["normal", "rock"],
  immuneTo: [],
};

describe("TypeDefenseCard", () => {
  test("renders weak to types with multipliers", () => {
    render(<TypeDefenseCard typeDefense={typeDefense} />);
    expect(screen.getAllByText(/fire/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2x/).length).toBeGreaterThan(0);
  });

  test("renders resistant to types", () => {
    render(<TypeDefenseCard typeDefense={typeDefense} />);
    expect(screen.getByText(/water/i)).toBeDefined();
  });

  test("renders neutral types", () => {
    render(<TypeDefenseCard typeDefense={typeDefense} />);
    expect(screen.getByText(/normal/i)).toBeDefined();
    expect(screen.getByText(/rock/i)).toBeDefined();
  });

  test("renders immune section when applicable", () => {
    const withImmunity = {
      ...typeDefense,
      immuneTo: ["ghost"],
    };
    render(<TypeDefenseCard typeDefense={withImmunity} />);
    expect(screen.getByText(/ghost/i)).toBeDefined();
    expect(screen.getByText("Immune to")).toBeDefined();
  });
});
