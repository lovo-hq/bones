# Specific Bone Class Names

Replace the generic `.bone-placeholder` class with two purpose-specific classes: `.bone-text` and `.bone-block`. Remove the `<Bone>` and `<BoneImage>` components, making `useBone` the sole API.

## Motivation

The current `.bone-placeholder` class uses element selectors (`h1.bone-placeholder`, `img.bone-placeholder`) and attribute selectors (`[style*="--bone-lines"]`) to differentiate visual behavior. This is fragile — especially for the `useBone` headless API, where the CSS can't reliably infer intent from the element alone. The caller needs to declare "this is text" vs "this is a block" explicitly.

Separately, the `<Bone>` and `<BoneImage>` components are redundant now that `useBone` exists. The prop getter pattern lets users tie skeleton state into their existing elements without wrapper components.

## CSS

### Design tokens

`:root` custom properties are unchanged:

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
```

### `.bone-text`

Single-line text skeleton. Solid background at `1ex` height with border radius.

```css
.bone-text {
  display: inline-block;
  min-width: 4ch;
  height: 1ex;
  color: transparent;
  background-color: var(--bone-base);
  border-radius: var(--bone-radius);
}
```

When `--bone-lines` is set, switches to a repeating gradient to draw multiple baseline-aligned bars inside a single element:

```css
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
```

The repeating gradient uses relative units (`1lh`, `1ex`) derived from the element's own font properties, so it scales responsively across screen sizes and font configurations.

### `.bone-block`

Solid rectangular placeholder for images, avatars, thumbnails, and generic non-text shapes. No default border radius — inherited from the element.

```css
.bone-block {
  display: inline-block;
  background-color: var(--bone-base);
}
```

### Removed

- `.bone-placeholder` class and all its rules
- All element-specific selectors (`h1.bone-placeholder`, `p.bone-placeholder`, `img.bone-placeholder`, etc.)
- Stacking margins (`.bone-placeholder + .bone-placeholder`)
- Gradient-based single-line background (replaced by solid `background-color`)

### Kept but unused

Keyframe definitions (`bone-shimmer`, `bone-pulse`) stay defined for future effect work (shimmer, pulse, solid) but are not applied to any class yet. The reduced-motion media query's selector updates from `.bone-placeholder` to a generic form (e.g., `[aria-busy="true"]`) so it's ready when effects are wired up.

## `useBone` API

The prop getter signature changes to require a type as the first argument:

```ts
type BoneType = "text" | "block";

interface BoneOptions {
  lines?: number; // only meaningful for "text"
}

function useBone(loading: boolean): (type: BoneType, options?: BoneOptions) => BoneProps;
```

### Return values

- `bone("text")` returns `{ className: "bone-text", "aria-busy": true }`
- `bone("text", { lines: 3 })` returns `{ className: "bone-text", "aria-busy": true, style: { "--bone-lines": 3 } }`
- `bone("block")` returns `{ className: "bone-block", "aria-busy": true }`
- Not loading returns `{}`

All other styling (width, height, border-radius, circle) is the consumer's responsibility on the element itself. The hook only provides the class name and accessibility attribute.

### Usage

```tsx
const bone = useBone(!pokemon);

<h3 {...bone("text")}>{pokemon?.name}</h3>
<p {...bone("text", { lines: 3 })}>{pokemon?.description}</p>
<img {...bone("block")} src={pokemon?.sprite} width={120} height={120} style={{ borderRadius: "50%" }} />
```

## Component removal

`<Bone>` and `<BoneImage>` are deleted. This includes:

- `src/bone.tsx`
- `src/bone-image.tsx`
- `src/is-empty.ts` and its test file
- Their test files (`bone.test.tsx`, `bone-image.test.tsx`)
- Their exports from `src/index.ts`
- Their type exports from `src/types.ts` (`BoneOwnProps`, `BoneImageProps`, `PolymorphicProps`)

### Kept

- `<Bones>` provider — still needed for forcing skeleton state across a tree (demos, testing)
- `useBones` hook — still needed to query the provider context
- `BonesContext` — used by both `useBone` and `<Bones>`
- `isEmpty` utility — removed. It was only used by `<Bone>` to detect empty children; `useBone` takes an explicit `loading` boolean instead.

## Tests

All test assertions referencing `bone-placeholder` update to `bone-text` or `bone-block`. Tests for `<Bone>` and `<BoneImage>` are removed. New tests cover:

- `bone("text")` returns correct class and aria attribute
- `bone("block")` returns correct class and aria attribute
- `bone("text", { lines: 3 })` sets `--bone-lines` custom property
- Not loading returns empty object
- `<Bones>` provider still forces skeleton state through `useBone`

## Demo

Demo app updated to use `useBone` exclusively. The component-based examples (`<Bone>`, `<BoneImage>`) are replaced with headless prop getter patterns.
