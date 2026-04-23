import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { ThemingDemo } from "./theming-demo";

vi.mock("bones", () => ({
  createBones: () => ({
    bone: () => ({}),
    repeat: <T,>(arr: T[] | undefined, count: number): (T | undefined)[] =>
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

describe("ThemingDemo", () => {
  test("renders the section title", () => {
    render(<ThemingDemo />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Theming");
  });

  test("renders Warm, Cool, and Dark theme labels", () => {
    render(<ThemingDemo />);
    expect(screen.getByText("Warm")).toBeDefined();
    expect(screen.getByText("Cool")).toBeDefined();
    expect(screen.getByText("Dark")).toBeDefined();
  });

  test("renders three theme containers", () => {
    const { container } = render(<ThemingDemo />);
    const headings = container.querySelectorAll("h3");
    expect(headings.length).toBe(3);
  });
});
