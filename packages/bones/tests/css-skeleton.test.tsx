import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { useBone } from "../src/use-bone.ts";

function TextSkeleton({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return (
    <h3 data-testid="heading" {...bone("text")}>
      {loading ? undefined : "Hello World"}
    </h3>
  );
}

function MultiLineSkeleton({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return (
    <p data-testid="paragraph" {...bone("text", { lines: 3 })}>
      {loading ? undefined : "Some longer text content here."}
    </p>
  );
}

function BlockSkeleton({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return <div data-testid="block" {...bone("block")} style={{ width: 120, height: 120 }} />;
}

afterEach(cleanup);

describe("CSS skeleton classes", () => {
  test("single-line text skeleton has data-bone=text", () => {
    const { getByTestId } = render(<TextSkeleton loading={true} />);
    expect(getByTestId("heading").getAttribute("data-bone")).toBe("text");
  });

  test("multi-line skeleton has data-bone=text with --bone-lines", () => {
    const { getByTestId } = render(<MultiLineSkeleton loading={true} />);
    const el = getByTestId("paragraph") as HTMLElement;
    expect(el.style.getPropertyValue("--bone-lines")).toBe("3");
    expect(el.getAttribute("data-bone")).toBe("text");
  });

  test("block skeleton has data-bone=block", () => {
    const { getByTestId } = render(<BlockSkeleton loading={true} />);
    expect(getByTestId("block").getAttribute("data-bone")).toBe("block");
  });

  test("loaded text has no data-bone attribute", () => {
    const { getByTestId } = render(<TextSkeleton loading={false} />);
    expect(getByTestId("heading").getAttribute("data-bone")).toBeNull();
  });
});
