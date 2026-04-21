# Bones Server-Compatible API: createBones

## Problem

Every component that uses Bones must be a client component because `useBone` is a React hook (`useCallback`, `useMemo`, `useContext`). This forces `"use client"` boundaries on components that otherwise just render markup — like `PokemonCard`, which takes data and returns JSX with no interactivity.

The core logic of `useBone` doesn't actually need hooks. It checks whether data is present, then returns skeleton props or empty objects. That's a conditional, not state. Making it a plain function removes the client component requirement and lets Bones work in server components.

## Solution

Replace the entire hook-based API with a single plain function: `createBones`. Remove the `<Bones>` component, `Streamable` utilities, context providers, and all hooks. The library becomes `createBones` + CSS.

`createBones` accepts data or a promise of data. When given a promise, it uses the throw-promise pattern (same mechanism as React's `use()`) to integrate with Suspense — throwing pending promises so React shows the fallback, returning resolved values when ready. This is a plain function, not a hook, so it works in both server and client components.

The recommended pattern is **fetch outside, component is its own skeleton**: data fetching lives in the parent, the component receives data (or a promise) as a prop, and the same component renders as the Suspense fallback without data to show skeletons. One component, one markup, no separate skeleton to maintain.

## Design Decisions

1. **Plain function, not a hook.** `createBones` has no React hook dependencies — no `useState`, `useContext`, `useCallback`, `useMemo`. It works identically in server components, client components, or plain JavaScript.

2. **Promise support via throw-promise pattern.** When `createBones` receives a promise, it uses the `readPromise` pattern (WeakMap-based promise tracking) to integrate with Suspense. Pending promises are thrown (Suspense catches them and shows the fallback), resolved values are returned. This is the same mechanism React's `use()` hook uses internally, but as a plain function.

3. **`data` in return.** Because consumers may pass a promise, they need the resolved value back. `data` is `undefined` when loading (no data or pending promise) and the resolved value when ready.

4. **No `isLoading` in return.** `data` being `undefined` already signals loading, and `bone()` handles prop generation internally.

5. **No context, no providers.** The `BonesContext` and `BonesForcedProvider` are removed. Forced skeleton mode (for demos) is achieved by omitting data: `createBones(undefined)` or rendering the component without its data prop.

6. **Remove `<Bones>` component and `Streamable` utilities.** These handled Suspense orchestration and promise caching. `createBones` handles promise resolution directly. `Streamable.from()` and `Streamable.all()` are no longer needed.

7. **Fetch outside, component is its own skeleton.** Data fetching lives in the parent (page, layout, or grid). The component receives data or a promise as a prop. The same component is used as the Suspense fallback without data — it renders skeletons via `createBones(undefined)`. This avoids separate skeleton components and `loading` props.

8. **CSS unchanged.** The `data-bone` attribute selectors, CSS custom properties, animations, and dark mode support stay exactly as-is.

## Architecture

### createBones Function

```ts
function createBones<T>(data: T | Promise<T> | undefined | null): CreateBonesReturn<T>
```

**Returns:**

```ts
interface CreateBonesReturn<T> {
  bone: (type: BoneType, options?: BoneOptions) => BoneProps;
  data: T | undefined;
  repeat: <U>(arr: U[] | undefined | null, count: number) => (U | undefined)[];
}
```

**Promise resolution:** If `data` is a `Promise`, `createBones` calls an internal `readPromise` function:
- Tracks promises in a `WeakSet` (to attach `.then`/`.catch` only once)
- Stores results in a `WeakMap<Promise, T>` and errors in a `WeakMap<Promise, Error>`
- If resolved: returns the result
- If errored: throws the error (caught by ErrorBoundary)
- If pending: throws the promise (caught by Suspense, shows fallback)

**Loading detection:** After promise resolution, `!resolved` determines loading state. `undefined` and `null` mean loading. Truthy values and empty arrays mean loaded.

**`bone(type, options?)`** — identical logic to current `useBone`:
- When loading: returns `{ "data-bone": type, "aria-busy": true, ...styleProps }`
- When not loading: returns `{}`
- Text type: sets `--bone-length`, `--bone-lines`, `--bone-shadows`, `--bone-contained` CSS variables
- Block type: sets `src` to transparent pixel data URI
- Container type: just the data attribute

**`repeat(arr, count)`** — identical logic:
- When loading: returns `Array(count).fill(undefined)`
- When not loading: returns `arr ?? []`

### readPromise (Internal)

```ts
const tracked = new WeakSet<Promise<unknown>>();
const results = new WeakMap<Promise<unknown>, unknown>();
const errors = new WeakMap<Promise<unknown>, unknown>();

function readPromise<T>(promise: Promise<T>): T {
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

### Consumer Usage

**PokemonCard — renders data or skeletons, no `"use client"` needed:**

```tsx
import { createBones } from "bones";

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

**PokemonGrid — receives a promise, uses `createBones` to resolve it:**

```tsx
import { createBones } from "bones";

function PokemonGrid({ pokemon }: { pokemon?: Promise<PokemonListItem[]> | PokemonListItem[] }) {
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

**Page — fetches outside, component is its own Suspense fallback:**

```tsx
export default function Page() {
  return (
    <Suspense fallback={<PokemonGrid />}>
      <PokemonGrid pokemon={fetchPokemon()} />
    </Suspense>
  );
}
```

- **Fallback:** no prop → `createBones(undefined)` → `repeat(undefined, 12)` returns 12 `undefined` items → 12 skeleton `PokemonCard` components
- **Promise pending:** `createBones(promise)` throws → Suspense shows fallback
- **Promise resolves:** React re-renders → `readPromise` returns resolved array → `repeat(data, 12)` returns real items → real `PokemonCard` components

**Forced skeleton for demos (just omit data):**

```tsx
<PokemonCard />           {/* no pokemon prop = skeletons */}
<PokemonGrid />           {/* no pokemon prop = 12 skeleton cards */}
```

## Public API

| Export | Purpose |
|--------|---------|
| `createBones` | Skeleton prop generation + promise resolution |
| `BoneType` | `"text" \| "block" \| "container"` type |
| `BoneOptions` | Options for `bone()` calls |
| `CreateBonesReturn` | Return type of `createBones` |

CSS import: `import "bones/css"`

## File Structure

### After

```
src/
  index.ts          — exports createBones + types
  create-bones.ts   — the function, readPromise, and types
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
| Return shape | `{ bone, data, isLoading, repeat }` → `{ bone, data, repeat }` |
| Promise support | `readPromise` pattern for Suspense integration |
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

The demo app (`apps/demo/`) uses `useBone` in `PokemonCard` and the `<Bones>` component. Update to:
- Replace `useBone` with `createBones` in all components
- Remove `"use client"` from components that no longer need it
- Move data fetching to parent components (pages/layouts)
- Use the same components as Suspense fallbacks (no data prop = skeleton)

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
- Promise support: pending promise throws (for Suspense)
- Promise support: resolved promise returns data
- Promise support: errored promise throws error (for ErrorBoundary)
- `readPromise` tracks promises only once (WeakSet)
- CSS skeleton rendering unchanged
