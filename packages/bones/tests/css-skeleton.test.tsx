import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { useBone } from "../src/use-bone.ts";

function TextSkeleton({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return (
    <h3 data-testid="heading" {...bone()}>
      {loading ? undefined : "Hello World"}
    </h3>
  );
}

function MultiLineSkeleton({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return (
    <p data-testid="paragraph" {...bone({ lines: 3 })}>
      {loading ? undefined : "Some longer text content here."}
    </p>
  );
}

afterEach(cleanup);

describe("CSS skeleton classes", () => {
  test("single-line text skeleton has bone-placeholder class", () => {
    const { getByTestId } = render(<TextSkeleton loading={true} />);
    expect(getByTestId("heading").classList.contains("bone-placeholder")).toBe(true);
  });

  test("multi-line skeleton sets --bone-lines custom property", () => {
    const { getByTestId } = render(<MultiLineSkeleton loading={true} />);
    const el = getByTestId("paragraph") as HTMLElement;
    expect(el.style.getPropertyValue("--bone-lines")).toBe("3");
    expect(el.classList.contains("bone-placeholder")).toBe(true);
  });

  test("loaded text has no skeleton class", () => {
    const { getByTestId } = render(<TextSkeleton loading={false} />);
    expect(getByTestId("heading").classList.contains("bone-placeholder")).toBe(false);
  });
});
