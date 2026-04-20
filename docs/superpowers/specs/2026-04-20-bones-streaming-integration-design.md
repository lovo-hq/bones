# Bones Streaming Integration

## Problem

`useBone` currently determines loading state by checking if data is falsy:

```ts
const isLoading = ctx.forced || !data;
```

This is ambiguous. `undefined` could mean "data hasn't loaded yet" or "data loaded but the value is undefined/null/empty." A resolved API call that returns `undefined`, `null`, `0`, or `""` will keep the skeleton visible forever. The loading signal is inaccurate.

## Solution

Use promises as the loading signal instead of data truthiness. A pending promise means loading; a resolved promise means done — regardless of the resolved value.

The `Bones` component becomes the orchestration layer that bridges promises and Suspense. `useBone` stays unchanged — it handles skeleton prop generation, nothing more. This separates async data resolution from skeleton rendering.

## Design Decisions

These decisions were made during the design phase and should not be revisited during implementation:

1. **Separation of concerns over a single hook.** `useBone` does not call `use()` or handle promises. `Bones` handles async orchestration via Suspense. Rationale: if `useBone` called `use()` internally, the component would suspend and never render as a skeleton — you'd still need a wrapper component for the Suspense fallback, resulting in more total complexity.

2. **No explicit fallback prop.** `Bones` always uses `children(undefined)` as the Suspense fallback. The component is its own skeleton — that's the entire value proposition of this library. Consumers who need a custom fallback can use raw `<Suspense>` directly.

3. **`Bones` detects arrays automatically.** When `value` is an array of streamables, `Bones` calls `Streamable.all()` internally. Consumers never import or use `Streamable.all()` directly.

4. **`forced` as an explicit prop.** The force-skeleton behavior (for demos/testing/Storybook) is a named prop on `Bones`, not a separate component. `<Bones forced>` replaces the current `<Bones>` provider usage.

5. **`Stream` component removed.** `Bones` replaces it entirely.

## Architecture

### Bones Component

Two mutually exclusive modes enforced by TypeScript discriminated unions:

**Streaming mode** — resolves a `Streamable<T>` via Suspense, renders the component as its own skeleton fallback:

```tsx
<Bones value={pokemonPromise}>
  {(pokemon) => <PokemonCard pokemon={pokemon} />}
</Bones>
```

Internally:

```tsx
function Bones({ value, children, ...themeProps }) {
  const streamable = Array.isArray(value) ? Streamable.all(value) : value;

  return (
    <ThemeWrapper {...themeProps}>
      <Suspense fallback={children(undefined)}>
        <Resolved value={streamable}>{children}</Resolved>
      </Suspense>
    </ThemeWrapper>
  );
}
```

`Resolved` is an internal component that calls `useStreamable(value)` (which calls React's `use()`) to unwrap the promise, then passes the result to `children`.

**Array shorthand** — multiple data sources without importing `Streamable.all()`:

```tsx
<Bones value={[pokemonPromise, movesPromise]}>
  {([pokemon, moves]) => <PokemonDetail pokemon={pokemon} moves={moves} />}
</Bones>
```

`Bones` detects the array, routes through `Streamable.all()` (which ensures stable promise identity via the existing `weakRefCache`), and the rest works identically.

**Forced mode** — forces skeleton state on all nested `useBone` calls via context:

```tsx
<Bones forced>
  <PokemonCard pokemon={realData} />
</Bones>
```

**Theming** works in both modes via CSS custom property props:

```tsx
<Bones value={promise} baseColor="#ccc" highlightColor="#ddd" duration={2}>
  {(pokemon) => <PokemonCard pokemon={pokemon} />}
</Bones>
```

### useBone Hook

No changes. Accepts `T | undefined | null`, returns `{ bone, data, isLoading, repeat }`. Reads forced state from `BonesContext`. Does not know about promises or Suspense.

### Streamable Utilities

The existing `streamable.tsx` infrastructure stays as-is:

- `Streamable<T>` type (`T | Promise<T>`) — exported for consumer type annotations
- `Streamable.from(thunk)` — exported for advanced lazy evaluation use cases
- `Streamable.all(streamables)` — stays in codebase, used internally by `Bones`, not needed by consumers directly
- `useStreamable(streamable)` — internal, used inside the `Resolved` component
- `weakRefCache`, `stableKeys`, `promiseCache` — internal, ensures promise identity stability for Suspense

### TypeScript Types

`BonesProps` becomes a discriminated union:

```ts
interface BonesStreamingProps<T> {
  value: Streamable<T>;
  children: (data: T | undefined) => ReactNode;
  forced?: never;
  baseColor?: string;
  highlightColor?: string;
  duration?: number;
}

interface BonesArrayProps<T extends readonly Streamable<unknown>[]> {
  value: T;
  children: (data: { -readonly [P in keyof T]: Awaited<T[P]> } | undefined) => ReactNode;
  forced?: never;
  baseColor?: string;
  highlightColor?: string;
  duration?: number;
}

interface BonesForcedProps {
  forced: true;
  children: ReactNode;
  value?: never;
  baseColor?: string;
  highlightColor?: string;
  duration?: number;
}
```

### Server Component Compatibility

Server components can create promises and pass them to `Bones` (a client component) without awaiting:

```tsx
// Server component
async function PokemonPage({ params }: { params: { id: string } }) {
  const pokemonPromise = fetchPokemon(params.id);

  return (
    <Bones value={pokemonPromise}>
      {(pokemon) => <PokemonCard pokemon={pokemon} />}
    </Bones>
  );
}
```

The server streams the unresolved promise to the client. `Bones` wraps it in Suspense. The client renders the skeleton fallback immediately, then swaps to content when the promise resolves. This is the standard React 19 streaming pattern.

## Public API

| Export | Purpose | Used by |
|--------|---------|---------|
| `Bones` | Streaming orchestration + forced skeleton mode | Most consumers |
| `useBone` | Skeleton prop generation inside components | Most consumers |
| `useBones` | Read bones context (forced state) | Advanced consumers |
| `Streamable` type | Type annotation for promise-or-value | Consumers typing props |
| `Streamable.from()` | Lazy promise creation | Advanced consumers |

## What Changes

| Item | Change |
|------|--------|
| `Bones` component (`bones.tsx`) | Rewritten — streaming + forced modes |
| `BonesProps` type (`types.ts`) | Rewritten — discriminated union with generics |
| `index.ts` exports | Updated — add `Streamable` type export, remove `Stream` |
| `Stream` component (`streamable.tsx`) | Removed — replaced by `Bones` |
| `UseStreamable` component (`streamable.tsx`) | Renamed to `Resolved`, stays internal |

## What Does Not Change

| Item | Reason |
|------|--------|
| `useBone` hook | Stays focused on prop generation |
| `useBones` hook | Still reads context |
| `BonesContext` | Still provides forced state |
| CSS / skeleton styling | Unrelated to data flow |
| `Streamable.all()`, `Streamable.from()` | Already correct |
| Promise caching infrastructure | Already correct |
| `useStreamable` hook | Already correct, used internally |
