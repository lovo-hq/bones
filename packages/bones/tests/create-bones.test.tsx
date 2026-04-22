import { cleanup, render, screen, act } from "@testing-library/react";
import { Suspense } from "react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { createBones } from "../src/create-bones.ts";

const mockData = { name: "Pikachu" };

function TestText({ data }: { data?: typeof mockData }) {
  const { bone } = createBones(data);
  return <span data-testid="target" {...bone("text")} />;
}

function TestBlock({ data }: { data?: typeof mockData }) {
  const { bone } = createBones(data);
  return <div data-testid="target" {...bone("block")} />;
}

function TestContainer({ data }: { data?: typeof mockData }) {
  const { bone } = createBones(data);
  return (
    <div data-testid="target" {...bone("container")}>
      <span {...bone("text")}>child</span>
    </div>
  );
}

function TestLength({ data }: { data?: typeof mockData }) {
  const { bone } = createBones(data);
  return <span data-testid="target" {...bone("text", { length: 12 })} />;
}

function TestMultiline({ data }: { data?: typeof mockData }) {
  const { bone } = createBones(data);
  return <p data-testid="target" {...bone("text", { lines: 3 })} />;
}

function TestContained({ data }: { data?: typeof mockData }) {
  const { bone } = createBones(data);
  return <span data-testid="target" {...bone("text", { contained: true, length: 7 })} />;
}

function TestData({ data }: { data?: typeof mockData }) {
  const { bone, data: resolved } = createBones(data);
  return (
    <span data-testid="target" {...bone("text")}>
      {resolved?.name}
    </span>
  );
}

const mockListData = { name: "Pikachu", types: ["electric"] };

function TestRepeat({ data }: { data?: typeof mockListData }) {
  const { bone, repeat } = createBones(data);
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

describe("createBones", () => {
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

  test("sets --bone-contained CSS variable for contained text", () => {
    const { getByTestId } = render(<TestContained />);
    const el = getByTestId("target") as HTMLElement;
    expect(el.style.getPropertyValue("--bone-contained")).toBe("1");
  });

  test("data returns undefined when loading", () => {
    const { getByTestId } = render(<TestData />);
    const el = getByTestId("target");
    expect(el.textContent).toBe("");
  });

  test("data returns resolved value when available", () => {
    const { getByTestId } = render(<TestData data={mockData} />);
    const el = getByTestId("target");
    expect(el.textContent).toBe("Pikachu");
  });

  test("repeat returns placeholder array when loading", () => {
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

  test("empty array is treated as loaded", () => {
    const emptyData = { name: "Pikachu", types: [] as string[] };
    const { getByTestId } = render(<TestRepeat data={emptyData} />);
    const el = getByTestId("target");
    expect(el.children).toHaveLength(0);
  });
});

describe("createBones with promises", () => {
  function TestPromise({ promise }: { promise: Promise<typeof mockData> }) {
    const { bone, data } = createBones(promise);
    return (
      <span data-testid="target" {...bone("text")}>
        {data?.name}
      </span>
    );
  }

  test("shows skeleton then content when promise resolves", async () => {
    let resolve!: (value: typeof mockData) => void;
    const promise = new Promise<typeof mockData>((r) => {
      resolve = r;
    });

    await act(async () => {
      render(
        <Suspense fallback={<TestText />}>
          <TestPromise promise={promise} />
        </Suspense>,
      );
    });

    // Fallback renders skeleton
    expect(screen.getByTestId("target").getAttribute("data-bone")).toBe("text");

    await act(async () => {
      resolve(mockData);
    });

    // Resolved renders content
    expect(screen.getByTestId("target").getAttribute("data-bone")).toBeNull();
    expect(screen.getByTestId("target").textContent).toBe("Pikachu");
  });

  test("renders content immediately for already-resolved promise", async () => {
    const promise = Promise.resolve(mockData);
    await act(async () => {
      await promise;
    });

    render(
      <Suspense fallback={<TestText />}>
        <TestPromise promise={promise} />
      </Suspense>,
    );

    expect(screen.getByTestId("target").getAttribute("data-bone")).toBeNull();
    expect(screen.getByTestId("target").textContent).toBe("Pikachu");
  });
});
