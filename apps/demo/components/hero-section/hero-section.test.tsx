import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { HeroSection } from "./hero-section";

afterEach(cleanup);

describe("HeroSection", () => {
  test("renders the Bones heading", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("bones");
  });

  test("renders the subtitle text", () => {
    render(<HeroSection />);
    expect(screen.getByText(/Skeleton loaders designed for React Server Components/)).toBeDefined();
  });
});
