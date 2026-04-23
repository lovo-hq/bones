import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { DemoSection } from "./demo-section";

afterEach(cleanup);

describe("DemoSection", () => {
  test("renders a section element", () => {
    const { container } = render(
      <DemoSection title="Title" description="Desc">
        <p>Content</p>
      </DemoSection>,
    );
    expect(container.querySelector("section")).not.toBeNull();
  });

  test("renders SectionHeader with title and description", () => {
    render(
      <DemoSection title="My Section" description="My description">
        <p>Content</p>
      </DemoSection>,
    );
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("My Section");
    expect(screen.getByText("My description")).toBeDefined();
  });

  test("passes hint to SectionHeader", () => {
    render(
      <DemoSection title="Title" description="Desc" hint="A hint">
        <p>Content</p>
      </DemoSection>,
    );
    expect(screen.getByText("A hint")).toBeDefined();
  });

  test("renders children after the header", () => {
    render(
      <DemoSection title="Title" description="Desc">
        <p>Demo content here</p>
      </DemoSection>,
    );
    expect(screen.getByText("Demo content here")).toBeDefined();
  });
});
