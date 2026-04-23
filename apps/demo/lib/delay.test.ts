import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { delay } from "./delay";

afterEach(() => {
  vi.useRealTimers();
});

describe("delay", () => {
  test("resolves with the original value after the specified ms", async () => {
    vi.useFakeTimers();
    const promise = delay(Promise.resolve("hello"), 500);

    await vi.advanceTimersByTimeAsync(500);

    expect(await promise).toBe("hello");
  });

  test("does not resolve before the delay elapses", async () => {
    vi.useFakeTimers();
    let resolved = false;
    delay(Promise.resolve("hello"), 500).then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(499);
    expect(resolved).toBe(false);
  });
});
