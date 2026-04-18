# Specific Bone Class Names Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic `.bone-placeholder` class with two purpose-specific classes (`.bone-text`, `.bone-block`), remove the `<Bone>` and `<BoneImage>` components, and make `useBone` the sole public API.

**Architecture:** The CSS is rewritten from scratch with two self-contained classes. The `useBone` hook signature changes to require a type argument — `bone("text")` or `bone("block")`. Components (`Bone`, `BoneImage`, `isEmpty`) are deleted. The `<Bones>` provider and `useBones` hook remain. The demo app is rewritten to use `useBone` exclusively.

**Tech Stack:** React, CSS, Vite+ (vp test, vp check)

---

### Task 1: Rewrite the CSS

**Files:**
- Modify: `packages/bones/src/css/bones.css`

- [ ] **Step 1: Replace the entire CSS file with the new classes**

Replace the contents of `packages/bones/src/css/bones.css` with:

```css
:root {
  --bone-base: #e0e0e0;
  --bone-highlight: #f0f0f0;
  --bone-radius: 4px;
  --bone-duration: 1.5s;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bone-base: #2a2a2a;
    --bone-highlight: #3a3a3a;
  }
}

.bone-text {
  display: inline-block;
  min-width: 4ch;
  height: 1ex;
  color: transparent;
  background-color: var(--bone-base);
  border-radius: var(--bone-radius);
}

.bone-text[style*="--bone-lines"] {
  height: auto;
  min-height: calc(var(--bone-lines) * 1lh);
  background-color: transparent;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent calc(1lh - 1ex),
    var(--bone-base) calc(1lh - 1ex),
    var(--bone-base) 1lh
  );
  background-size: 100% calc(var(--bone-lines) * 1lh);
  background-repeat: no-repeat;
  border-radius: 0;
}

.bone-block {
  display: inline-block;
  background-color: var(--bone-base);
}

@keyframes bone-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes bone-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  [aria-busy="true"] {
    animation: bone-pulse 2s ease-in-out infinite;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/bones/src/css/bones.css
git commit -m "refactor: replace bone-placeholder with bone-text and bone-block classes"
```

---

### Task 2: Update `useBone` hook to require a type argument

**Files:**
- Modify: `packages/bones/src/use-bone.ts`

- [ ] **Step 1: Write the failing tests**

Replace the contents of `packages/bones/tests/use-bone.test.tsx` with:

```tsx
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { useBone } from "../src/use-bone.ts";
import { Bones } from "../src/bones.tsx";

function TestText({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return <span data-testid="target" {...bone("text")} />;
}

function TestBlock({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return <div data-testid="target" {...bone("block")} />;
}

function TestMultiline({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return <p data-testid="target" {...bone("text", { lines: 3 })} />;
}

afterEach(cleanup);

describe("useBone", () => {
  test("returns bone-text class and aria-busy when loading", () => {
    const { getByTestId } = render(<TestText loading={true} />);
    const el = getByTestId("target");
    expect(el.classList.contains("bone-text")).toBe(true);
    expect(el.getAttribute("aria-busy")).toBe("true");
  });

  test("returns bone-block class and aria-busy when loading", () => {
    const { getByTestId } = render(<TestBlock loading={true} />);
    const el = getByTestId("target");
    expect(el.classList.contains("bone-block")).toBe(true);
    expect(el.getAttribute("aria-busy")).toBe("true");
  });

  test("returns empty props when not loading", () => {
    const { getByTestId } = render(<TestText loading={false} />);
    const el = getByTestId("target");
    expect(el.classList.contains("bone-text")).toBe(false);
    expect(el.getAttribute("aria-busy")).toBeNull();
  });

  test("sets --bone-lines CSS variable for multiline text", () => {
    const { getByTestId } = render(<TestMultiline loading={true} />);
    const el = getByTestId("target") as HTMLElement;
    expect(el.classList.contains("bone-text")).toBe(true);
    expect(el.style.getPropertyValue("--bone-lines")).toBe("3");
  });

  test("does not set --bone-lines when not loading", () => {
    const { getByTestId } = render(<TestMultiline loading={false} />);
    const el = getByTestId("target") as HTMLElement;
    expect(el.style.getPropertyValue("--bone-lines")).toBe("");
  });

  test("returns skeleton props inside Bones provider even when loading is false", () => {
    const { getByTestId } = render(
      <Bones>
        <TestText loading={false} />
      </Bones>,
    );
    const el = getByTestId("target");
    expect(el.classList.contains("bone-text")).toBe(true);
    expect(el.getAttribute("aria-busy")).toBe("true");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `vp test packages/bones/tests/use-bone.test.tsx`

Expected: FAIL — the current `useBone` doesn't accept a type argument.

- [ ] **Step 3: Rewrite the `useBone` hook**

Replace the contents of `packages/bones/src/use-bone.ts` with:

```ts
"use client";

import { useCallback, useContext } from "react";
import { BonesContext } from "./context.ts";

export type BoneType = "text" | "block";

export interface BoneOptions {
  lines?: number;
}

type BoneProps = Record<string, unknown>;

export function useBone(loading: boolean) {
  const ctx = useContext(BonesContext);
  const isLoading = ctx.forced || loading;

  const bone = useCallback(
    (type: BoneType, options?: BoneOptions): BoneProps => {
      if (!isLoading) {
        return {};
      }

      const className = type === "text" ? "bone-text" : "bone-block";
      const props: BoneProps = {
        className,
        "aria-busy": true,
      };

      if (type === "text" && options?.lines && options.lines > 1) {
        props.style = { "--bone-lines": options.lines };
      }

      return props;
    },
    [isLoading],
  );

  return bone;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `vp test packages/bones/tests/use-bone.test.tsx`

Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/bones/src/use-bone.ts packages/bones/tests/use-bone.test.tsx
git commit -m "refactor: useBone requires type argument (text or block)"
```

---

### Task 3: Rewrite `css-skeleton.test.tsx` for new class names

**Files:**
- Modify: `packages/bones/tests/css-skeleton.test.tsx`

- [ ] **Step 1: Rewrite the CSS integration tests**

Replace the contents of `packages/bones/tests/css-skeleton.test.tsx` with:

```tsx
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { useBone } from "../src/use-bone.ts";

function TextSkeleton({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return (
    <h3 data-testid="heading" {...bone("text")}>
      {loading ? undefined : "Hello World"}
    </h3>
  );
}

function MultiLineSkeleton({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return (
    <p data-testid="paragraph" {...bone("text", { lines: 3 })}>
      {loading ? undefined : "Some longer text content here."}
    </p>
  );
}

function BlockSkeleton({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return (
    <div
      data-testid="block"
      {...bone("block")}
      style={{ width: 120, height: 120 }}
    />
  );
}

afterEach(cleanup);

describe("CSS skeleton classes", () => {
  test("single-line text skeleton has bone-text class", () => {
    const { getByTestId } = render(<TextSkeleton loading={true} />);
    expect(getByTestId("heading").classList.contains("bone-text")).toBe(true);
  });

  test("multi-line skeleton has bone-text class with --bone-lines", () => {
    const { getByTestId } = render(<MultiLineSkeleton loading={true} />);
    const el = getByTestId("paragraph") as HTMLElement;
    expect(el.style.getPropertyValue("--bone-lines")).toBe("3");
    expect(el.classList.contains("bone-text")).toBe(true);
  });

  test("block skeleton has bone-block class", () => {
    const { getByTestId } = render(<BlockSkeleton loading={true} />);
    expect(getByTestId("block").classList.contains("bone-block")).toBe(true);
  });

  test("loaded text has no skeleton class", () => {
    const { getByTestId } = render(<TextSkeleton loading={false} />);
    expect(getByTestId("heading").classList.contains("bone-text")).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `vp test packages/bones/tests/css-skeleton.test.tsx`

Expected: All 4 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/bones/tests/css-skeleton.test.tsx
git commit -m "test: update CSS skeleton tests for bone-text and bone-block classes"
```

---

### Task 4: Delete `Bone`, `BoneImage`, and `isEmpty`

**Files:**
- Delete: `packages/bones/src/bone.tsx`
- Delete: `packages/bones/src/bone-image.tsx`
- Delete: `packages/bones/src/is-empty.ts`
- Delete: `packages/bones/tests/bone.test.tsx`
- Delete: `packages/bones/tests/bone-image.test.tsx`
- Delete: `packages/bones/tests/is-empty.test.ts`

- [ ] **Step 1: Delete the source files**

```bash
rm packages/bones/src/bone.tsx packages/bones/src/bone-image.tsx packages/bones/src/is-empty.ts
```

- [ ] **Step 2: Delete the test files**

```bash
rm packages/bones/tests/bone.test.tsx packages/bones/tests/bone-image.test.tsx packages/bones/tests/is-empty.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add -u packages/bones/src/bone.tsx packages/bones/src/bone-image.tsx packages/bones/src/is-empty.ts packages/bones/tests/bone.test.tsx packages/bones/tests/bone-image.test.tsx packages/bones/tests/is-empty.test.ts
git commit -m "refactor: remove Bone, BoneImage, and isEmpty"
```

---

### Task 5: Update exports and types

**Files:**
- Modify: `packages/bones/src/index.ts`
- Modify: `packages/bones/src/types.ts`

- [ ] **Step 1: Update `index.ts` to remove deleted exports and add new type exports**

Replace the contents of `packages/bones/src/index.ts` with:

```ts
export { Bones } from "./bones.tsx";
export { useBone } from "./use-bone.ts";
export { useBones } from "./use-bones.ts";
export type { BoneType, BoneOptions } from "./use-bone.ts";
export type { BonesProps } from "./types.ts";
```

- [ ] **Step 2: Update `types.ts` to remove deleted types**

Replace the contents of `packages/bones/src/types.ts` with:

```ts
import type { ReactNode } from "react";

export interface BonesProps {
  children: ReactNode;
  baseColor?: string;
  highlightColor?: string;
  duration?: number;
}
```

- [ ] **Step 3: Run all library tests to verify nothing is broken**

Run: `vp test packages/bones/`

Expected: All tests in `use-bone.test.tsx`, `css-skeleton.test.tsx`, `use-bones.test.tsx` PASS. No tests reference deleted files.

- [ ] **Step 4: Run type checking**

Run: `vp check`

Expected: No type errors in the library package.

- [ ] **Step 5: Commit**

```bash
git add packages/bones/src/index.ts packages/bones/src/types.ts
git commit -m "refactor: update exports — remove Bone, BoneImage, add BoneType"
```

---

### Task 6: Rewrite demo `PokemonCard` to use `useBone`

**Files:**
- Modify: `apps/demo/app/components/pokemon-card.tsx`

- [ ] **Step 1: Rewrite PokemonCard using `useBone`**

Replace the contents of `apps/demo/app/components/pokemon-card.tsx` with:

```tsx
"use client";

import { useBone } from "bones";
import Link from "next/link";
import type { PokemonListItem } from "@/lib/pokeapi";

export function PokemonCard({ pokemon }: { pokemon?: PokemonListItem }) {
  const bone = useBone(!pokemon);

  const card = (
    <div className="card">
      <img
        {...bone("block")}
        className="card-image"
        src={pokemon?.sprite}
        width={120}
        height={120}
        alt={pokemon?.name ?? "Pokemon"}
      />
      <h3 {...bone("text")} className="card-name">
        {pokemon?.name}
      </h3>
      <div className="card-types">
        {pokemon?.types ? (
          pokemon.types.map((type) => (
            <span key={type} className={`type-badge type-${type}`}>
              {type}
            </span>
          ))
        ) : (
          <span
            {...bone("text")}
            className="type-badge"
            style={{ width: 56 }}
          />
        )}
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
git commit -m "refactor: PokemonCard uses useBone instead of Bone/BoneImage"
```

---

### Task 7: Rewrite demo `PokemonCardHeadless` for new API

**Files:**
- Modify: `apps/demo/app/components/pokemon-card-headless.tsx`

- [ ] **Step 1: Update PokemonCardHeadless for the new `bone(type)` signature**

Replace the contents of `apps/demo/app/components/pokemon-card-headless.tsx` with:

```tsx
"use client";

import { useBone } from "bones";
import type { PokemonListItem } from "@/lib/pokeapi";

export function PokemonCardHeadless({
  pokemon,
}: {
  pokemon?: PokemonListItem;
}) {
  const bone = useBone(!pokemon);

  return (
    <div className="card">
      <img
        {...bone("block")}
        className="card-image"
        src={pokemon?.sprite}
        width={120}
        height={120}
        alt={pokemon?.name ?? "Pokemon"}
      />
      <h3 {...bone("text")} className="card-name">
        {pokemon?.name}
      </h3>
      <div className="card-types">
        {pokemon?.types ? (
          pokemon.types.map((type) => (
            <span key={type} className={`type-badge type-${type}`}>
              {type}
            </span>
          ))
        ) : (
          <span
            {...bone("text")}
            className="type-badge"
            style={{ width: "8ch" }}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/demo/app/components/pokemon-card-headless.tsx
git commit -m "refactor: PokemonCardHeadless uses new bone(type) signature"
```

---

### Task 8: Rewrite demo `PokemonDetailView` to use `useBone`

**Files:**
- Modify: `apps/demo/app/components/pokemon-detail-view.tsx`

- [ ] **Step 1: Rewrite PokemonDetailView using `useBone`**

Replace the contents of `apps/demo/app/components/pokemon-detail-view.tsx` with:

```tsx
"use client";

import { useBone, useBones } from "bones";
import type { PokemonDetail } from "@/lib/pokeapi";

function StatBar({ name, value, loading }: { name?: string; value?: number; loading: boolean }) {
  const bone = useBone(loading);
  const pct = value !== undefined ? (value / 255) * 100 : 0;

  return (
    <div className="stat-row">
      <span {...bone("text")} className="stat-name" style={{ width: 100 }}>
        {name}
      </span>
      <span {...bone("text")} className="stat-value" style={{ width: 30 }}>
        {value !== undefined ? String(value) : undefined}
      </span>
      <div className="stat-bar-track">
        {loading ? (
          <div
            {...bone("block")}
            className="stat-bar-fill"
            style={{ width: "60%", height: 8 }}
          />
        ) : (
          <div
            className="stat-bar-fill loaded"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  );
}

export function PokemonDetailView({
  pokemon,
}: {
  pokemon?: PokemonDetail;
}) {
  const { isLoading: forced } = useBones();
  const loading = forced || !pokemon;
  const bone = useBone(loading);

  return (
    <div className="detail">
      <div className="detail-header">
        <img
          {...bone("block")}
          className="detail-image"
          src={pokemon?.artwork}
          width={200}
          height={200}
          alt={pokemon?.name ?? "Pokemon"}
        />
        <div className="detail-info">
          <h1 {...bone("text")} className="detail-name">
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
                <span {...bone("text")} className="type-badge" style={{ width: 56 }} />
                <span {...bone("text")} className="type-badge" style={{ width: 56 }} />
              </>
            )}
          </div>
          <div className="detail-meta">
            <span {...bone("text")} className="meta-item">
              {pokemon ? `${pokemon.height / 10} m` : undefined}
            </span>
            <span {...bone("text")} className="meta-item">
              {pokemon ? `${pokemon.weight / 10} kg` : undefined}
            </span>
          </div>
        </div>
      </div>

      <section className="detail-section">
        <h2>Description</h2>
        <p {...bone("text", { lines: 3 })} className="detail-description">
          {pokemon?.description}
        </p>
      </section>

      <section className="detail-section">
        <h2>Base Stats</h2>
        <div className="stats">
          {pokemon?.stats ? (
            pokemon.stats.map((stat) => (
              <StatBar key={stat.name} name={stat.name} value={stat.value} loading={loading} />
            ))
          ) : (
            <>
              {Array.from({ length: 6 }, (_, i) => (
                <StatBar key={i} loading={loading} />
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
git commit -m "refactor: PokemonDetailView uses useBone instead of Bone/BoneImage"
```

---

### Task 9: Update demo page and grid

**Files:**
- Modify: `apps/demo/app/page.tsx`
- Modify: `apps/demo/app/components/pokemon-grid.tsx`

- [ ] **Step 1: Remove `Bone` and `BoneImage` imports from `page.tsx`**

The page imports `Bones` from `bones` — that stays. It also imports `PokemonCard` which no longer uses `Bone`/`BoneImage` internally, so no change needed to the imports. However, the Theming section renders `<PokemonCard />` inside `<Bones>` — this still works because `useBone` respects the `<Bones>` provider context.

Review `apps/demo/app/page.tsx` — the only import from `bones` is `Bones`, and the component references are all to local files. No changes needed to this file.

- [ ] **Step 2: Review `pokemon-grid.tsx`**

`pokemon-grid.tsx` imports `PokemonCard` — no direct `bones` imports. No changes needed.

- [ ] **Step 3: Run type checking across the entire project**

Run: `vp check`

Expected: No type errors.

- [ ] **Step 4: Commit if any changes were made**

If no changes were needed, skip this step.

---

### Task 10: Run full test suite and verify in browser

- [ ] **Step 1: Run all tests**

Run: `vp test`

Expected: All tests pass. No references to `bone-placeholder`, `Bone`, `BoneImage`, or `isEmpty` remain in test files.

- [ ] **Step 2: Start the dev server**

Run: `vp dev` (from `apps/demo/`)

- [ ] **Step 3: Verify in browser**

Open the demo in a browser and check:

1. **Home page skeleton → content transition:** Refresh the page. The Suspense section should show skeleton bars (bone-text) and a solid block (bone-block) for the image, then transition to real content after 2 seconds.
2. **Bones provider toggle:** Click "Force Skeletons" — all cards should switch to skeleton state. Click "Show Content" — they should return to loaded state.
3. **Theming section:** Three themed skeleton cards (Warm, Cool, Dark) should display with their custom colors.
4. **Headless section:** Three skeleton cards rendered via `useBone` should look identical to the component-based ones.
5. **Detail page:** Click a Pokemon card. The detail page should show skeletons, then load content. The stat bars should show skeleton blocks during loading. The description should show 3 multiline skeleton bars. Click "Force Skeletons" to verify the toggle works.

- [ ] **Step 4: Commit any fixes found during browser testing**
