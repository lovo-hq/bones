import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { ArticlePreview } from "./article-preview";

vi.mock("bones", () => ({
  createBones: () => ({
    bone: () => ({}),
    repeat: <T,>(arr: T[] | undefined, count: number): (T | undefined)[] =>
      arr ?? Array.from({ length: count }, () => undefined),
  }),
}));

afterEach(cleanup);

const article = {
  title: "Getting Started with React",
  excerpt: "A guide to building modern UIs",
  author: "Jane Doe",
  date: "2024-01-15",
};

describe("ArticlePreview", () => {
  test("renders title, excerpt, author, and date", () => {
    render(<ArticlePreview article={article} />);
    expect(screen.getByText("Getting Started with React")).toBeDefined();
    expect(screen.getByText("A guide to building modern UIs")).toBeDefined();
    expect(screen.getByText("Jane Doe")).toBeDefined();
    expect(screen.getByText("2024-01-15")).toBeDefined();
  });

  test("renders middot separator between author and date", () => {
    const { container } = render(<ArticlePreview article={article} />);
    expect(container.textContent).toContain("\u00b7");
  });

  test("renders empty content when no article provided", () => {
    const { container } = render(<ArticlePreview />);
    const heading = container.querySelector("h3");
    expect(heading).not.toBeNull();
    expect(heading?.textContent).toBe("");
  });
});
