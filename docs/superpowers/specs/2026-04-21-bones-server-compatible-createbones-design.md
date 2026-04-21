# Bones Server-Compatible API: createBones

## Problem

Every component that uses Bones must be a client component because `useBone` is a React hook (`useCallback`, `useMemo`, `useContext`). This forces `"use client"` boundaries on components that otherwise just render markup — like `PokemonCard`, which takes data and returns JSX with no interactivity.

The core logic of `useBone` doesn't actually need hooks. It checks whether data is present, then returns skeleton props or empty objects. That's a conditional, not state. Making it a plain function removes the client component requirement and lets Bones work in server components.

## Solution

Replace the entire hook-based API with a single plain function: `createBones`. Remove the `<Bones>` component, `Streamable` utilities, context providers, and all hooks. The library becomes `createBones` + CSS.

Consumers handle their own data fetching and Suspense boundaries. Bones is only responsible for skeleton prop generation.

## Design Decisions

1. **Plain function, not a hook.** `createBones` has no React dependencies — no `useState`, `useContext`, `useCallback`, `useMemo`. It works identically in server components, client components, or plain JavaScript.

2. **No context, no providers.** The `BonesContext` and `BonesForcedProvider` are removed. Forced mode (for demos) is achieved by omitting data: `createBones(undefined)`. No separate mechanism needed.

3. **No `data` in return.** The old `useBone` gated data through `isLoading` to return `undefined` during loading. With `createBones`, consumers use their original variable directly. Gating was only useful for forced mode with real data, which is no longer a pattern.

4. **No `isLoading` in return.** Consumers don't need it — `data` being `undefined` already signals loading, and `bone()` handles prop generation internally. The link-wrapping pattern in `PokemonCard` already checks `data` directly.

5. **Remove `<Bones>` component and `Streamable` utilities.** These handled Suspense orchestration and promise caching. With `createBones`, the library doesn't touch promises. Data fetching, Suspense boundaries, and streaming are the consumer's responsibility.

6. **CSS unchanged.** The `data-bone` attribute selectors, CSS custom properties, animations, and dark mode support stay exactly as-is.

## Architecture

### createBones Function

```ts
function createBones<T>(data: T | undefined | null): CreateBonesReturn
```

**Returns:**

```ts
interface CreateBonesReturn {
  bone: (type: BoneType, options?: BoneOptions) => BoneProps;
  repeat: <U>(arr: U[] | undefined | null, count: number) => (U | undefined)[];
}
```

**Loading detection:** `!data` — same as today minus the forced context check.

**`bone(type, options?)`** — identical logic to current `useBone`:
- When loading: returns `{ "data-bone": type, "aria-busy": true, ...styleProps }`
- When not loading: returns `{}`
- Text type: sets `--bone-length`, `--bone-lines`, `--bone-shadows`, `--bone-contained` CSS variables
- Block type: sets `src` to transparent pixel data URI
- Container type: just the data attribute

**`repeat(arr, count)`** — identical logic:
- When loading: returns `Array(count).fill(undefined)`
- When not loading: returns `arr ?? []`

### Consumer Usage

**Server component (no `"use client"` needed):**

```tsx
function PokemonCard({ pokemon }: { pokemon?: PokemonListItem }) {
  const { bone, repeat } = createBones(pokemon);

  return (
    <div className="card">
      <img src={pokemon?.sprite} width={120} height={120} {...bone("block")} />
      <h3 {...bone("text", { length: 9 })}>{pokemon?.name}</h3>
      <div className="card-types">
        {repeat(pokemon?.types, 2).map((type, i) => (
          <span key={type || i} {...bone("text", { contained: true, length: 7 })}>
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}
```

**With Suspense (server streaming):**

```tsx
<Suspense fallback={<PokemonCard />}>
  <PokemonGrid />
</Suspense>
```

**Forced skeleton for demos (just omit data):**

```tsx
<PokemonCard />  {/* no pokemon prop = skeletons */}
```

## Public API

| Export | Purpose |
|--------|---------|
| `createBones` | Skeleton prop generation |
| `BoneType` | `"text" \| "block" \| "container"` type |
| `BoneOptions` | Options for `bone()` calls |
| `CreateBonesReturn` | Return type of `createBones` |

CSS import: `import "bones/css"`

## File Structure

### After

```
src/
  index.ts          — exports createBones + types
  create-bones.ts   — the function + types
  css/bones.css     — unchanged
```

### Removed

| File | Reason |
|------|--------|
| `src/bones.tsx` | `<Bones>` component and `Streamable` utilities removed |
| `src/bones-forced.tsx` | `BonesForcedProvider` removed — no context needed |
| `src/context.ts` | `BonesContext` removed — no context needed |
| `src/use-bone.ts` | Replaced by `create-bones.ts` |
| `src/use-bones.ts` | Only exposed context state — context removed |
| `src/types.ts` | Types consolidated into `create-bones.ts` |

## What Changes

| Item | Change |
|------|--------|
| Core API | `useBone(data)` → `createBones(data)` |
| Return shape | `{ bone, data, isLoading, repeat }` → `{ bone, repeat }` |
| React dependency | Hooks + context → no React imports in core |
| `<Bones>` component | Removed |
| `Streamable` utilities | Removed |
| `useBones` hook | Removed |
| Context system | Removed |
| Package exports | Simplified to `createBones` + types |

## What Does Not Change

| Item | Reason |
|------|--------|
| CSS / skeleton styling | `data-bone` attributes unchanged, CSS selectors still match |
| `bone()` prop output | Same attributes, same style variables, same transparent pixel |
| `repeat()` behavior | Same array fill logic |
| `BoneType` values | `"text" \| "block" \| "container"` unchanged |
| `BoneOptions` shape | `length`, `lines`, `contained` unchanged |

## Migration

For existing consumers:

```diff
- "use client";
- import { useBone } from "bones";
+ import { createBones } from "bones";

  function PokemonCard({ pokemon }) {
-   const { bone, data, repeat } = useBone(pokemon);
+   const { bone, repeat } = createBones(pokemon);

    return (
      <div className="card">
-       <img src={data?.sprite} {...bone("block")} />
-       <h3 {...bone("text", { length: 9 })}>{data?.name}</h3>
+       <img src={pokemon?.sprite} {...bone("block")} />
+       <h3 {...bone("text", { length: 9 })}>{pokemon?.name}</h3>
      </div>
    );
  }
```

## Demo App Migration

The demo app (`apps/demo/`) uses `useBone` in `PokemonCard` and the `<Bones>` component. These need updating to `createBones` and removing `"use client"` where no longer needed. The demo's Suspense/streaming patterns stay as-is — only the Bones API calls change.

## Tests

Update existing test suites to cover `createBones`:

- `bone()` returns skeleton props when data is `undefined`/`null`
- `bone()` returns empty object when data is present
- Text type: `--bone-length`, `--bone-lines`, `--bone-shadows`, `--bone-contained` CSS variables
- Block type: transparent pixel `src`
- Container type: just `data-bone` attribute
- `repeat()` returns placeholder array when loading
- `repeat()` returns real array when data present
- Empty array `[]` is treated as loaded (not loading)
- CSS skeleton rendering unchanged
