# Bones Streaming Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ambiguous `undefined`-as-loading signal with promise-based loading detection via a rewritten `Bones` component that wraps Suspense internally.

**Architecture:** `Bones` becomes the streaming orchestration component (accepting `Streamable<T>` via `value` prop, or `forced` for skeleton demos). It wraps Suspense internally and uses `children(undefined)` as the fallback. `useBone` stays unchanged — it only does skeleton prop generation. The streamable caching infrastructure (weakRefCache, stableKeys, Streamable.all) is built directly into `bones.tsx`. The reference file `streamable.tsx` is deleted.

**Tech Stack:** React 19 (Suspense, `use()`), TypeScript, Vite+ (vp test, vp check), @testing-library/react

**Spec:** `docs/superpowers/specs/2026-04-20-bones-streaming-integration-design.md`

---

### Task 1: Rewrite BonesProps types as a discriminated union

The current `BonesProps` is a single interface with `children: ReactNode`. The new `Bones` component has two modes (streaming and forced) with different `children` signatures. Define the discriminated union types and the `Streamable<T>` type.

**Files:**
- Modify: `packages/bones/src/types.ts`

- [ ] **Step 1: Write the new types**

Replace the contents of `packages/bones/src/types.ts`:

```ts
import type { ReactNode } from "react";

export type Streamable<T> = T | Promise<T>;

interface BonesThemeProps {
  baseColor?: string;
  highlightColor?: string;
  duration?: number;
}

export interface BonesStreamingProps<T> extends BonesThemeProps {
  value: Streamable<T>;
  children: (data: T | undefined) => ReactNode;
  forced?: never;
}

export interface BonesArrayProps<T extends readonly Streamable<unknown>[]>
  extends BonesThemeProps {
  value: T;
  children: (
    data: { -readonly [P in keyof T]: Awaited<T[P]> } | undefined,
  ) => ReactNode;
  forced?: never;
}

export interface BonesForcedProps extends BonesThemeProps {
  forced: true;
  children: ReactNode;
  value?: never;
}

export type BonesProps<T = unknown> =
  | BonesStreamingProps<T>
  | BonesArrayProps<T extends readonly Streamable<unknown>[] ? T : never>
  | BonesForcedProps;
```

- [ ] **Step 2: Run type check to verify**

Run: `cd packages/bones && vp check`
Expected: Type errors in `bones.tsx` because it references the old `BonesProps` shape. This is expected — we fix it in the next task.

- [ ] **Step 3: Commit**

```bash
git add packages/bones/src/types.ts
git commit -m "refactor: rewrite BonesProps as discriminated union for streaming and forced modes"
```

---

### Task 2: Rewrite the Bones component with streaming support

Replace the current `Bones` component (which only does forced mode via context) with the new version that supports both streaming and forced modes. All streamable infrastructure (promise caching, `Streamable.all`, lazy promises, `useStreamable`) is built directly into this file. The reference file `streamable.tsx` is deleted.

**Files:**
- Rewrite: `packages/bones/src/bones.tsx`
- Delete: `packages/bones/src/streamable.tsx`

- [ ] **Step 1: Write the failing tests for Bones streaming mode and Streamable utilities**

Create a test file covering both the `Bones` component and the `Streamable` utilities it exports:

```tsx
// packages/bones/tests/bones.test.tsx
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

    render(
      <Bones value={promise}>
        {(data) => <TestCard data={data} />}
      </Bones>,
    );

    // Fallback renders: children(undefined) → skeleton
    expect(screen.getByTestId("target").getAttribute("data-bone")).toBe("text");
    expect(screen.getByTestId("target").textContent).toBe("");

    // Resolve and flush
    await act(async () => {
      resolve(mockData);
    });

    // Content renders: children(resolvedValue) → real data
    expect(screen.getByTestId("target").getAttribute("data-bone")).toBeNull();
    expect(screen.getByTestId("target").textContent).toBe("Pikachu");
  });

  test("renders content immediately when value is not a promise", () => {
    render(
      <Bones value={mockData}>
        {(data) => <TestCard data={data} />}
      </Bones>,
    );

    expect(screen.getByTestId("target").getAttribute("data-bone")).toBeNull();
    expect(screen.getByTestId("target").textContent).toBe("Pikachu");
  });

  test("handles array of streamables", async () => {
    let resolve1!: (v: { name: string }) => void;
    let resolve2!: (v: { type: string }) => void;
    const p1 = new Promise<{ name: string }>((r) => { resolve1 = r; });
    const p2 = new Promise<{ type: string }>((r) => { resolve2 = r; });

    function TestMulti({ data }: { data?: [{ name: string }, { type: string }] }) {
      const { bone, data: gated } = useBone(data);
      return (
        <div data-testid="multi" {...bone("text")}>
          {gated ? `${gated[0].name}-${gated[1].type}` : ""}
        </div>
      );
    }

    render(
      <Bones value={[p1, p2]}>
        {(data) => <TestMulti data={data} />}
      </Bones>,
    );

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
```

```tsx
// packages/bones/tests/streamable.test.tsx
import { afterEach, describe, expect, test } from "vite-plus/test";
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
    const result = await Streamable.all([
      Promise.resolve(1),
      Promise.resolve("two"),
    ]);
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/bones && vp test tests/bones.test.tsx tests/streamable.test.tsx`
Expected: FAIL — `Bones` doesn't accept `value` prop, `Streamable` not exported from `bones.tsx`.

- [ ] **Step 3: Rewrite bones.tsx**

Replace the contents of `packages/bones/src/bones.tsx` with the full implementation. This includes the streamable infrastructure (promise caching, `Streamable.all`, `Streamable.from`, `useStreamable`) and the `Bones` component with streaming and forced modes:

```tsx
"use client";

import { Suspense, use } from "react";
import { BonesContext } from "./context.ts";
import type {
  Streamable,
  BonesProps,
  BonesForcedProps,
  BonesStreamingProps,
  BonesArrayProps,
} from "./types.ts";

// ---------------------------------------------------------------------------
// Streamable utilities — promise caching, all(), from()
// ---------------------------------------------------------------------------

function isPromise<T>(value: Streamable<T>): value is Promise<T> {
  return value instanceof Promise;
}

function useStreamable<T>(streamable: Streamable<T>): T {
  return isPromise(streamable) ? use(streamable) : streamable;
}

// Stable identity keys for promise caching — prevents Suspense re-renders
const stableKeys = (function () {
  const cache = new WeakMap<object, string>();
  let nextId = 0;

  return {
    get: (streamable: unknown): string => {
      if (streamable != null && typeof streamable === "object") {
        let key = cache.get(streamable);

        if (key === undefined) {
          key = String(nextId++);
          cache.set(streamable, key);
        }

        return key;
      }

      return JSON.stringify(streamable);
    },
  };
})();

function getCompositeKey(streamables: readonly unknown[]): string {
  return streamables.map(stableKeys.get).join(".");
}

function weakRefCache<K, T extends object>() {
  const cache = new Map<K, WeakRef<T>>();

  const registry = new FinalizationRegistry((key: K) => {
    const valueRef = cache.get(key);

    if (valueRef && !valueRef.deref()) cache.delete(key);
  });

  return {
    get: (key: K) => cache.get(key)?.deref(),
    set: (key: K, value: T) => {
      cache.set(key, new WeakRef(value));
      registry.register(value, key);
    },
  };
}

const promiseCache = weakRefCache<string, Promise<unknown>>();

/**
 * Suspense-friendly `Promise.all` with stable promise identity.
 * Returns the same promise instance when called with identical inputs.
 */
function all<T extends readonly unknown[] | []>(
  streamables: T,
): Streamable<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
  if (!streamables.some(isPromise)) {
    return streamables as { -readonly [P in keyof T]: Awaited<T[P]> };
  }

  const cacheKey = getCompositeKey(streamables);
  const cached = promiseCache.get(cacheKey);

  if (cached != null) return cached as { -readonly [P in keyof T]: Awaited<T[P]> };

  const result = Promise.all(streamables);
  promiseCache.set(cacheKey, result);

  return result;
}

/**
 * Creates a lazy promise that defers thunk execution until awaited.
 */
function from<T>(thunk: () => Promise<T>): Streamable<T> {
  let promise: Promise<T> | undefined;

  return {
    then(onfulfilled, onrejected) {
      promise ??= thunk();
      return promise.then(onfulfilled, onrejected);
    },
    catch(onrejected) {
      promise ??= thunk();
      return promise.catch(onrejected);
    },
    [Symbol.toStringTag]: "LazyPromise",
    finally(onfinally) {
      promise ??= thunk();
      return promise.finally(onfinally);
    },
  } satisfies Promise<T>;
}

export const Streamable = {
  all,
  from,
};

// ---------------------------------------------------------------------------
// Bones component — streaming + forced modes
// ---------------------------------------------------------------------------

function Resolved<T>({
  value,
  children,
}: {
  value: Streamable<T>;
  children: (data: T) => React.ReactNode;
}) {
  return children(useStreamable(value));
}

function ThemeWrapper({
  baseColor,
  highlightColor,
  duration,
  children,
}: {
  baseColor?: string;
  highlightColor?: string;
  duration?: number;
  children: React.ReactNode;
}) {
  const style: Record<string, string> = {};
  if (baseColor) style["--bone-base"] = baseColor;
  if (highlightColor) style["--bone-highlight"] = highlightColor;
  if (duration) style["--bone-duration"] = `${String(duration)}s`;

  if (Object.keys(style).length > 0) {
    return <div style={style}>{children}</div>;
  }

  return children;
}

function isForced(props: BonesProps): props is BonesForcedProps {
  return "forced" in props && props.forced === true;
}

export function Bones<T>(props: BonesStreamingProps<T>): React.ReactNode;
export function Bones<T extends readonly Streamable<unknown>[]>(
  props: BonesArrayProps<T>,
): React.ReactNode;
export function Bones(props: BonesForcedProps): React.ReactNode;
export function Bones(props: BonesProps): React.ReactNode {
  const { baseColor, highlightColor, duration } = props;

  if (isForced(props)) {
    return (
      <BonesContext.Provider value={{ forced: true }}>
        <ThemeWrapper
          baseColor={baseColor}
          highlightColor={highlightColor}
          duration={duration}
        >
          {props.children}
        </ThemeWrapper>
      </BonesContext.Provider>
    );
  }

  const { value, children } = props;
  const streamable = Array.isArray(value) ? Streamable.all(value) : value;

  return (
    <ThemeWrapper
      baseColor={baseColor}
      highlightColor={highlightColor}
      duration={duration}
    >
      <Suspense fallback={children(undefined)}>
        <Resolved value={streamable}>{children}</Resolved>
      </Suspense>
    </ThemeWrapper>
  );
}
```

- [ ] **Step 4: Delete the reference file**

```bash
rm packages/bones/src/streamable.tsx
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/bones && vp test tests/bones.test.tsx tests/streamable.test.tsx`
Expected: PASS — all streaming, forced, and Streamable utility tests pass.

- [ ] **Step 6: Run full test suite**

Run: `cd packages/bones && vp test`
Expected: Existing `use-bone.test.tsx` tests that use `<Bones>` (the forced provider) still pass because forced mode preserves the same behavior.

- [ ] **Step 7: Commit**

```bash
git add packages/bones/src/bones.tsx packages/bones/tests/bones.test.tsx packages/bones/tests/streamable.test.tsx
git rm packages/bones/src/streamable.tsx
git commit -m "feat: rewrite Bones component with streaming and forced modes"
```

---

### Task 3: Update exports

Update `index.ts` to export `Streamable` from the new `bones.tsx` and the new `BonesProps` types.

**Files:**
- Modify: `packages/bones/src/index.ts`

- [ ] **Step 1: Update index.ts exports**

Replace the contents of `packages/bones/src/index.ts`:

```ts
export { Bones, Streamable } from "./bones.tsx";
export { useBone } from "./use-bone.ts";
export { useBones } from "./use-bones.ts";
export type { BoneType, BoneOptions, BoneFn, UseBoneReturn } from "./use-bone.ts";
export type {
  Streamable as StreamableType,
  BonesProps,
  BonesStreamingProps,
  BonesArrayProps,
  BonesForcedProps,
} from "./types.ts";
```

- [ ] **Step 2: Run type check and tests**

Run: `cd packages/bones && vp check && vp test`
Expected: All checks and tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/bones/src/index.ts
git commit -m "refactor: update exports for Streamable and new BonesProps types"
```

---

### Task 4: Update existing tests for new Bones API

The existing `use-bone.test.tsx` and `use-bones.test.tsx` tests use `<Bones>` as a forced provider without the `forced` prop. Update them to use `<Bones forced>`.

**Files:**
- Modify: `packages/bones/tests/use-bone.test.tsx`
- Modify: `packages/bones/tests/use-bones.test.tsx`

- [ ] **Step 1: Update use-bone.test.tsx**

In `packages/bones/tests/use-bone.test.tsx`, replace every instance of `<Bones>` with `<Bones forced>`. There are 3 occurrences:

Line 134: `<Bones>` → `<Bones forced>`
Line 158: `<Bones>` → `<Bones forced>`
Line 183: `<Bones>` → `<Bones forced>`

The closing `</Bones>` tags stay the same.

- [ ] **Step 2: Update use-bones.test.tsx**

In `packages/bones/tests/use-bones.test.tsx`, replace `<Bones>` with `<Bones forced>`:

Line 20: `<Bones>` → `<Bones forced>`

- [ ] **Step 3: Run full test suite**

Run: `cd packages/bones && vp test`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/bones/tests/use-bone.test.tsx packages/bones/tests/use-bones.test.tsx
git commit -m "test: update existing tests to use Bones forced prop"
```

---

### Task 5: Update demo app — SkeletonToggle and page.tsx

The demo app uses `<Bones>` as a forced provider in several places. Update to use `<Bones forced>`. The `SkeletonToggle` component wraps children in `<Bones>` and the `page.tsx` uses `<Bones>` for theming demos.

**Files:**
- Modify: `apps/demo/app/components/skeleton-toggle.tsx`
- Modify: `apps/demo/app/page.tsx`

- [ ] **Step 1: Update SkeletonToggle**

In `apps/demo/app/components/skeleton-toggle.tsx`, update line 13:

```tsx
// Before:
const content = forced ? <Bones>{children}</Bones> : children;

// After:
const content = forced ? <Bones forced>{children}</Bones> : children;
```

- [ ] **Step 2: Update page.tsx forced/theming usages**

In `apps/demo/app/page.tsx`, update all `<Bones>` usages that are forced/theming mode:

Line 76 — multi-line demo:
```tsx
// Before:
<Bones>
  <ArticlePreview />
</Bones>

// After:
<Bones forced>
  <ArticlePreview />
</Bones>
```

Lines 104, 109, 114 — theming demos:
```tsx
// Before:
<Bones baseColor="#f5e6d3" highlightColor="#faf0e6">

// After:
<Bones forced baseColor="#f5e6d3" highlightColor="#faf0e6">
```

Apply the same `forced` prop to the "Cool" and "Dark" theme demos.

- [ ] **Step 3: Run the dev server and verify in browser**

Run: `cd apps/demo && vp dev`

Verify:
- The Suspense + server component demo still shows skeleton → content transition on refresh
- The SkeletonToggle button still toggles between content and skeleton states
- The multi-line article demo shows skeleton on the left, content on the right
- The theming demos (Warm, Cool, Dark) all display skeletons with correct colors

- [ ] **Step 4: Commit**

```bash
git add apps/demo/app/components/skeleton-toggle.tsx apps/demo/app/page.tsx
git commit -m "refactor: update demo app to use Bones forced prop"
```

---

### Task 6: Final verification

Full verification that everything works together.

**Files:** None — verification only.

- [ ] **Step 1: Run type check and linting**

Run: `vp check`
Expected: No errors.

- [ ] **Step 2: Run full test suite**

Run: `cd packages/bones && vp test`
Expected: All tests pass (use-bone, use-bones, css-skeleton, bones, streamable).

- [ ] **Step 3: Run the demo dev server and verify all demos**

Run: `cd apps/demo && vp dev`

Verify all sections work as described in Task 5 Step 3.

- [ ] **Step 4: Commit any remaining fixes if needed**
