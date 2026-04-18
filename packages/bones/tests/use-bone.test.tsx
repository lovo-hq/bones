import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { useBone, type BoneOptions } from "../src/use-bone.ts";
import { Bones } from "../src/bones.tsx";

function TestComponent({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  const props = bone();
  return <div data-testid="target" {...props} />;
}

function TestComponentWithOptions({
  loading,
  options,
}: {
  loading: boolean;
  options: BoneOptions;
}) {
  const bone = useBone(loading);
  const props = bone(options);
  return <div data-testid="target" {...props} />;
}

afterEach(cleanup);

describe("useBone", () => {
  test("returns skeleton props when loading is true", () => {
    const { getByTestId } = render(<TestComponent loading={true} />);
    const el = getByTestId("target");
    expect(el.classList.contains("bone-placeholder")).toBe(true);
    expect(el.getAttribute("aria-busy")).toBe("true");
  });

  test("returns empty props when loading is false", () => {
    const { getByTestId } = render(<TestComponent loading={false} />);
    const el = getByTestId("target");
    expect(el.classList.contains("bone-placeholder")).toBe(false);
    expect(el.getAttribute("aria-busy")).toBeNull();
  });

  test("returns skeleton props inside Bones provider even when loading is false", () => {
    const { getByTestId } = render(
      <Bones>
        <TestComponent loading={false} />
      </Bones>,
    );
    const el = getByTestId("target");
    expect(el.classList.contains("bone-placeholder")).toBe(true);
    expect(el.getAttribute("aria-busy")).toBe("true");
  });

  test("passes width and height as inline styles when loading", () => {
    const { getByTestId } = render(
      <TestComponentWithOptions loading={true} options={{ width: "20ch", height: "1ex" }} />,
    );
    const el = getByTestId("target") as HTMLElement;
    expect(el.style.width).toBe("20ch");
    expect(el.style.height).toBe("1ex");
  });

  test("applies circle border-radius when loading", () => {
    const { getByTestId } = render(
      <TestComponentWithOptions loading={true} options={{ circle: true }} />,
    );
    const el = getByTestId("target") as HTMLElement;
    expect(el.style.borderRadius).toBe("50%");
  });

  test("sets --bone-lines CSS variable for multi-line skeletons", () => {
    const { getByTestId } = render(
      <TestComponentWithOptions loading={true} options={{ lines: 3 }} />,
    );
    const el = getByTestId("target") as HTMLElement;
    expect(el.style.getPropertyValue("--bone-lines")).toBe("3");
  });

  test("does not pass options when not loading", () => {
    const { getByTestId } = render(
      <TestComponentWithOptions loading={false} options={{ width: "20ch", lines: 3 }} />,
    );
    const el = getByTestId("target") as HTMLElement;
    expect(el.style.width).toBe("");
    expect(el.style.getPropertyValue("--bone-lines")).toBe("");
  });
});
