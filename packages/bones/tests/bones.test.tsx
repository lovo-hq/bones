import { cleanup, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { Bones } from "../src/bones.tsx";
import { useBone } from "../src/use-bone.ts";

const mockData = { name: "Pikachu" };

function TestCard({ data }: { data?: typeof mockData }) {
  const { bone, data: gated } = useBone(data);
  return (
    <span data-testid="target" {...bone("text")}>
      {gated?.name}
    </span>
  );
}

afterEach(cleanup);

describe("Bones streaming mode", () => {
  test("shows skeleton while promise is pending", async () => {
    let resolve!: (value: typeof mockData) => void;
    const promise = new Promise<typeof mockData>((r) => {
      resolve = r;
    });

    await act(async () => {
      render(
        <Bones value={promise}>
          {(data: typeof mockData | undefined) => <TestCard data={data} />}
        </Bones>,
      );
    });

    expect(screen.getByTestId("target").getAttribute("data-bone")).toBe("text");
    expect(screen.getByTestId("target").textContent).toBe("");

    await act(async () => {
      resolve(mockData);
    });

    expect(screen.getByTestId("target").getAttribute("data-bone")).toBeNull();
    expect(screen.getByTestId("target").textContent).toBe("Pikachu");
  });

  test("renders content immediately when value is not a promise", () => {
    render(
      <Bones value={mockData}>
        {(data: typeof mockData | undefined) => <TestCard data={data} />}
      </Bones>,
    );

    expect(screen.getByTestId("target").getAttribute("data-bone")).toBeNull();
    expect(screen.getByTestId("target").textContent).toBe("Pikachu");
  });

  test("handles array of streamables", async () => {
    let resolve1!: (v: { name: string }) => void;
    let resolve2!: (v: { type: string }) => void;
    const p1 = new Promise<{ name: string }>((r) => {
      resolve1 = r;
    });
    const p2 = new Promise<{ type: string }>((r) => {
      resolve2 = r;
    });

    function TestMulti({ data }: { data?: [{ name: string }, { type: string }] }) {
      const { bone, data: gated } = useBone(data);
      return (
        <div data-testid="multi" {...bone("text")}>
          {gated ? `${gated[0].name}-${gated[1].type}` : ""}
        </div>
      );
    }

    await act(async () => {
      render(
        <Bones value={[p1, p2]}>
          {(data: [{ name: string }, { type: string }] | undefined) => <TestMulti data={data} />}
        </Bones>,
      );
    });

    expect(screen.getByTestId("multi").getAttribute("data-bone")).toBe("text");

    await act(async () => {
      resolve1({ name: "Pikachu" });
      resolve2({ type: "electric" });
    });

    expect(screen.getByTestId("multi").getAttribute("data-bone")).toBeNull();
    expect(screen.getByTestId("multi").textContent).toBe("Pikachu-electric");
  });
});

describe("Bones forced mode", () => {
  test("forces skeleton state even when data is provided", () => {
    render(
      <Bones forced>
        <TestCard data={mockData} />
      </Bones>,
    );

    expect(screen.getByTestId("target").getAttribute("data-bone")).toBe("text");
    expect(screen.getByTestId("target").textContent).toBe("");
  });

  test("applies theme custom properties", () => {
    const { container } = render(
      <Bones forced baseColor="#ff0000">
        <TestCard data={mockData} />
      </Bones>,
    );

    const wrapper = container.querySelector("[style]") as HTMLElement;
    expect(wrapper.style.getPropertyValue("--bone-base")).toBe("#ff0000");
  });
});
