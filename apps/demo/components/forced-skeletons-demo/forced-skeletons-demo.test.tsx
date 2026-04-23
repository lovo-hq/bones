import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { ForcedSkeletonsDemo } from "./forced-skeletons-demo";

vi.mock("bones", () => ({
  createBones: <T,>(data: T) => ({
    bone: () => ({}),
    data: data ?? undefined,
    repeat: <U,>(arr: U[] | undefined, count: number): (U | undefined)[] =>
      arr ?? Array.from({ length: count }, () => undefined),
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

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
