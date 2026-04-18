# `useBone` Prop Getter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a headless `useBone` hook that returns a prop getter function, allowing skeleton behavior on plain HTML elements (`<img>`, `<h3>`, `<p>`) without wrapper components like `<Bone>` or `<BoneImage>`.

**Architecture:** A `useBone(loading)` hook returns a `bone()` prop getter function. When `loading` is true, `bone()` returns `{ className: 'bone-placeholder', 'aria-busy': true }` plus optional style overrides. When `loading` is false, it returns `{}`. Multi-line skeletons use CSS custom properties (`--bone-lines`) and repeating gradients — no extra DOM nodes. The CSS uses `ex` units for x-height skeleton bars aligned to the baseline, and `ch` units for natural text-width sizing.

**Tech Stack:** React 19, CSS custom properties, `vite-plus/test` + `@testing-library/react`

---

## File Structure

| Action | File                          | Responsibility                                                                     |
| ------ | ----------------------------- | ---------------------------------------------------------------------------------- |
| Create | `src/use-bone.ts`             | `useBone` hook — returns prop getter function                                      |
| Create | `tests/use-bone.test.tsx`     | Tests for the hook's return values in loading/ready states                         |
| Modify | `src/css/bones.css`           | Add prop getter skeleton styles (x-height bars, multi-line gradients, `ch` widths) |
| Create | `tests/css-skeleton.test.tsx` | Tests that prop getter output produces correct DOM attributes/classes              |
| Modify | `src/index.ts`                | Export `useBone`                                                                   |
| Modify | `apps/demo/app/page.tsx`      | Add a demo section using `useBone` with plain HTML elements                        |

---

### Task 1: `useBone` Hook — Loading State Returns Skeleton Props

**Files:**

- Create: `packages/bones/tests/use-bone.test.tsx`
- Create: `packages/bones/src/use-bone.ts`

- [ ] **Step 1: Write the failing test — `bone()` returns skeleton props when loading**

```tsx
// packages/bones/tests/use-bone.test.tsx
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { useBone } from "../src/use-bone.ts";

function TestComponent({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  const props = bone();
  return <div data-testid="target" {...props} />;
}

afterEach(cleanup);

describe("useBone", () => {
  test("returns skeleton props when loading is true", () => {
    const { getByTestId } = render(<TestComponent loading={true} />);
    const el = getByTestId("target");
    expect(el.classList.contains("bone-placeholder")).toBe(true);
    expect(el.getAttribute("aria-busy")).toBe("true");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/bones && vp test -- --run tests/use-bone.test.tsx`
Expected: FAIL — `useBone` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
// packages/bones/src/use-bone.ts
"use client";

import { useCallback, useContext } from "react";
import { BonesContext } from "./context.ts";

interface BoneOptions {
  lines?: number;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

type BoneProps = Record<string, unknown>;

export function useBone(loading: boolean) {
  const ctx = useContext(BonesContext);
  const isLoading = ctx.forced || loading;

  const bone = useCallback(
    (options?: BoneOptions): BoneProps => {
      if (!isLoading) {
        return {};
      }

      const style: Record<string, string | number> = {};
      const props: BoneProps = {
        className: "bone-placeholder",
        "aria-busy": true,
      };

      if (options?.width) style.width = options.width;
      if (options?.height) style.height = options.height;
      if (options?.circle) style.borderRadius = "50%";
      if (options?.lines && options.lines > 1) {
        style["--bone-lines"] = options.lines;
      }

      if (Object.keys(style).length > 0) {
        props.style = style;
      }

      return props;
    },
    [isLoading],
  );

  return bone;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/bones && vp test -- --run tests/use-bone.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/bones/src/use-bone.ts packages/bones/tests/use-bone.test.tsx
git commit -m "feat(bones): add useBone hook with loading state skeleton props"
```

---

### Task 2: `useBone` Hook — Ready State Returns Empty Props

**Files:**

- Modify: `packages/bones/tests/use-bone.test.tsx`

- [ ] **Step 1: Write the failing test — `bone()` returns empty props when not loading**

Add to `packages/bones/tests/use-bone.test.tsx` inside the `describe("useBone")` block:

```tsx
test("returns empty props when loading is false", () => {
  const { getByTestId } = render(<TestComponent loading={false} />);
  const el = getByTestId("target");
  expect(el.classList.contains("bone-placeholder")).toBe(false);
  expect(el.getAttribute("aria-busy")).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it passes (implementation already handles this)**

Run: `cd packages/bones && vp test -- --run tests/use-bone.test.tsx`
Expected: PASS — the `if (!isLoading) return {}` path already covers this.

- [ ] **Step 3: Commit**

```bash
git add packages/bones/tests/use-bone.test.tsx
git commit -m "test(bones): verify useBone returns empty props when not loading"
```

---

### Task 3: `useBone` Hook — Respects `<Bones>` Context Provider

**Files:**

- Modify: `packages/bones/tests/use-bone.test.tsx`

- [ ] **Step 1: Write the failing test — forced skeleton via Bones provider**

Add to `packages/bones/tests/use-bone.test.tsx`:

```tsx
import { Bones } from "../src/bones.tsx";

// Add this test inside the describe block:
test("returns skeleton props inside Bones provider even when loading is false", () => {
  const { getByTestId } = render(
    <Bones>
      <TestComponent loading={false} />
    </Bones>,
  );
  const el = getByTestId("target");
  expect(el.classList.contains("bone-placeholder")).toBe(true);
  expect(el.getAttribute("aria-busy")).toBe("true");
});
```

- [ ] **Step 2: Run test to verify it passes (implementation already reads BonesContext)**

Run: `cd packages/bones && vp test -- --run tests/use-bone.test.tsx`
Expected: PASS — `ctx.forced || loading` already handles this.

- [ ] **Step 3: Commit**

```bash
git add packages/bones/tests/use-bone.test.tsx
git commit -m "test(bones): verify useBone respects Bones context provider"
```

---

### Task 4: `useBone` Hook — Options (width, height, circle, lines)

**Files:**

- Modify: `packages/bones/tests/use-bone.test.tsx`

- [ ] **Step 1: Write the failing tests — options pass through as styles**

Add a new `TestComponentWithOptions` and tests to `packages/bones/tests/use-bone.test.tsx`:

```tsx
function TestComponentWithOptions({
  loading,
  options,
}: {
  loading: boolean;
  options: BoneOptions;
}) {
  const bone = useBone(loading);
  const props = bone(options);
  return <div data-testid="target" {...props} />;
}

test("passes width and height as inline styles when loading", () => {
  const { getByTestId } = render(
    <TestComponentWithOptions loading={true} options={{ width: "20ch", height: "1ex" }} />,
  );
  const el = getByTestId("target") as HTMLElement;
  expect(el.style.width).toBe("20ch");
  expect(el.style.height).toBe("1ex");
});

test("applies circle border-radius when loading", () => {
  const { getByTestId } = render(
    <TestComponentWithOptions loading={true} options={{ circle: true }} />,
  );
  const el = getByTestId("target") as HTMLElement;
  expect(el.style.borderRadius).toBe("50%");
});

test("sets --bone-lines CSS variable for multi-line skeletons", () => {
  const { getByTestId } = render(
    <TestComponentWithOptions loading={true} options={{ lines: 3 }} />,
  );
  const el = getByTestId("target") as HTMLElement;
  expect(el.style.getPropertyValue("--bone-lines")).toBe("3");
});

test("does not pass options when not loading", () => {
  const { getByTestId } = render(
    <TestComponentWithOptions loading={false} options={{ width: "20ch", lines: 3 }} />,
  );
  const el = getByTestId("target") as HTMLElement;
  expect(el.style.width).toBe("");
  expect(el.style.getPropertyValue("--bone-lines")).toBe("");
});
```

Note: You'll need to import `BoneOptions` from `../src/use-bone.ts` — export the type from the hook file.

- [ ] **Step 2: Run tests to verify they pass**

Run: `cd packages/bones && vp test -- --run tests/use-bone.test.tsx`
Expected: PASS — implementation from Task 1 already handles all options.

- [ ] **Step 3: Commit**

```bash
git add packages/bones/tests/use-bone.test.tsx packages/bones/src/use-bone.ts
git commit -m "test(bones): verify useBone options (width, height, circle, lines)"
```

---

### Task 5: CSS — X-Height Skeleton Bars with Baseline Alignment

**Files:**

- Modify: `packages/bones/src/css/bones.css`

- [ ] **Step 1: Write a visual test component for manual browser verification**

Create `packages/bones/tests/css-skeleton.test.tsx`:

```tsx
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { useBone } from "../src/use-bone.ts";

function TextSkeleton({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return (
    <h3 data-testid="heading" {...bone()}>
      {loading ? undefined : "Hello World"}
    </h3>
  );
}

function MultiLineSkeleton({ loading }: { loading: boolean }) {
  const bone = useBone(loading);
  return (
    <p data-testid="paragraph" {...bone({ lines: 3 })}>
      {loading ? undefined : "Some longer text content here."}
    </p>
  );
}

afterEach(cleanup);

describe("CSS skeleton classes", () => {
  test("single-line text skeleton has bone-placeholder class", () => {
    const { getByTestId } = render(<TextSkeleton loading={true} />);
    expect(getByTestId("heading").classList.contains("bone-placeholder")).toBe(true);
  });

  test("multi-line skeleton sets --bone-lines custom property", () => {
    const { getByTestId } = render(<MultiLineSkeleton loading={true} />);
    const el = getByTestId("paragraph") as HTMLElement;
    expect(el.style.getPropertyValue("--bone-lines")).toBe("3");
    expect(el.classList.contains("bone-placeholder")).toBe(true);
  });

  test("loaded text has no skeleton class", () => {
    const { getByTestId } = render(<TextSkeleton loading={false} />);
    expect(getByTestId("heading").classList.contains("bone-placeholder")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `cd packages/bones && vp test -- --run tests/css-skeleton.test.tsx`
Expected: PASS — these test DOM attributes, not computed styles.

- [ ] **Step 3: Update CSS — add x-height skeleton bar styles**

Modify `packages/bones/src/css/bones.css`. Keep all existing styles and add new rules at the end, before the `@media (prefers-reduced-motion)` block:

```css
/* --- Prop getter skeleton styles --- */

/* Single-line text skeleton: x-height tall, baseline aligned, ch-width */
h1.bone-placeholder,
h2.bone-placeholder,
h3.bone-placeholder,
h4.bone-placeholder,
h5.bone-placeholder,
h6.bone-placeholder,
p.bone-placeholder,
span.bone-placeholder,
a.bone-placeholder,
label.bone-placeholder {
  color: transparent;
  background-color: transparent;
  background-image: none;
  min-height: auto;
  animation: none;
}

h1.bone-placeholder::before,
h2.bone-placeholder::before,
h3.bone-placeholder::before,
h4.bone-placeholder::before,
h5.bone-placeholder::before,
h6.bone-placeholder::before,
p.bone-placeholder:not([style*="--bone-lines"])::before,
span.bone-placeholder::before,
a.bone-placeholder::before,
label.bone-placeholder::before {
  content: "";
  display: inline-block;
  width: var(--bone-width, 20ch);
  height: 1ex;
  vertical-align: baseline;
  background-color: var(--bone-base);
  background-image: linear-gradient(
    90deg,
    var(--bone-base) 0%,
    var(--bone-base) 40%,
    var(--bone-highlight) 50%,
    var(--bone-base) 60%,
    var(--bone-base) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--bone-radius);
  animation: bone-shimmer var(--bone-duration) ease-in-out infinite;
}

/* Multi-line text skeleton: repeating gradient of x-height bars */
p.bone-placeholder[style*="--bone-lines"] {
  color: transparent;
  min-height: calc(var(--bone-lines) * 1lh);
  background-color: transparent;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent calc(1lh - 1ex),
    var(--bone-base) calc(1lh - 1ex),
    var(--bone-base) 1lh
  );
  background-size: 200% 100%;
  animation: none;
}

/* Image skeleton: hide broken-image icon, show placeholder background */
img.bone-placeholder {
  object-position: -9999px;
}
```

**Note:** The `1lh` unit (line-height unit) and `1ex` (x-height unit) are the key to baseline-aligned skeleton bars. The `::before` pseudo-element approach allows the skeleton bar to participate in the text baseline alignment naturally. The multi-line gradient paints bars at the bottom of each line-height cycle (where the baseline sits). This CSS will need visual testing in the browser — see Task 7.

- [ ] **Step 4: Run all tests**

Run: `cd packages/bones && vp test -- --run`
Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add packages/bones/src/css/bones.css packages/bones/tests/css-skeleton.test.tsx
git commit -m "feat(bones): add x-height baseline-aligned skeleton CSS for prop getter"
```

---

### Task 6: Export `useBone` from Package Index

**Files:**

- Modify: `packages/bones/src/index.ts`

- [ ] **Step 1: Add export**

Add to `packages/bones/src/index.ts`:

```ts
export { useBone } from "./use-bone.ts";
export type { BoneOptions } from "./use-bone.ts";
```

- [ ] **Step 2: Run check**

Run: `cd packages/bones && vp check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add packages/bones/src/index.ts
git commit -m "feat(bones): export useBone hook and BoneOptions type"
```

---

### Task 7: Demo — Add `useBone` Section to Demo App

**Files:**

- Modify: `apps/demo/app/page.tsx`
- Create: `apps/demo/app/components/pokemon-card-headless.tsx`

This task adds a demo section that uses `useBone` with plain HTML elements alongside the existing component-based demos. This is critical for visual testing — the CSS from Task 5 uses `1lh`, `1ex`, and `::before` pseudo-elements that can't be verified in jsdom. You must check this in the browser.

- [ ] **Step 1: Create a headless PokemonCard using `useBone` + plain elements**

```tsx
// apps/demo/app/components/pokemon-card-headless.tsx
"use client";

import { useBone } from "bones";
import type { PokemonListItem } from "@/lib/pokeapi";

export function PokemonCardHeadless({ pokemon }: { pokemon?: PokemonListItem }) {
  const bone = useBone(!pokemon);

  return (
    <div className="card">
      <img
        {...bone()}
        className="card-image"
        src={pokemon?.sprite}
        width={120}
        height={120}
        alt={pokemon?.name ?? "Pokemon"}
      />
      <h3 {...bone()} className="card-name">
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
          <span {...bone({ width: "8ch" })} className="type-badge">
            {undefined}
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add a demo section to page.tsx**

Add a new `<section>` to `apps/demo/app/page.tsx` after the Theming section (before `</main>`):

```tsx
import { PokemonCardHeadless } from "./components/pokemon-card-headless";

// New section:
<section className="demo-section">
  <div className="section-header">
    <h2>Headless Mode (useBone)</h2>
    <p className="section-desc">
      The <code>useBone</code> hook returns a prop getter that applies skeleton styles to{" "}
      <strong>plain HTML elements</strong> — no wrapper components needed. Same loading detection,
      zero extra DOM.
    </p>
  </div>

  <div className="grid">
    <PokemonCardHeadless />
    <PokemonCardHeadless />
    <PokemonCardHeadless />
  </div>
</section>;
```

- [ ] **Step 3: Start the dev server and verify in browser**

Run: `cd apps/demo && vp dev`

Check:

1. The headless skeleton cards render with shimmer animation
2. Skeleton bars for text (h3, span) are x-height tall and baseline-aligned
3. Image skeletons show the shimmer at the correct 120x120 size
4. Compare visually against the existing `<Bone>`-based cards above — they should feel similar

- [ ] **Step 4: Tune the CSS based on browser testing**

The `1lh` unit, `::before` pseudo-element baseline alignment, and repeating gradient math from Task 5 may need adjustment after seeing them render. If the baseline offset doesn't look right, adjust the gradient stops. If `1lh` isn't supported in the target browsers, fall back to `calc(1em * var(--bone-line-height, 1.5))`.

Document any changes you make here.

- [ ] **Step 5: Run full check and test suite**

Run: `cd packages/bones && vp check && vp test -- --run`
Expected: All pass.

- [ ] **Step 6: Commit**

```bash
git add apps/demo/app/components/pokemon-card-headless.tsx apps/demo/app/page.tsx packages/bones/src/css/bones.css
git commit -m "feat(demo): add headless useBone demo section with plain HTML elements"
```
