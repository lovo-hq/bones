# Demo Page Decomposition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Break `apps/demo/app/page.tsx` into focused section components with CSS modules and tests.

**Architecture:** Extract 7 components (SectionHeader, DemoSection, HeroSection, SuspenseDemo, ForcedSkeletonsDemo, MultiLineTextDemo, ThemingDemo) plus a `delay` utility. Each component follows the existing convention: own directory under `apps/demo/components/`, with a component file, `styles.module.css`, and `.test.tsx`. The page becomes a thin composition layer.

**Tech Stack:** React, Next.js (App Router), CSS Modules, vite-plus/test, @testing-library/react

**Test conventions (apply to all tasks):**
- Import `{ cleanup, render, screen }` from `@testing-library/react`
- Import `{ afterEach, describe, expect, test, vi }` from `vite-plus/test`
- Call `afterEach(cleanup)` at module level
- CSS modules are handled automatically by vite-plus — no manual mocking needed
- Run tests with: `vp test apps/demo/components/<name>/<name>.test.tsx`

**All file paths are relative to `apps/demo/`.**

---

## Task 1: Extract `delay` utility

**Files:**
- Create: `apps/demo/lib/delay.ts`
- Create: `apps/demo/lib/delay.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/demo/lib/delay.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test apps/demo/lib/delay.test.ts`
Expected: FAIL — `delay` is not exported / file does not exist.

- [ ] **Step 3: Write the implementation**

Create `apps/demo/lib/delay.ts`:

```ts
export function delay<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve) => {
    promise.then((value) => setTimeout(() => resolve(value), ms));
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `vp test apps/demo/lib/delay.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/demo/lib/delay.ts apps/demo/lib/delay.test.ts
git commit -m "feat(demo): extract delay utility to lib/delay"
```

---

## Task 2: Create `SectionHeader` component

**Files:**
- Create: `apps/demo/components/section-header/section-header.tsx`
- Create: `apps/demo/components/section-header/styles.module.css`
- Create: `apps/demo/components/section-header/section-header.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/demo/components/section-header/section-header.test.tsx`:

```tsx
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { SectionHeader } from "./section-header";

afterEach(cleanup);

describe("SectionHeader", () => {
  test("renders title as h2", () => {
    render(<SectionHeader title="My Title" description="My desc" />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).toBe("My Title");
  });

  test("renders description", () => {
    render(<SectionHeader title="Title" description="Some description" />);
    expect(screen.getByText("Some description")).toBeDefined();
  });

  test("renders description with inline JSX", () => {
    render(
      <SectionHeader
        title="Title"
        description={
          <>
            Use <code>bone()</code> for skeletons.
          </>
        }
      />,
    );
    expect(screen.getByText("bone()")).toBeDefined();
  });

  test("renders hint when provided", () => {
    render(
      <SectionHeader title="Title" description="Desc" hint="Refresh the page" />,
    );
    expect(screen.getByText("Refresh the page")).toBeDefined();
  });

  test("does not render hint element when hint is omitted", () => {
    const { container } = render(
      <SectionHeader title="Title" description="Desc" />,
    );
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test apps/demo/components/section-header/section-header.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the CSS module**

Create `apps/demo/components/section-header/styles.module.css`:

```css
.sectionHeader {
  margin-bottom: 1.5rem;
}

.sectionHeader h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.sectionDesc {
  color: var(--muted);
  font-size: 0.925rem;
  max-width: 600px;
}

.sectionDesc code {
  background: var(--border);
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.85em;
}

.sectionHint {
  color: var(--muted);
  font-size: 0.85rem;
  font-style: italic;
  margin-top: 0.375rem;
}
```

- [ ] **Step 4: Write the component**

Create `apps/demo/components/section-header/section-header.tsx`:

```tsx
import type { ReactNode } from "react";
import styles from "./styles.module.css";

export function SectionHeader({
  title,
  description,
  hint,
}: {
  title: string;
  description: ReactNode;
  hint?: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <h2>{title}</h2>
      <p className={styles.sectionDesc}>{description}</p>
      {hint && <p className={styles.sectionHint}>{hint}</p>}
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `vp test apps/demo/components/section-header/section-header.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add apps/demo/components/section-header/
git commit -m "feat(demo): add SectionHeader component"
```

---

## Task 3: Create `DemoSection` component

**Files:**
- Create: `apps/demo/components/demo-section/demo-section.tsx`
- Create: `apps/demo/components/demo-section/styles.module.css`
- Create: `apps/demo/components/demo-section/demo-section.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/demo/components/demo-section/demo-section.test.tsx`:

```tsx
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { DemoSection } from "./demo-section";

afterEach(cleanup);

describe("DemoSection", () => {
  test("renders a section element", () => {
    const { container } = render(
      <DemoSection title="Title" description="Desc">
        <p>Content</p>
      </DemoSection>,
    );
    expect(container.querySelector("section")).not.toBeNull();
  });

  test("renders SectionHeader with title and description", () => {
    render(
      <DemoSection title="My Section" description="My description">
        <p>Content</p>
      </DemoSection>,
    );
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("My Section");
    expect(screen.getByText("My description")).toBeDefined();
  });

  test("passes hint to SectionHeader", () => {
    render(
      <DemoSection title="Title" description="Desc" hint="A hint">
        <p>Content</p>
      </DemoSection>,
    );
    expect(screen.getByText("A hint")).toBeDefined();
  });

  test("renders children after the header", () => {
    render(
      <DemoSection title="Title" description="Desc">
        <p>Demo content here</p>
      </DemoSection>,
    );
    expect(screen.getByText("Demo content here")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test apps/demo/components/demo-section/demo-section.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the CSS module**

Create `apps/demo/components/demo-section/styles.module.css`:

```css
.demoSection {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}
```

- [ ] **Step 4: Write the component**

Create `apps/demo/components/demo-section/demo-section.tsx`:

```tsx
import type { ReactNode } from "react";
import { SectionHeader } from "@/components/section-header/section-header";
import styles from "./styles.module.css";

export function DemoSection({
  title,
  description,
  hint,
  children,
}: {
  title: string;
  description: ReactNode;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.demoSection}>
      <SectionHeader title={title} description={description} hint={hint} />
      {children}
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `vp test apps/demo/components/demo-section/demo-section.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add apps/demo/components/demo-section/
git commit -m "feat(demo): add DemoSection component"
```

---

## Task 4: Create `HeroSection` component

**Files:**
- Create: `apps/demo/components/hero-section/hero-section.tsx`
- Create: `apps/demo/components/hero-section/styles.module.css`
- Create: `apps/demo/components/hero-section/hero-section.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/demo/components/hero-section/hero-section.test.tsx`:

```tsx
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { HeroSection } from "./hero-section";

afterEach(cleanup);

describe("HeroSection", () => {
  test("renders the Bones heading", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Bones");
  });

  test("renders the subtitle text", () => {
    render(<HeroSection />);
    expect(screen.getByText(/Primitives for inline skeleton loaders/)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test apps/demo/components/hero-section/hero-section.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the CSS module**

Create `apps/demo/components/hero-section/styles.module.css`:

```css
.hero {
  text-align: center;
  padding: 3rem 0 2rem;
}

.hero h1 {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.heroSubtitle {
  color: var(--muted);
  font-size: 1.125rem;
  margin-top: 0.5rem;
}
```

- [ ] **Step 4: Write the component**

Create `apps/demo/components/hero-section/hero-section.tsx`:

```tsx
import styles from "./styles.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <h1>Bones</h1>
      <p className={styles.heroSubtitle}>
        Primitives for inline skeleton loaders in React.
        <br />
        Same component, both states.
      </p>
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `vp test apps/demo/components/hero-section/hero-section.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add apps/demo/components/hero-section/
git commit -m "feat(demo): add HeroSection component"
```

---

## Task 5: Create `SuspenseDemo` component

**Files:**
- Create: `apps/demo/components/suspense-demo/suspense-demo.tsx`
- Create: `apps/demo/components/suspense-demo/suspense-demo.test.tsx`

No CSS module needed — this component delegates layout to `DemoSection` and `PokemonGrid`.

- [ ] **Step 1: Write the failing test**

Create `apps/demo/components/suspense-demo/suspense-demo.test.tsx`:

```tsx
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { SuspenseDemo } from "./suspense-demo";

vi.mock("bones", () => ({
  createBones: () => ({
    bone: () => ({}),
    repeat: <T,>(arr: T[] | undefined, count: number): (T | undefined)[] =>
      arr ?? Array.from({ length: count }, () => undefined),
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

const pokemon = [
  { id: 1, name: "bulbasaur", sprite: "https://example.com/1.png", types: ["grass", "poison"] },
  { id: 4, name: "charmander", sprite: "https://example.com/4.png", types: ["fire"] },
];

describe("SuspenseDemo", () => {
  test("renders the section title", () => {
    render(<SuspenseDemo pokemon={pokemon} />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "Streaming with Suspense",
    );
  });

  test("renders pokemon names", () => {
    render(<SuspenseDemo pokemon={pokemon} />);
    expect(screen.getByText("bulbasaur")).toBeDefined();
    expect(screen.getByText("charmander")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test apps/demo/components/suspense-demo/suspense-demo.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the component**

Create `apps/demo/components/suspense-demo/suspense-demo.tsx`:

```tsx
import { Suspense } from "react";
import type { PokemonListItem } from "@/lib/pokeapi";
import { delay } from "@/lib/delay";
import { DemoSection } from "@/components/demo-section/demo-section";
import { PokemonGrid } from "@/components/pokemon-grid/pokemon-grid";

export function SuspenseDemo({ pokemon }: { pokemon: PokemonListItem[] }) {
  return (
    <DemoSection
      title="Streaming with Suspense"
      description={
        <>
          Pass a promise to <code>PokemonGrid</code> inside a <code>{"<Suspense>"}</code>{" "}
          boundary. The <strong>same component</strong> renders as skeletons in the fallback, then
          swaps to content when data resolves.
        </>
      }
      hint="Refresh the page to see the skeleton → content transition."
    >
      <Suspense fallback={<PokemonGrid />}>
        <PokemonGrid pokemon={delay(Promise.resolve(pokemon), 2000)} />
      </Suspense>
    </DemoSection>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `vp test apps/demo/components/suspense-demo/suspense-demo.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/demo/components/suspense-demo/
git commit -m "feat(demo): add SuspenseDemo component"
```

---

## Task 6: Create `ForcedSkeletonsDemo` component

**Files:**
- Create: `apps/demo/components/forced-skeletons-demo/forced-skeletons-demo.tsx`
- Create: `apps/demo/components/forced-skeletons-demo/forced-skeletons-demo.test.tsx`

No CSS module needed — delegates layout to `DemoSection`, `SkeletonToggle`, and `PokemonGrid`.

- [ ] **Step 1: Write the failing test**

Create `apps/demo/components/forced-skeletons-demo/forced-skeletons-demo.test.tsx`:

```tsx
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { ForcedSkeletonsDemo } from "./forced-skeletons-demo";

vi.mock("bones", () => ({
  createBones: () => ({
    bone: () => ({}),
    repeat: <T,>(arr: T[] | undefined, count: number): (T | undefined)[] =>
      arr ?? Array.from({ length: count }, () => undefined),
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

const pokemon = [
  { id: 1, name: "bulbasaur", sprite: "https://example.com/1.png", types: ["grass", "poison"] },
];

describe("ForcedSkeletonsDemo", () => {
  test("renders the section title", () => {
    render(<ForcedSkeletonsDemo pokemon={pokemon} />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Forced Skeletons");
  });

  test("renders the toggle button", () => {
    render(<ForcedSkeletonsDemo pokemon={pokemon} />);
    expect(screen.getByRole("button", { name: "Force Skeletons" })).toBeDefined();
  });

  test("renders pokemon names", () => {
    render(<ForcedSkeletonsDemo pokemon={pokemon} />);
    expect(screen.getByText("bulbasaur")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test apps/demo/components/forced-skeletons-demo/forced-skeletons-demo.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the component**

Create `apps/demo/components/forced-skeletons-demo/forced-skeletons-demo.tsx`:

```tsx
import type { PokemonListItem } from "@/lib/pokeapi";
import { DemoSection } from "@/components/demo-section/demo-section";
import { PokemonGrid } from "@/components/pokemon-grid/pokemon-grid";
import { SkeletonToggle } from "@/components/skeleton-toggle/skeleton-toggle";

export function ForcedSkeletonsDemo({ pokemon }: { pokemon: PokemonListItem[] }) {
  return (
    <DemoSection
      title="Forced Skeletons"
      description="Omit data to force skeleton mode. Toggle to see the same loaded cards switch to skeletons — no provider needed."
    >
      <SkeletonToggle skeleton={<PokemonGrid />}>
        <PokemonGrid pokemon={pokemon} />
      </SkeletonToggle>
    </DemoSection>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `vp test apps/demo/components/forced-skeletons-demo/forced-skeletons-demo.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/demo/components/forced-skeletons-demo/
git commit -m "feat(demo): add ForcedSkeletonsDemo component"
```

---

## Task 7: Create `MultiLineTextDemo` component

**Files:**
- Create: `apps/demo/components/multi-line-text-demo/multi-line-text-demo.tsx`
- Create: `apps/demo/components/multi-line-text-demo/styles.module.css`
- Create: `apps/demo/components/multi-line-text-demo/multi-line-text-demo.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/demo/components/multi-line-text-demo/multi-line-text-demo.test.tsx`:

```tsx
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { MultiLineTextDemo } from "./multi-line-text-demo";

vi.mock("bones", () => ({
  createBones: () => ({
    bone: () => ({}),
    repeat: <T,>(arr: T[] | undefined, count: number): (T | undefined)[] =>
      arr ?? Array.from({ length: count }, () => undefined),
  }),
}));

afterEach(cleanup);

describe("MultiLineTextDemo", () => {
  test("renders the section title", () => {
    render(<MultiLineTextDemo />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Multi-Line Text");
  });

  test("renders the article with content", () => {
    render(<MultiLineTextDemo />);
    expect(screen.getByText("Understanding React Server Components")).toBeDefined();
  });

  test("renders two article previews", () => {
    const { container } = render(<MultiLineTextDemo />);
    const headings = container.querySelectorAll("h3");
    expect(headings.length).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test apps/demo/components/multi-line-text-demo/multi-line-text-demo.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the CSS module**

Create `apps/demo/components/multi-line-text-demo/styles.module.css`:

```css
.articleDemos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 600px) {
  .articleDemos {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Write the component**

Create `apps/demo/components/multi-line-text-demo/multi-line-text-demo.tsx`:

```tsx
import { ArticlePreview } from "@/components/article-preview/article-preview";
import { DemoSection } from "@/components/demo-section/demo-section";
import styles from "./styles.module.css";

export function MultiLineTextDemo() {
  return (
    <DemoSection
      title="Multi-Line Text"
      description={
        <>
          Pass <code>{"{ lines: N }"}</code> to <code>bone("text")</code> to create
          paragraph-sized placeholders. The skeleton automatically generates one bar per line
          using a CSS repeating gradient — no extra DOM elements.
        </>
      }
    >
      <div className={styles.articleDemos}>
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
    </DemoSection>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `vp test apps/demo/components/multi-line-text-demo/multi-line-text-demo.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add apps/demo/components/multi-line-text-demo/
git commit -m "feat(demo): add MultiLineTextDemo component"
```

---

## Task 8: Create `ThemingDemo` component

**Files:**
- Create: `apps/demo/components/theming-demo/theming-demo.tsx`
- Create: `apps/demo/components/theming-demo/styles.module.css`
- Create: `apps/demo/components/theming-demo/theming-demo.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/demo/components/theming-demo/theming-demo.test.tsx`:

```tsx
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { ThemingDemo } from "./theming-demo";

vi.mock("bones", () => ({
  createBones: () => ({
    bone: () => ({}),
    repeat: <T,>(arr: T[] | undefined, count: number): (T | undefined)[] =>
      arr ?? Array.from({ length: count }, () => undefined),
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

describe("ThemingDemo", () => {
  test("renders the section title", () => {
    render(<ThemingDemo />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Theming");
  });

  test("renders Warm, Cool, and Dark theme labels", () => {
    render(<ThemingDemo />);
    expect(screen.getByText("Warm")).toBeDefined();
    expect(screen.getByText("Cool")).toBeDefined();
    expect(screen.getByText("Dark")).toBeDefined();
  });

  test("renders three theme containers", () => {
    const { container } = render(<ThemingDemo />);
    const headings = container.querySelectorAll("h3");
    expect(headings.length).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test apps/demo/components/theming-demo/theming-demo.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the CSS module**

Create `apps/demo/components/theming-demo/styles.module.css`:

```css
.themeDemos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.themeDemo {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
}

.themeDemo h3 {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 0.75rem;
}

@media (max-width: 600px) {
  .themeDemos {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Write the component**

Create `apps/demo/components/theming-demo/theming-demo.tsx`:

```tsx
import { DemoSection } from "@/components/demo-section/demo-section";
import { PokemonCard } from "@/components/pokemon-card/pokemon-card";
import styles from "./styles.module.css";

export function ThemingDemo() {
  return (
    <DemoSection
      title="Theming"
      description={
        <>
          Customize skeleton colors with CSS custom properties. Zero-runtime — just override{" "}
          <code>--bone-base</code> and <code>--bone-highlight</code>.
        </>
      }
    >
      <div className={styles.themeDemos}>
        <div
          className={styles.themeDemo}
          style={
            { "--bone-base": "#f5e6d3", "--bone-highlight": "#faf0e6" } as React.CSSProperties
          }
        >
          <h3>Warm</h3>
          <PokemonCard />
        </div>
        <div
          className={styles.themeDemo}
          style={
            { "--bone-base": "#d3e5f5", "--bone-highlight": "#e6f0fa" } as React.CSSProperties
          }
        >
          <h3>Cool</h3>
          <PokemonCard />
        </div>
        <div
          className={styles.themeDemo}
          style={
            { "--bone-base": "#2a2a2a", "--bone-highlight": "#3a3a3a" } as React.CSSProperties
          }
        >
          <h3>Dark</h3>
          <PokemonCard />
        </div>
      </div>
    </DemoSection>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `vp test apps/demo/components/theming-demo/theming-demo.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add apps/demo/components/theming-demo/
git commit -m "feat(demo): add ThemingDemo component"
```

---

## Task 9: Rewrite `page.tsx` and delete `page.module.css`

**Files:**
- Modify: `apps/demo/app/page.tsx`
- Delete: `apps/demo/app/page.module.css`

- [ ] **Step 1: Rewrite page.tsx**

Replace the contents of `apps/demo/app/page.tsx` with:

```tsx
import { fetchPokemonList } from "@/lib/pokeapi";
import { HeroSection } from "@/components/hero-section/hero-section";
import { SuspenseDemo } from "@/components/suspense-demo/suspense-demo";
import { ForcedSkeletonsDemo } from "@/components/forced-skeletons-demo/forced-skeletons-demo";
import { MultiLineTextDemo } from "@/components/multi-line-text-demo/multi-line-text-demo";
import { ThemingDemo } from "@/components/theming-demo/theming-demo";

export default async function Home() {
  const pokemon = await fetchPokemonList(12);

  return (
    <main>
      <HeroSection />
      <SuspenseDemo pokemon={pokemon} />
      <ForcedSkeletonsDemo pokemon={pokemon} />
      <MultiLineTextDemo />
      <ThemingDemo />
    </main>
  );
}
```

- [ ] **Step 2: Delete page.module.css**

```bash
rm apps/demo/app/page.module.css
```

- [ ] **Step 3: Run all tests to verify nothing is broken**

Run: `vp test apps/demo/`
Expected: All tests pass.

- [ ] **Step 4: Run type check**

Run: `vp check`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add apps/demo/app/page.tsx
git rm apps/demo/app/page.module.css
git commit -m "refactor(demo): replace page.tsx with composed section components"
```
