import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { useBone } from "../src/use-bone.ts";
import { Bones } from "../src/bones.tsx";

function TestText({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return <span data-testid="target" {...bone("text")} />;
}

function TestBlock({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return <div data-testid="target" {...bone("block")} />;
}

function TestMultiline({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return <p data-testid="target" {...bone("text", { lines: 3 })} />;
}

afterEach(cleanup);

describe("useBone", () => {
  test("returns bone-text class and aria-busy when loading", () => {
    const { getByTestId } = render(<TestText loading={true} />);
    const el = getByTestId("target");
    expect(el.classList.contains("bone-text")).toBe(true);
    expect(el.getAttribute("aria-busy")).toBe("true");
  });

  test("returns bone-block class and aria-busy when loading", () => {
    const { getByTestId } = render(<TestBlock loading={true} />);
    const el = getByTestId("target");
    expect(el.classList.contains("bone-block")).toBe(true);
    expect(el.getAttribute("aria-busy")).toBe("true");
  });

  test("returns empty props when not loading", () => {
    const { getByTestId } = render(<TestText loading={false} />);
    const el = getByTestId("target");
    expect(el.classList.contains("bone-text")).toBe(false);
    expect(el.getAttribute("aria-busy")).toBeNull();
  });

  test("sets --bone-lines CSS variable for multiline text", () => {
    const { getByTestId } = render(<TestMultiline loading={true} />);
    const el = getByTestId("target") as HTMLElement;
    expect(el.classList.contains("bone-text")).toBe(true);
    expect(el.style.getPropertyValue("--bone-lines")).toBe("3");
  });

  test("does not set --bone-lines when not loading", () => {
    const { getByTestId } = render(<TestMultiline loading={false} />);
    const el = getByTestId("target") as HTMLElement;
    expect(el.style.getPropertyValue("--bone-lines")).toBe("");
  });

  test("returns skeleton props inside Bones provider even when loading is false", () => {
    const { getByTestId } = render(
      <Bones>
        <TestText loading={false} />
      </Bones>,
    );
    const el = getByTestId("target");
    expect(el.classList.contains("bone-text")).toBe(true);
    expect(el.getAttribute("aria-busy")).toBe("true");
  });
});
