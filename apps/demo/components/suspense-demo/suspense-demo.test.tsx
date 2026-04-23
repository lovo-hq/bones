import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { SuspenseDemo } from "./suspense-demo";

vi.mock("@/lib/delay", () => ({
  delay: <T,>(promise: Promise<T>) => promise,
}));

type TrackedPromise<T> = Promise<T> & {
  _status?: "pending" | "fulfilled" | "rejected";
  _result?: T;
};

vi.mock("bones", () => ({
  createBones: <T,>(data: T | Promise<T>) => {
    if (data instanceof Promise) {
      const tracked = data as TrackedPromise<T>;
      if (tracked._status === undefined) {
        tracked._status = "pending";
        data.then((v) => {
          tracked._status = "fulfilled";
          tracked._result = v;
        });
      }
      if (tracked._status === "fulfilled") {
        const resolved = tracked._result as T;
        return {
          bone: () => ({}),
          data: resolved,
          repeat: <U,>(arr: U[] | undefined, count: number): (U | undefined)[] =>
            arr ?? Array.from({ length: count }, () => undefined),
        };
      }
      throw data;
    }
    return {
      bone: () => ({}),
      data: data ?? undefined,
      repeat: <U,>(arr: U[] | undefined, count: number): (U | undefined)[] =>
        arr ?? Array.from({ length: count }, () => undefined),
    };
  },
}));

vi.mock("next/link", async () => (await import("@/test/mocks")).nextLinkMockFactory());

afterEach(cleanup);

const pokemon = [
  { id: 1, name: "bulbasaur", sprite: "https://example.com/1.png", types: ["grass", "poison"] },
  { id: 4, name: "charmander", sprite: "https://example.com/4.png", types: ["fire"] },
];

describe("SuspenseDemo", () => {
  test("renders the section title", () => {
    render(<SuspenseDemo pokemon={pokemon} />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Streaming with Suspense");
  });

  test("renders pokemon names", async () => {
    await act(async () => {
      render(<SuspenseDemo pokemon={pokemon} />);
    });
    expect(screen.getByText("bulbasaur")).toBeDefined();
    expect(screen.getByText("charmander")).toBeDefined();
  });
});
