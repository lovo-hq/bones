import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { ForcedSkeletonsDemo } from "./forced-skeletons-demo";

vi.mock("bones", async () => (await import("@/test/mocks")).bonesWithDataMockFactory());
vi.mock("next/link", async () => (await import("@/test/mocks")).nextLinkMockFactory());

afterEach(cleanup);

const pokemon = [
  { id: 1, name: "bulbasaur", sprite: "https://example.com/1.png", types: ["grass", "poison"] },
];

describe("ForcedSkeletonsDemo", () => {
  test("renders the section title", () => {
    render(<ForcedSkeletonsDemo pokemon={pokemon} />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Forced Skeletons");
  });

  test("renders the toggle button", () => {
    render(<ForcedSkeletonsDemo pokemon={pokemon} />);
    expect(screen.getByRole("button", { name: "Force Skeletons" })).toBeDefined();
  });

  test("renders pokemon names", () => {
    render(<ForcedSkeletonsDemo pokemon={pokemon} />);
    expect(screen.getByText("bulbasaur")).toBeDefined();
  });
});
