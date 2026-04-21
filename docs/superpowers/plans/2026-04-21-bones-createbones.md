# createBones Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hook-based `useBone` API with a plain `createBones` function that works in both server and client components, with promise support via the throw-promise pattern.

**Architecture:** `createBones` is a plain function (no hooks, no context) that accepts data or a promise. When given a promise, it uses an internal `readPromise` function to integrate with Suspense. The entire library reduces to `createBones` + CSS.

**Tech Stack:** TypeScript, React (peer dep only — no React imports in core), Vite+ (build/test)

---

### File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `packages/bones/src/create-bones.ts` | Create | `createBones` function, `readPromise` internal, all types |
| `packages/bones/src/index.ts` | Rewrite | Export `createBones` + types only |
| `packages/bones/tests/create-bones.test.tsx` | Create | Tests for `createBones` (bone, repeat, data, promise) |
| `packages/bones/tests/read-promise.test.tsx` | Create | Tests for `readPromise` (pending/resolved/errored) |
| `packages/bones/src/use-bone.ts` | Delete | Replaced by `create-bones.ts` |
| `packages/bones/src/use-bones.ts` | Delete | Context consumer — context removed |
| `packages/bones/src/bones.tsx` | Delete | `<Bones>` component + Streamable removed |
| `packages/bones/src/bones-forced.tsx` | Delete | `BonesForcedProvider` removed |
| `packages/bones/src/context.ts` | Delete | `BonesContext` removed |
| `packages/bones/src/types.ts` | Delete | Types consolidated into `create-bones.ts` |
| `packages/bones/tests/use-bone.test.tsx` | Delete | Replaced by `create-bones.test.tsx` |
| `packages/bones/tests/use-bones.test.tsx` | Delete | `useBones` removed |
| `packages/bones/tests/bones.test.tsx` | Delete | `<Bones>` component removed |
| `packages/bones/tests/streamable.test.tsx` | Delete | `Streamable` removed |
| `packages/bones/tests/css-skeleton.test.tsx` | Rewrite | Update to use `createBones` instead of `useBone` |
| `apps/demo/app/components/pokemon-card.tsx` | Rewrite | `createBones` instead of `useBone`, remove `"use client"` |
| `apps/demo/app/components/pokemon-grid.tsx` | Modify | Use `createBones` with `repeat` |
| `apps/demo/app/components/article-preview.tsx` | Rewrite | `createBones` instead of `useBone`, remove `"use client"` |
| `apps/demo/app/components/pokemon-detail-view.tsx` | Rewrite | `createBones` instead of `useBone`, remove `"use client"` |
| `apps/demo/app/components/skeleton-toggle.tsx` | Rewrite | No `<Bones forced>`, toggle omits data instead |
| `apps/demo/app/page.tsx` | Rewrite | Remove `<Bones>` usage, use Suspense + `createBones` pattern |
| `apps/demo/app/pokemon/[id]/page.tsx` | Rewrite | Remove `<Bones>` usage, simplify forced toggle |

---

### Task 1: Create `readPromise` and test it

**Files:**
- Create: `packages/bones/src/create-bones.ts` (readPromise only, createBones added in Task 2)
- Create: `packages/bones/tests/read-promise.test.tsx`

- [ ] **Step 1: Write failing tests for `readPromise`**

Create `packages/bones/tests/read-promise.test.tsx`:

```tsx
import { cleanup, render, screen, act } from "@testing-library/react";
import { Suspense } from "react";
import { afterEach, describe, expect, test } from "vite-plus/test";

// readPromise is internal — import directly from source
import { readPromise } from "../src/create-bones.ts";

function ReadPromiseTest({ promise }: { promise: Promise<string> }) {
  const result = readPromise(promise);
  return <div data-testid="result">{result}</div>;
}

afterEach(cleanup);

describe("readPromise", () => {
  test("returns resolved value after promise resolves", async () => {
    let resolve!: (value: string) => void;
    const promise = new Promise<string>((r) => {
      resolve = r;
    });

    await act(async () => {
      resolve("hello");
      await promise;
    });

    render(
      <Suspense fallback={<div data-testid="fallback">loading</div>}>
        <ReadPromiseTest promise={promise} />
      </Suspense>,
    );

    expect(screen.getByTestId("result").textContent).toBe("hello");
  });

  test("throws pending promise to trigger Suspense fallback", async () => {
    const promise = new Promise<string>(() => {});

    await act(async () => {
      render(
        <Suspense fallback={<div data-testid="fallback">loading</div>}>
          <ReadPromiseTest promise={promise} />
        </Suspense>,
      );
    });

    expect(screen.getByTestId("fallback").textContent).toBe("loading");
  });

  test("transitions from fallback to content when promise resolves", async () => {
    let resolve!: (value: string) => void;
    const promise = new Promise<string>((r) => {
      resolve = r;
    });

    await act(async () => {
      render(
        <Suspense fallback={<div data-testid="fallback">loading</div>}>
          <ReadPromiseTest promise={promise} />
        </Suspense>,
      );
    });

    expect(screen.getByTestId("fallback").textContent).toBe("loading");

    await act(async () => {
      resolve("hello");
    });

    expect(screen.getByTestId("result").textContent).toBe("hello");
  });

  test("throws error for rejected promise", async () => {
    const error = new Error("fail");
    const promise = Promise.reject(error);
    // Suppress unhandled rejection warning in test
    promise.catch(() => {});

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(() => readPromise(promise)).toThrow("fail");
  });

  test("tracks promise only once", () => {
    let attachCount = 0;
    const original = Promise.resolve("value");
    const tracked = Object.create(original) as Promise<string>;
    tracked.then = function (...args: Parameters<Promise<string>["then"]>) {
      attachCount++;
      return original.then(...args);
    };
    tracked.catch = function (...args: Parameters<Promise<string>["catch"]>) {
      return original.catch(...args);
    };

    try {
      readPromise(tracked);
    } catch {
      // throws on first call (pending)
    }
    try {
      readPromise(tracked);
    } catch {
      // throws again (still pending)
    }

    expect(attachCount).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/bones && vp test tests/read-promise.test.tsx`
Expected: FAIL — `create-bones.ts` doesn't exist yet

- [ ] **Step 3: Implement `readPromise`**

Create `packages/bones/src/create-bones.ts`:

```ts
export type BoneType = "text" | "block" | "container";

export interface BoneOptions {
  length?: number;
  lines?: number;
  contained?: boolean;
}

type BoneProps = Record<string, unknown>;

// ---------------------------------------------------------------------------
// readPromise — throw-promise pattern for Suspense integration
// ---------------------------------------------------------------------------

const tracked = new WeakSet<Promise<unknown>>();
const results = new WeakMap<Promise<unknown>, unknown>();
const errors = new WeakMap<Promise<unknown>, unknown>();

export function readPromise<T>(promise: Promise<T>): T {
  if (!tracked.has(promise)) {
    promise.then((r) => results.set(promise, r));
    promise.catch((e) => errors.set(promise, e));
    tracked.add(promise);
  }

  if (results.has(promise)) return results.get(promise) as T;
  if (errors.has(promise)) throw errors.get(promise);
  throw promise;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/bones && vp test tests/read-promise.test.tsx`
Expected: PASS — all 5 tests

- [ ] **Step 5: Commit**

```bash
git add packages/bones/src/create-bones.ts packages/bones/tests/read-promise.test.tsx
git commit -m "feat: add readPromise for Suspense integration"
```

---

### Task 2: Create `createBones` and test it

**Files:**
- Modify: `packages/bones/src/create-bones.ts`
- Create: `packages/bones/tests/create-bones.test.tsx`

- [ ] **Step 1: Write failing tests for `createBones`**

Create `packages/bones/tests/create-bones.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/bones && vp test tests/create-bones.test.tsx`
Expected: FAIL — `createBones` not exported from `create-bones.ts`

- [ ] **Step 3: Implement `createBones`**

Add to `packages/bones/src/create-bones.ts` after the `readPromise` function:

```ts
const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export interface CreateBonesReturn<T> {
  bone: (type: BoneType, options?: BoneOptions) => BoneProps;
  data: T | undefined;
  repeat: <U>(arr: U[] | undefined | null, count: number) => (U | undefined)[];
}

export function createBones<T>(
  data: T | Promise<T> | undefined | null,
): CreateBonesReturn<T> {
  const resolved =
    data != null && data instanceof Promise ? readPromise(data) : (data as T | undefined | null);
  const isLoading = !resolved;

  const bone = (type: BoneType, options?: BoneOptions): BoneProps => {
    if (!isLoading) {
      return {};
    }

    const props: BoneProps = {
      "data-bone": type,
      "aria-busy": true,
    };

    if (type === "text") {
      const style: Record<string, unknown> = {};
      if (options?.contained) {
        style["--bone-contained"] = 1;
      }
      if (options?.length) {
        style["--bone-length"] = options.length;
      }
      if (!options?.contained && options?.lines && options.lines > 1) {
        style["--bone-lines"] = options.lines;
        if (options.lines > 2) {
          const shadows = [];
          for (let i = 1; i < options.lines - 1; i++) {
            shadows.push(`0 calc(1lh * ${i}) 0 0 var(--bone-base)`);
          }
          style["--bone-shadows"] = shadows.join(", ");
        }
      }
      if (Object.keys(style).length > 0) {
        props.style = style;
      }
    }

    if (type === "block") {
      props.src = TRANSPARENT_PIXEL;
    }

    return props;
  };

  const repeat = <U>(
    arr: U[] | undefined | null,
    count: number,
  ): (U | undefined)[] => {
    if (isLoading) {
      return new Array(count).fill(undefined);
    }
    return arr ?? [];
  };

  return { bone, data: isLoading ? undefined : (resolved as T), repeat };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/bones && vp test tests/create-bones.test.tsx`
Expected: PASS — all tests

- [ ] **Step 5: Commit**

```bash
git add packages/bones/src/create-bones.ts packages/bones/tests/create-bones.test.tsx
git commit -m "feat: add createBones function with promise support"
```

---

### Task 3: Update `index.ts` exports and rewrite CSS skeleton tests

**Files:**
- Rewrite: `packages/bones/src/index.ts`
- Rewrite: `packages/bones/tests/css-skeleton.test.tsx`

- [ ] **Step 1: Rewrite `index.ts` to export only `createBones`**

Replace the contents of `packages/bones/src/index.ts` with:

```ts
export { createBones, readPromise } from "./create-bones.ts";
export type {
  BoneType,
  BoneOptions,
  CreateBonesReturn,
} from "./create-bones.ts";
```

- [ ] **Step 2: Rewrite CSS skeleton tests to use `createBones`**

Replace the contents of `packages/bones/tests/css-skeleton.test.tsx` with:

```tsx
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { createBones } from "../src/create-bones.ts";

const mockData = { text: "Hello World" };

function TextSkeleton({ data }: { data?: typeof mockData }) {
  const { bone, data: resolved } = createBones(data);
  return (
    <h3 data-testid="heading" {...bone("text")}>
      {resolved?.text}
    </h3>
  );
}

function MultiLineSkeleton({ data }: { data?: typeof mockData }) {
  const { bone, data: resolved } = createBones(data);
  return (
    <p data-testid="paragraph" {...bone("text", { lines: 3 })}>
      {resolved?.text}
    </p>
  );
}

function BlockSkeleton({ data }: { data?: typeof mockData }) {
  const { bone } = createBones(data);
  return <div data-testid="block" {...bone("block")} style={{ width: 120, height: 120 }} />;
}

function ContainerSkeleton({ data }: { data?: typeof mockData }) {
  const { bone, data: resolved } = createBones(data);
  return (
    <div data-testid="container" {...bone("container")}>
      <span {...bone("text")}>{resolved?.text}</span>
    </div>
  );
}

afterEach(cleanup);

describe("CSS skeleton classes", () => {
  test("single-line text skeleton has data-bone=text", () => {
    const { getByTestId } = render(<TextSkeleton />);
    expect(getByTestId("heading").getAttribute("data-bone")).toBe("text");
  });

  test("multi-line skeleton has data-bone=text with --bone-lines", () => {
    const { getByTestId } = render(<MultiLineSkeleton />);
    const el = getByTestId("paragraph") as HTMLElement;
    expect(el.style.getPropertyValue("--bone-lines")).toBe("3");
    expect(el.getAttribute("data-bone")).toBe("text");
  });

  test("block skeleton has data-bone=block", () => {
    const { getByTestId } = render(<BlockSkeleton />);
    expect(getByTestId("block").getAttribute("data-bone")).toBe("block");
  });

  test("container skeleton has data-bone=container", () => {
    const { getByTestId } = render(<ContainerSkeleton />);
    expect(getByTestId("container").getAttribute("data-bone")).toBe("container");
  });

  test("loaded container has no data-bone attribute", () => {
    const { getByTestId } = render(<ContainerSkeleton data={mockData} />);
    expect(getByTestId("container").getAttribute("data-bone")).toBeNull();
  });

  test("loaded text has no data-bone attribute", () => {
    const { getByTestId } = render(<TextSkeleton data={mockData} />);
    expect(getByTestId("heading").getAttribute("data-bone")).toBeNull();
  });
});
```

- [ ] **Step 3: Run the updated tests to verify**

Run: `cd packages/bones && vp test tests/css-skeleton.test.tsx tests/create-bones.test.tsx tests/read-promise.test.tsx`
Expected: PASS — all three test files pass. Don't run `vp test` (all tests) yet — old test files still import deleted modules and will fail until Task 4 removes them.

- [ ] **Step 4: Commit**

```bash
git add packages/bones/src/index.ts packages/bones/tests/css-skeleton.test.tsx
git commit -m "refactor: update index exports and CSS tests to use createBones"
```

---

### Task 4: Delete old source files and tests

**Files:**
- Delete: `packages/bones/src/use-bone.ts`
- Delete: `packages/bones/src/use-bones.ts`
- Delete: `packages/bones/src/bones.tsx`
- Delete: `packages/bones/src/bones-forced.tsx`
- Delete: `packages/bones/src/context.ts`
- Delete: `packages/bones/src/types.ts`
- Delete: `packages/bones/tests/use-bone.test.tsx`
- Delete: `packages/bones/tests/use-bones.test.tsx`
- Delete: `packages/bones/tests/bones.test.tsx`
- Delete: `packages/bones/tests/streamable.test.tsx`

- [ ] **Step 1: Delete old source files**

```bash
cd packages/bones
rm src/use-bone.ts src/use-bones.ts src/bones.tsx src/bones-forced.tsx src/context.ts src/types.ts
```

- [ ] **Step 2: Delete old test files**

```bash
cd packages/bones
rm tests/use-bone.test.tsx tests/use-bones.test.tsx tests/bones.test.tsx tests/streamable.test.tsx
```

- [ ] **Step 3: Run all tests to verify everything passes**

Run: `cd packages/bones && vp test`
Expected: PASS — only `create-bones.test.tsx`, `read-promise.test.tsx`, and `css-skeleton.test.tsx` remain

- [ ] **Step 4: Run type check and lint**

Run: `cd packages/bones && vp check`
Expected: PASS — no type errors, no lint issues

- [ ] **Step 5: Commit**

```bash
git add -A packages/bones/src packages/bones/tests
git commit -m "refactor: remove useBone, useBones, Bones, Streamable, and context"
```

---

### Task 5: Update demo — `PokemonCard`

**Files:**
- Rewrite: `apps/demo/app/components/pokemon-card.tsx`

- [ ] **Step 1: Rewrite `PokemonCard` to use `createBones`**

Replace the contents of `apps/demo/app/components/pokemon-card.tsx` with:

```tsx
import { createBones } from "bones";
import Link from "next/link";
import type { PokemonListItem } from "@/lib/pokeapi";

export function PokemonCard({ pokemon }: { pokemon?: PokemonListItem }) {
  const { bone, repeat } = createBones(pokemon);

  const card = (
    <div className="card">
      <img
        className="card-image"
        src={pokemon?.sprite}
        width={120}
        height={120}
        alt={pokemon?.name ?? "Pokemon"}
        {...bone("block")}
      />
      <h3 className="card-name" {...bone("text", { length: 9 })}>
        {pokemon?.name}
      </h3>
      <div className="card-types">
        {repeat(pokemon?.types, 2).map((type, i) => (
          <span
            key={type || i}
            className={`type-badge${type ? ` type-${type}` : ""}`}
            {...bone("text", { contained: true, length: 7 })}
          >
            {type}
          </span>
        ))}
      </div>
    </div>
  );

  if (pokemon) {
    return (
      <Link href={`/pokemon/${pokemon.id}`} className="card-link">
        {card}
      </Link>
    );
  }

  return card;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/demo/app/components/pokemon-card.tsx
git commit -m "refactor: update PokemonCard to use createBones"
```

---

### Task 6: Update demo — `PokemonGrid`

**Files:**
- Modify: `apps/demo/app/components/pokemon-grid.tsx`

- [ ] **Step 1: Rewrite `PokemonGrid` to use `createBones` with `repeat`**

Replace the contents of `apps/demo/app/components/pokemon-grid.tsx` with:

```tsx
import { createBones } from "bones";
import { PokemonCard } from "./pokemon-card";
import type { PokemonListItem } from "@/lib/pokeapi";

export function PokemonGrid({
  pokemon,
}: {
  pokemon?: PokemonListItem[] | Promise<PokemonListItem[]>;
}) {
  const { repeat, data } = createBones(pokemon);

  return (
    <div className="grid">
      {repeat(data, 12).map((p, i) => (
        <PokemonCard key={p?.id ?? i} pokemon={p} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/demo/app/components/pokemon-grid.tsx
git commit -m "refactor: update PokemonGrid to use createBones with repeat"
```

---

### Task 7: Update demo — `ArticlePreview`

**Files:**
- Rewrite: `apps/demo/app/components/article-preview.tsx`

- [ ] **Step 1: Rewrite `ArticlePreview` to use `createBones`**

Replace the contents of `apps/demo/app/components/article-preview.tsx` with:

```tsx
import { createBones } from "bones";

interface Article {
  title: string;
  excerpt: string;
  author: string;
  date: string;
}

export function ArticlePreview({ article }: { article?: Article }) {
  const { bone } = createBones(article);

  return (
    <div className="article-preview">
      <h3 className="article-title" {...bone("text", { length: 24 })}>
        {article?.title}
      </h3>
      <p className="article-excerpt" {...bone("text", { lines: 4 })}>
        {article?.excerpt}
      </p>
      <div className="article-meta">
        <span {...bone("text", { length: 12 })}>{article?.author}</span>
        <span className="article-dot">&middot;</span>
        <span {...bone("text", { length: 10 })}>{article?.date}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/demo/app/components/article-preview.tsx
git commit -m "refactor: update ArticlePreview to use createBones"
```

---

### Task 8: Update demo — `PokemonDetailView`

**Files:**
- Rewrite: `apps/demo/app/components/pokemon-detail-view.tsx`

- [ ] **Step 1: Rewrite `PokemonDetailView` and `StatBar` to use `createBones`**

Replace the contents of `apps/demo/app/components/pokemon-detail-view.tsx` with:

```tsx
import { createBones } from "bones";
import type { PokemonDetail } from "@/lib/pokeapi";

function StatBar({ stat }: { stat?: { name: string; value: number } }) {
  const { bone } = createBones(stat);
  const pct = stat ? (stat.value / 255) * 100 : 0;

  return (
    <div className="stat-row">
      <span className="stat-name" style={{ width: 100 }} {...bone("text")}>
        {stat?.name}
      </span>
      <span className="stat-value" style={{ width: 30 }} {...bone("text")}>
        {stat ? String(stat.value) : undefined}
      </span>
      <div className="stat-bar-track">
        {stat ? (
          <div className="stat-bar-fill loaded" style={{ width: `${pct}%` }} />
        ) : (
          <div className="stat-bar-fill" style={{ width: "60%", height: 8 }} {...bone("block")} />
        )}
      </div>
    </div>
  );
}

export function PokemonDetailView({ pokemon }: { pokemon?: PokemonDetail }) {
  const { bone } = createBones(pokemon);

  return (
    <div className="detail">
      <div className="detail-header">
        <img
          className="detail-image"
          src={pokemon?.artwork}
          width={200}
          height={200}
          alt={pokemon?.name ?? "Pokemon"}
          {...bone("block")}
        />
        <div className="detail-info">
          <h1 className="detail-name" {...bone("text")}>
            {pokemon?.name}
          </h1>
          <div className="detail-types">
            {pokemon?.types ? (
              pokemon.types.map((type) => (
                <span key={type} className={`type-badge type-${type}`}>
                  {type}
                </span>
              ))
            ) : (
              <>
                <span className="type-badge" style={{ width: 56 }} {...bone("text")} />
                <span className="type-badge" style={{ width: 56 }} {...bone("text")} />
              </>
            )}
          </div>
          <div className="detail-meta">
            <span className="meta-item" {...bone("text")}>
              {pokemon ? `${pokemon.height / 10} m` : undefined}
            </span>
            <span className="meta-item" {...bone("text")}>
              {pokemon ? `${pokemon.weight / 10} kg` : undefined}
            </span>
          </div>
        </div>
      </div>

      <section className="detail-section">
        <h2>Description</h2>
        <p className="detail-description" {...bone("text", { lines: 3 })}>
          {pokemon?.description}
        </p>
      </section>

      <section className="detail-section">
        <h2>Base Stats</h2>
        <div className="stats">
          {pokemon?.stats ? (
            pokemon.stats.map((stat) => <StatBar key={stat.name} stat={stat} />)
          ) : (
            <>
              {Array.from({ length: 6 }, (_, i) => (
                <StatBar key={i} />
              ))}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/demo/app/components/pokemon-detail-view.tsx
git commit -m "refactor: update PokemonDetailView to use createBones"
```

---

### Task 9: Update demo — `SkeletonToggle`

**Files:**
- Rewrite: `apps/demo/app/components/skeleton-toggle.tsx`

- [ ] **Step 1: Rewrite `SkeletonToggle` to toggle data instead of using `<Bones forced>`**

Replace the contents of `apps/demo/app/components/skeleton-toggle.tsx` with:

```tsx
"use client";

import { useState, type ReactNode } from "react";

/**
 * Toggles between showing children (real content) and skeleton state.
 * Uses key to force remount without data prop when toggled.
 */
export function SkeletonToggle({
  children,
  skeleton,
}: {
  children: ReactNode;
  skeleton: ReactNode;
}) {
  const [forced, setForced] = useState(false);

  return (
    <div>
      <button className="toggle-button" onClick={() => setForced((prev) => !prev)}>
        {forced ? "Show Content" : "Force Skeletons"}
      </button>
      {forced ? skeleton : children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/demo/app/components/skeleton-toggle.tsx
git commit -m "refactor: update SkeletonToggle to toggle between children and skeleton"
```

---

### Task 10: Update demo — Home page

**Files:**
- Rewrite: `apps/demo/app/page.tsx`

- [ ] **Step 1: Rewrite the home page to use Suspense + `createBones` pattern**

Replace the contents of `apps/demo/app/page.tsx` with:

```tsx
import { Suspense } from "react";
import type { PokemonListItem } from "@/lib/pokeapi";
import { fetchPokemonList } from "@/lib/pokeapi";
import { ArticlePreview } from "./components/article-preview";
import { PokemonCard } from "./components/pokemon-card";
import { PokemonGrid } from "./components/pokemon-grid";
import { SkeletonToggle } from "./components/skeleton-toggle";

function delay<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve) => {
    promise.then((value) => setTimeout(() => resolve(value), ms));
  });
}

export default async function Home() {
  const pokemon = await fetchPokemonList(12);

  return (
    <main>
      <section className="hero">
        <h1>Bones</h1>
        <p className="hero-subtitle">
          Primitives for inline skeleton loaders in React.
          <br />
          Same component, both states.
        </p>
      </section>

      <section className="demo-section">
        <div className="section-header">
          <h2>Streaming with Suspense</h2>
          <p className="section-desc">
            Pass a promise to <code>PokemonGrid</code> inside a{" "}
            <code>{"<Suspense>"}</code> boundary. The <strong>same component</strong> renders as
            skeletons in the fallback, then swaps to content when data resolves.
          </p>
          <p className="section-hint">Refresh the page to see the skeleton → content transition.</p>
        </div>

        <Suspense fallback={<PokemonGrid />}>
          <PokemonGrid pokemon={delay(Promise.resolve(pokemon), 2000)} />
        </Suspense>
      </section>

      <section className="demo-section">
        <div className="section-header">
          <h2>Forced Skeletons</h2>
          <p className="section-desc">
            Omit data to force skeleton mode. Toggle to see the same loaded cards switch to
            skeletons — no provider needed.
          </p>
        </div>

        <SkeletonToggle skeleton={<PokemonGrid />}>
          <PokemonGrid pokemon={pokemon} />
        </SkeletonToggle>
      </section>

      <section className="demo-section">
        <div className="section-header">
          <h2>Multi-Line Text</h2>
          <p className="section-desc">
            Pass <code>{"{ lines: N }"}</code> to <code>bone("text")</code> to create
            paragraph-sized placeholders. The skeleton automatically generates one bar per line
            using a CSS repeating gradient — no extra DOM elements.
          </p>
        </div>

        <div className="article-demos">
          <ArticlePreview />
          <ArticlePreview
            article={{
              title: "Understanding React Server Components",
              excerpt:
                "Server Components let you render components on the server, reducing the JavaScript sent to the client. This changes how we think about data fetching and component architecture.",
              author: "Dan Abramov",
              date: "Mar 2026",
            }}
          />
        </div>
      </section>

      <section className="demo-section">
        <div className="section-header">
          <h2>Theming</h2>
          <p className="section-desc">
            Customize skeleton colors with CSS custom properties. Zero-runtime — just override{" "}
            <code>--bone-base</code> and <code>--bone-highlight</code>.
          </p>
        </div>

        <div className="theme-demos">
          <div className="theme-demo" style={{ "--bone-base": "#f5e6d3", "--bone-highlight": "#faf0e6" } as React.CSSProperties}>
            <h3>Warm</h3>
            <PokemonCard />
          </div>
          <div className="theme-demo" style={{ "--bone-base": "#d3e5f5", "--bone-highlight": "#e6f0fa" } as React.CSSProperties}>
            <h3>Cool</h3>
            <PokemonCard />
          </div>
          <div className="theme-demo" style={{ "--bone-base": "#2a2a2a", "--bone-highlight": "#3a3a3a" } as React.CSSProperties}>
            <h3>Dark</h3>
            <PokemonCard />
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/demo/app/page.tsx
git commit -m "refactor: update home page to use Suspense + createBones pattern"
```

---

### Task 11: Update demo — Pokemon detail page

**Files:**
- Rewrite: `apps/demo/app/pokemon/[id]/page.tsx`

- [ ] **Step 1: Rewrite the detail page to remove `<Bones>` usage**

Replace the contents of `apps/demo/app/pokemon/[id]/page.tsx` with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PokemonDetailView } from "@/components/pokemon-detail-view";
import type { PokemonDetail } from "@/lib/pokeapi";

export default function PokemonPage() {
  const params = useParams<{ id: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetail>();
  const [showForced, setShowForced] = useState(false);

  useEffect(() => {
    async function load() {
      const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${params.id}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${params.id}`),
      ]);

      const pokemonData = await pokemonRes.json();
      const speciesData = await speciesRes.json();

      const englishEntry = speciesData.flavor_text_entries.find(
        (e: { language: { name: string } }) => e.language.name === "en",
      );

      setPokemon({
        id: pokemonData.id,
        name: pokemonData.name,
        sprite:
          pokemonData.sprites.other["official-artwork"].front_default ||
          pokemonData.sprites.front_default,
        artwork: pokemonData.sprites.other["official-artwork"].front_default,
        types: pokemonData.types.map((t: { type: { name: string } }) => t.type.name),
        height: pokemonData.height,
        weight: pokemonData.weight,
        description: englishEntry ? englishEntry.flavor_text.replace(/\f|\n/g, " ") : "",
        stats: pokemonData.stats.map((s: { base_stat: number; stat: { name: string } }) => ({
          name: s.stat.name,
          value: s.base_stat,
        })),
      });
    }

    load();
  }, [params.id]);

  return (
    <main>
      <div className="detail-nav">
        <Link href="/" className="back-link">
          ← Back to Pokédex
        </Link>
        {pokemon && (
          <button className="toggle-button" onClick={() => setShowForced((prev) => !prev)}>
            {showForced ? "Show Content" : "Force Skeletons"}
          </button>
        )}
      </div>

      <div className="section-header">
        <p className="section-desc">
          <strong>Client Component pattern:</strong> This page fetches data client-side. The same{" "}
          <code>PokemonDetailView</code> component renders skeletons when data is undefined, then
          real content when it arrives.
        </p>
      </div>

      <PokemonDetailView pokemon={showForced ? undefined : pokemon} />
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/demo/app/pokemon/[id]/page.tsx
git commit -m "refactor: update detail page to use createBones pattern"
```

---

### Task 12: Build, test, and verify

**Files:** None — verification only.

- [ ] **Step 1: Run library tests**

Run: `cd packages/bones && vp test`
Expected: PASS — all tests in `create-bones.test.tsx`, `read-promise.test.tsx`, `css-skeleton.test.tsx`

- [ ] **Step 2: Run type check and lint on library**

Run: `cd packages/bones && vp check`
Expected: PASS

- [ ] **Step 3: Build the library**

Run: `cd packages/bones && vp pack`
Expected: PASS — `dist/` contains `create-bones.mjs`, `index.mjs`, and `css/bones.css`

- [ ] **Step 4: Start the demo dev server and verify**

Run: `cd apps/demo && vp dev`

Verify in browser:
- Home page: streaming section shows skeletons for 2s then real pokemon cards
- Home page: forced toggle switches between skeleton and content
- Home page: multi-line article preview shows skeleton and loaded side by side
- Home page: theming section shows three themed skeleton cards
- Detail page: shows skeletons while fetching, then content
- Detail page: forced toggle shows skeletons when toggled

- [ ] **Step 5: Stop dev server and commit any fixes**

If any issues found, fix and commit. Otherwise, no action needed.
