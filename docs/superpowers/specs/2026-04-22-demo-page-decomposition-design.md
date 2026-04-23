# Demo Page Decomposition

## Goal

Break `apps/demo/app/page.tsx` into focused section components, each with its own CSS module and test file. The page becomes a thin composition layer that fetches data and renders sections.

## Architecture

```
page.tsx (async server component — data fetching + composition)
├── HeroSection
├── DemoSection (structural wrapper, used by all demos below)
│   └── SectionHeader (heading / description / hint)
├── SuspenseDemo (receives pokemon data)
├── ForcedSkeletonsDemo (receives pokemon data)
├── MultiLineTextDemo (no props)
└── ThemingDemo (no props)
```

## New Components

All components live under `apps/demo/components/` following the existing convention: each in its own directory with a component file, `styles.module.css`, and a `.test.tsx` file.

### SectionHeader — `components/section-header/`

Renders the repeated heading pattern used by every demo section.

**Props:**

| Prop          | Type        | Required | Description                                      |
|---------------|-------------|----------|--------------------------------------------------|
| `title`       | `string`    | yes      | Section heading text (rendered as `<h2>`)        |
| `description` | `ReactNode` | yes      | Section description (supports inline JSX)        |
| `hint`        | `string`    | no       | Italic hint text below description               |

**Renders:** `div > h2 + p.description + optional p.hint`

**Styles absorbed from `page.module.css`:** `.sectionHeader`, `.sectionDesc`, `.sectionHint`

### DemoSection — `components/demo-section/`

Structural wrapper for each demo section. Renders a `<section>` with border-top/margin styles, composes `SectionHeader` from its props, and renders `children` after it.

**Props:**

| Prop          | Type        | Required | Description                                |
|---------------|-------------|----------|--------------------------------------------|
| `title`       | `string`    | yes      | Passed through to `SectionHeader`          |
| `description` | `ReactNode` | yes      | Passed through to `SectionHeader`          |
| `hint`        | `string`    | no       | Passed through to `SectionHeader`          |
| `children`    | `ReactNode` | yes      | Demo content rendered below the header     |

**Styles absorbed from `page.module.css`:** `.demoSection`

### HeroSection — `components/hero-section/`

The top-of-page hero banner. No props.

**Styles absorbed from `page.module.css`:** `.hero`, `.heroSubtitle`

### SuspenseDemo — `components/suspense-demo/`

Demonstrates streaming with Suspense. Handles the `delay()` call and `<Suspense>` boundary internally.

**Props:**

| Prop      | Type               | Required | Description          |
|-----------|--------------------|----------|----------------------|
| `pokemon` | `PokemonListItem[]`| yes      | Resolved pokemon data|

**Imports:** `delay` from `@/lib/delay`, `PokemonGrid`, `Suspense` from React.

### ForcedSkeletonsDemo — `components/forced-skeletons-demo/`

Demonstrates forcing skeleton mode by omitting data, with a toggle.

**Props:**

| Prop      | Type               | Required | Description          |
|-----------|--------------------|----------|----------------------|
| `pokemon` | `PokemonListItem[]`| yes      | Resolved pokemon data|

**Imports:** `DemoSection`, `SkeletonToggle`, `PokemonGrid`.

### MultiLineTextDemo — `components/multi-line-text-demo/`

Demonstrates multi-line text skeletons with `ArticlePreview`. No props.

**Styles absorbed from `page.module.css`:** `.articleDemos`

**Imports:** `DemoSection`, `ArticlePreview`.

### ThemingDemo — `components/theming-demo/`

Demonstrates CSS custom property theming with three color variants. No props.

**Styles absorbed from `page.module.css`:** `.themeDemos`, `.themeDemo`

**Imports:** `DemoSection`, `PokemonCard`.

## New Utility

### `lib/delay.ts`

Extracted from `page.tsx`:

```ts
export function delay<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve) => {
    promise.then((value) => setTimeout(() => resolve(value), ms));
  });
}
```

## Resulting page.tsx

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

`page.module.css` is deleted — all styles move to the new component CSS modules.

## Testing

Each component gets a `.test.tsx` following the existing pattern:

- Import from `@testing-library/react` and `vite-plus/test`
- Mock `bones` with a stub `createBones` where needed
- Mock `next/link` where needed
- `afterEach(cleanup)`
- Test rendering, props, and key behaviors

`delay` gets a unit test in `lib/delay.test.ts`.

## Files Created

| File | Purpose |
|------|---------|
| `components/section-header/section-header.tsx` | SectionHeader component |
| `components/section-header/styles.module.css` | SectionHeader styles |
| `components/section-header/section-header.test.tsx` | SectionHeader tests |
| `components/demo-section/demo-section.tsx` | DemoSection component |
| `components/demo-section/styles.module.css` | DemoSection styles |
| `components/demo-section/demo-section.test.tsx` | DemoSection tests |
| `components/hero-section/hero-section.tsx` | HeroSection component |
| `components/hero-section/styles.module.css` | HeroSection styles |
| `components/hero-section/hero-section.test.tsx` | HeroSection tests |
| `components/suspense-demo/suspense-demo.tsx` | SuspenseDemo component |
| `components/suspense-demo/suspense-demo.test.tsx` | SuspenseDemo tests |
| `components/forced-skeletons-demo/forced-skeletons-demo.tsx` | ForcedSkeletonsDemo component |
| `components/forced-skeletons-demo/forced-skeletons-demo.test.tsx` | ForcedSkeletonsDemo tests |
| `components/multi-line-text-demo/multi-line-text-demo.tsx` | MultiLineTextDemo component |
| `components/multi-line-text-demo/styles.module.css` | MultiLineTextDemo styles |
| `components/multi-line-text-demo/multi-line-text-demo.test.tsx` | MultiLineTextDemo tests |
| `components/theming-demo/theming-demo.tsx` | ThemingDemo component |
| `components/theming-demo/styles.module.css` | ThemingDemo styles |
| `components/theming-demo/theming-demo.test.tsx` | ThemingDemo tests |
| `lib/delay.ts` | delay utility |
| `lib/delay.test.ts` | delay tests |

## Files Modified

| File | Change |
|------|--------|
| `app/page.tsx` | Replaced with slim composition of section components |
| `app/page.module.css` | Deleted — styles distributed to component CSS modules |
