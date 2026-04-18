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
  return (
    <div
      data-testid="block"
      {...bone("block")}
      style={{ width: 120, height: 120 }}
    />
  );
}

afterEach(cleanup);

describe("CSS skeleton classes", () => {
  test("single-line text skeleton has bone-text class", () => {
    const { getByTestId } = render(<TextSkeleton loading={true} />);
    expect(getByTestId("heading").classList.contains("bone-text")).toBe(true);
  });

  test("multi-line skeleton has bone-text class with --bone-lines", () => {
    const { getByTestId } = render(<MultiLineSkeleton loading={true} />);
    const el = getByTestId("paragraph") as HTMLElement;
    expect(el.style.getPropertyValue("--bone-lines")).toBe("3");
    expect(el.classList.contains("bone-text")).toBe(true);
  });

  test("block skeleton has bone-block class", () => {
    const { getByTestId } = render(<BlockSkeleton loading={true} />);
    expect(getByTestId("block").classList.contains("bone-block")).toBe(true);
  });

  test("loaded text has no skeleton class", () => {
    const { getByTestId } = render(<TextSkeleton loading={false} />);
    expect(getByTestId("heading").classList.contains("bone-text")).toBe(false);
  });
});
