import { describe, expect, test } from "vite-plus/test";
import { Streamable } from "../src/bones.tsx";

describe("Streamable.from", () => {
  test("returns a lazy promise that does not execute until awaited", async () => {
    let called = false;
    const lazy = Streamable.from(() => {
      called = true;
      return Promise.resolve("result");
    });

    expect(called).toBe(false);
    const result = await lazy;
    expect(called).toBe(true);
    expect(result).toBe("result");
  });
});

describe("Streamable.all", () => {
  test("returns resolved values directly when no promises", () => {
    const result = Streamable.all([1, "two", 3]);
    expect(result).toEqual([1, "two", 3]);
  });

  test("resolves array of promises", async () => {
    const result = await Streamable.all([Promise.resolve(1), Promise.resolve("two")]);
    expect(result).toEqual([1, "two"]);
  });

  test("returns the same promise instance for identical inputs", () => {
    const p1 = Promise.resolve(1);
    const p2 = Promise.resolve(2);
    const result1 = Streamable.all([p1, p2]);
    const result2 = Streamable.all([p1, p2]);
    expect(result1).toBe(result2);
  });
});
