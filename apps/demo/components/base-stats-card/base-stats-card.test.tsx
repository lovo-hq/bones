import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { BaseStatsCard } from "./base-stats-card";

vi.mock("bones", async () => (await import("@/test/mocks")).bonesWithDataMockFactory());

afterEach(cleanup);

const pokemon = {
  id: 1,
  name: "bulbasaur",
  sprite: "",
  artwork: "",
  types: [],
  height: 7,
  weight: 69,
  baseExperience: 64,
  stats: [
    { name: "hp", value: 45, effort: 0 },
    { name: "attack", value: 49, effort: 0 },
    { name: "defense", value: 49, effort: 0 },
    { name: "special-attack", value: 65, effort: 1 },
    { name: "special-defense", value: 65, effort: 0 },
    { name: "speed", value: 45, effort: 0 },
  ],
  moves: [],
};

describe("BaseStatsCard", () => {
  test("renders all 6 stat names", () => {
    render(<BaseStatsCard pokemon={pokemon} />);
    expect(screen.getByText("hp")).toBeDefined();
    expect(screen.getByText("attack")).toBeDefined();
    expect(screen.getByText("defense")).toBeDefined();
    expect(screen.getByText("special-attack")).toBeDefined();
    expect(screen.getByText("special-defense")).toBeDefined();
    expect(screen.getByText("speed")).toBeDefined();
  });

  test("renders stat values", () => {
    render(<BaseStatsCard pokemon={pokemon} />);
    expect(screen.getByText("45")).toBeDefined();
    expect(screen.getByText("49")).toBeDefined();
    expect(screen.getByText("65")).toBeDefined();
  });

  test("renders total", () => {
    render(<BaseStatsCard pokemon={pokemon} />);
    expect(screen.getByText("318")).toBeDefined();
  });
});
