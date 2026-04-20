import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { Bones } from "../src/bones.tsx";
import { useBones } from "../src/use-bones.ts";

function TestConsumer() {
  const { isLoading } = useBones();
  return <div data-testid="status">{isLoading ? "loading" : "ready"}</div>;
}

afterEach(cleanup);

describe("useBones", () => {
  test("returns isLoading false outside of Bones provider", () => {
    render(<TestConsumer />);
    expect(screen.getByTestId("status").textContent).toBe("ready");
  });

  test("returns isLoading true inside Bones provider", () => {
    render(
      <Bones forced>
        <TestConsumer />
      </Bones>,
    );
    expect(screen.getByTestId("status").textContent).toBe("loading");
  });
});
