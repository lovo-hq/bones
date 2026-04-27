# vite-plus-starter

A starter for creating a Vite Plus project.

## Development

- Install dependencies:

```bash
vp install
```

- Run the unit tests:

```bash
vp test
```

- Build the library:

```bash
vp pack
```

## How It Works

The diagram below shows the full data lifecycle through the bones library — from `createBones` input to rendered output.

```mermaid
flowchart TD
    A["Component calls createBones(data)"] --> B{"options.loading\n=== true?"}

    B -- Yes --> SKEL[Skeleton mode]
    B -- No --> C{"data === forceBones?"}

    C -- Yes --> SKEL
    C -- No --> D{"getBonesContext()\n.loading === true?"}

    D -- Yes --> SKEL
    D -- No --> E{"data instanceof\nPromise?"}

    E -- No --> RESOLVED["Use data as-is"]
    E -- Yes --> RP["readPromise(promise)"]

    RP --> F{"promise._status?"}

    F -- undefined --> ATTACH["First call: attach .then() handlers\nSet _status = 'pending'"] --> THROW

    F -- "'pending'" --> THROW["Throw promise\n(Suspense catches it)"]
    F -- "'fulfilled'" --> RETURN["Return resolved value"]
    F -- "'rejected'" --> ERR["Throw error\n(caught by Error Boundary)"]

    THROW --> FALLBACK

    subgraph FALLBACK ["Suspense Fallback (via Bones component)"]
        direction TB
        BS["BonesStart renders:\nmutates shared React.cache() object\nsets .loading = true"] --> CHILDREN["Children render\n— all createBones() calls\nsee loading === true"]
        CHILDREN --> BE["BonesEnd renders:\nsets .loading = false\non same cached object"]
    end

    FALLBACK --> SKEL

    RETURN --> DATA["resolved data available"]
    RESOLVED --> DATA

    SKEL --> BONE_LOAD["bone(type) returns\n{ data-bone: type, aria-busy: true }\n+ CSS custom property styles"]
    DATA --> BONE_DATA["bone(type) returns {}\n(empty object)"]

    BONE_LOAD --> CSS["CSS activates:\n[data-bone] pseudo-elements\nrender skeleton bars/blocks/overlays\nshimmer or pulse animation"]

    CSS --> RESOLVE_EVENT["Promise resolves\n→ React re-renders"]
    RESOLVE_EVENT --> BONE_DATA

    BONE_DATA --> DONE["Real content visible\nSame DOM structure\nNo layout shift"]
```
