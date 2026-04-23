import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { SectionHeader } from "./section-header";

afterEach(cleanup);

describe("SectionHeader", () => {
  test("renders title as h2", () => {
    render(<SectionHeader title="My Title" description="My desc" />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).toBe("My Title");
  });

  test("renders description", () => {
    render(<SectionHeader title="Title" description="Some description" />);
    expect(screen.getByText("Some description")).toBeDefined();
  });

  test("renders description with inline JSX", () => {
    render(
      <SectionHeader
        title="Title"
        description={
          <>
            Use <code>bone()</code> for skeletons.
          </>
        }
      />,
    );
    expect(screen.getByText("bone()")).toBeDefined();
  });

  test("renders hint when provided", () => {
    render(
      <SectionHeader title="Title" description="Desc" hint="Refresh the page" />,
    );
    expect(screen.getByText("Refresh the page")).toBeDefined();
  });

  test("does not render hint element when hint is omitted", () => {
    const { container } = render(
      <SectionHeader title="Title" description="Desc" />,
    );
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs.length).toBe(1);
  });
});
