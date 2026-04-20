import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { useBone } from "../src/use-bone.ts";
import { Bones } from "../src/bones.tsx";

const mockData = { name: "Pikachu" };

function TestText({ data }: { data?: typeof mockData }) {
  const { bone } = useBone(data);
  return <span data-testid="target" {...bone("text")} />;
}

function TestBlock({ data }: { data?: typeof mockData }) {
  const { bone } = useBone(data);
  return <div data-testid="target" {...bone("block")} />;
}

function TestLength({ data }: { data?: typeof mockData }) {
  const { bone } = useBone(data);
  return <span data-testid="target" {...bone("text", { length: 12 })} />;
}

function TestMultiline({ data }: { data?: typeof mockData }) {
  const { bone } = useBone(data);
  return <p data-testid="target" {...bone("text", { lines: 3 })} />;
}

function TestContainer({ data }: { data?: typeof mockData }) {
  const { bone } = useBone(data);
  return (
    <div data-testid="target" {...bone("container")}>
      <span {...bone("text")}>child</span>
    </div>
  );
}

function TestData({ data }: { data?: typeof mockData }) {
  const { bone, data: gated } = useBone(data);
  return (
    <span data-testid="target" {...bone("text")}>
      {gated?.name}
    </span>
  );
}

const mockListData = { name: "Pikachu", types: ["electric"] };

function TestRepeat({ data }: { data?: typeof mockListData }) {
  const { bone, repeat } = useBone(data);
  return (
    <div data-testid="target">
      {repeat(data?.types, 2).map((type, i) => (
        <span key={type || i} {...bone("text")}>
          {type}
        </span>
      ))}
    </div>
  );
}

afterEach(cleanup);

describe("useBone", () => {
  test("returns data-bone=text and aria-busy when loading", () => {
    const { getByTestId } = render(<TestText />);
    const el = getByTestId("target");
    expect(el.getAttribute("data-bone")).toBe("text");
    expect(el.getAttribute("aria-busy")).toBe("true");
  });

  test("returns data-bone=block and aria-busy when loading", () => {
    const { getByTestId } = render(<TestBlock />);
    const el = getByTestId("target");
    expect(el.getAttribute("data-bone")).toBe("block");
    expect(el.getAttribute("aria-busy")).toBe("true");
  });

  test("returns data-bone=container and aria-busy when loading", () => {
    const { getByTestId } = render(<TestContainer />);
    const el = getByTestId("target");
    expect(el.getAttribute("data-bone")).toBe("container");
    expect(el.getAttribute("aria-busy")).toBe("true");
  });

  test("container does not set src", () => {
    const { getByTestId } = render(<TestContainer />);
    const el = getByTestId("target");
    expect(el.getAttribute("src")).toBeNull();
  });

  test("returns empty props when data is available", () => {
    const { getByTestId } = render(<TestText data={mockData} />);
    const el = getByTestId("target");
    expect(el.getAttribute("data-bone")).toBeNull();
    expect(el.getAttribute("aria-busy")).toBeNull();
  });

  test("sets --bone-length CSS variable for text with length", () => {
    const { getByTestId } = render(<TestLength />);
    const el = getByTestId("target") as HTMLElement;
    expect(el.getAttribute("data-bone")).toBe("text");
    expect(el.style.getPropertyValue("--bone-length")).toBe("12");
  });

  test("does not set --bone-length when data is available", () => {
    const { getByTestId } = render(<TestLength data={mockData} />);
    const el = getByTestId("target") as HTMLElement;
    expect(el.style.getPropertyValue("--bone-length")).toBe("");
  });

  test("sets --bone-lines CSS variable for multiline text", () => {
    const { getByTestId } = render(<TestMultiline />);
    const el = getByTestId("target") as HTMLElement;
    expect(el.getAttribute("data-bone")).toBe("text");
    expect(el.style.getPropertyValue("--bone-lines")).toBe("3");
  });

  test("sets --bone-shadows CSS variable for multiline text", () => {
    const { getByTestId } = render(<TestMultiline />);
    const el = getByTestId("target") as HTMLElement;
    expect(el.style.getPropertyValue("--bone-shadows")).toBe(
      "0 calc(1lh * 1) 0 0 var(--bone-base)",
    );
  });

  test("does not set --bone-lines when data is available", () => {
    const { getByTestId } = render(<TestMultiline data={mockData} />);
    const el = getByTestId("target") as HTMLElement;
    expect(el.style.getPropertyValue("--bone-lines")).toBe("");
  });

  test("returns skeleton props inside Bones provider even when data is available", () => {
    const { getByTestId } = render(
      <Bones forced>
        <TestText data={mockData} />
      </Bones>,
    );
    const el = getByTestId("target");
    expect(el.getAttribute("data-bone")).toBe("text");
    expect(el.getAttribute("aria-busy")).toBe("true");
  });

  test("gates data to undefined when loading", () => {
    const { getByTestId } = render(<TestData />);
    const el = getByTestId("target");
    expect(el.textContent).toBe("");
  });

  test("passes data through when available", () => {
    const { getByTestId } = render(<TestData data={mockData} />);
    const el = getByTestId("target");
    expect(el.textContent).toBe("Pikachu");
  });

  test("gates data to undefined inside Bones provider even when data is available", () => {
    const { getByTestId } = render(
      <Bones forced>
        <TestData data={mockData} />
      </Bones>,
    );
    const el = getByTestId("target");
    expect(el.textContent).toBe("");
  });

  test("repeat returns placeholder array of given count when loading", () => {
    const { getByTestId } = render(<TestRepeat />);
    const el = getByTestId("target");
    expect(el.children).toHaveLength(2);
    for (const child of el.children) {
      expect(child.getAttribute("data-bone")).toBe("text");
    }
  });

  test("repeat returns actual array when data is available", () => {
    const { getByTestId } = render(<TestRepeat data={mockListData} />);
    const el = getByTestId("target");
    expect(el.children).toHaveLength(1);
    expect(el.children[0].textContent).toBe("electric");
  });

  test("repeat returns placeholder array inside Bones provider even when data is available", () => {
    const { getByTestId } = render(
      <Bones forced>
        <TestRepeat data={mockListData} />
      </Bones>,
    );
    const el = getByTestId("target");
    expect(el.children).toHaveLength(2);
  });
});
