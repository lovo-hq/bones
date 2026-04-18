import { describe, expect, test } from "vite-plus/test";
import { isEmpty } from "../src/is-empty.ts";

describe("isEmpty", () => {
  test("returns true for null", () => {
    expect(isEmpty(null)).toBe(true);
  });

  test("returns true for undefined", () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  test("returns true for false", () => {
    expect(isEmpty(false)).toBe(true);
  });

  test("returns true for empty string", () => {
    expect(isEmpty("")).toBe(true);
  });

  test("returns true for whitespace-only string", () => {
    expect(isEmpty("   ")).toBe(true);
  });

  test("returns false for 0", () => {
    expect(isEmpty(0)).toBe(false);
  });

  test("returns false for non-empty string", () => {
    expect(isEmpty("hello")).toBe(false);
  });

  test("returns false for number", () => {
    expect(isEmpty(42)).toBe(false);
  });

  test("returns true for array of empty values", () => {
    expect(isEmpty([null, undefined, false, ""])).toBe(true);
  });

  test("returns false for array with a non-empty value", () => {
    expect(isEmpty([null, "hello"])).toBe(false);
  });

  test("returns true for empty array", () => {
    expect(isEmpty([])).toBe(true);
  });

  test("returns false for React element (object)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- testing arbitrary object
    expect(isEmpty({ type: "div", props: {} } as any)).toBe(false);
  });

  test("returns true for nested empty arrays", () => {
    expect(isEmpty([[], [null, [false]]])).toBe(true);
  });
});
