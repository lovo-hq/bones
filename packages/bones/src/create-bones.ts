import { cache } from "react";

// ---------------------------------------------------------------------------
// Server-safe loading context via React.cache
//
// cache() returns the same value per request (server) or per render (client),
// so a flag set by a parent is visible to all descendants in the same pass.
// ---------------------------------------------------------------------------

export const getBonesContext = cache(() => ({ loading: false }));

export type BoneType = "text" | "block" | "container";

export interface BoneOptions {
  length?: number;
  lines?: number;
  contained?: boolean;
}

// ---------------------------------------------------------------------------
// readPromise — throw-promise pattern for Suspense integration
//
// Augments the promise with status fields (same approach as React's `use()`
// internals) so that settled state is readable synchronously on any call
// after the resolution microtask has fired.
// ---------------------------------------------------------------------------

type TrackedPromise<T> = Promise<T> & {
  _status?: "pending" | "fulfilled" | "rejected";
  _result?: T;
  _error?: unknown;
};

export function readPromise<T>(promise: Promise<T>): T {
  const tracked = promise as TrackedPromise<T>;

  if (tracked._status === undefined) {
    tracked._status = "pending";
    promise.then(
      (result) => {
        tracked._status = "fulfilled";
        tracked._result = result;
      },
      (error) => {
        tracked._status = "rejected";
        tracked._error = error;
      },
    );
  }

  if (tracked._status === "fulfilled") return tracked._result as T;
  if (tracked._status === "rejected") throw tracked._error;
  throw promise;
}

// ---------------------------------------------------------------------------
// createBones — synchronous skeleton utility (no hooks required)
//
// Returns a `bone` prop-factory, the resolved `data`, and a `repeat` helper.
// When `data` is a Promise it delegates to `readPromise` for Suspense support.
// ---------------------------------------------------------------------------

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

type BoneProps = Record<string, unknown>;

function buildTextStyle(options?: BoneOptions): Record<string, unknown> | undefined {
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

  return Object.keys(style).length > 0 ? style : undefined;
}

// ---------------------------------------------------------------------------
// forceBones — sentinel for forced skeleton mode
//
// A frozen object that createBones recognises by identity. Pass it as data
// to force skeleton mode without a real promise or Suspense boundary.
// Typed as Promise<never> so it's assignable to any Promise<T> prop.
// ---------------------------------------------------------------------------

export const forceBones = Object.freeze({}) as unknown as Promise<never>;

export interface CreateBonesReturn<T> {
  bone: (type: BoneType, options?: BoneOptions) => BoneProps;
  data: T | null | undefined;
  repeat: <U>(arr: U[] | undefined | null, count: number) => (U | undefined)[];
}

export function createBones<T>(data: T | Promise<T> | undefined | null): CreateBonesReturn<T> {
  let resolved: T | undefined | null;
  let isLoading = false;

  if (data != null && (data as unknown) === forceBones) {
    // Explicit force — show skeletons regardless.
    isLoading = true;
    resolved = undefined;
  } else if (getBonesContext().loading) {
    // Inherited from a <Bones> boundary — show skeletons.
    isLoading = true;
    resolved = undefined;
  } else if (data != null && data instanceof Promise) {
    // Promise path — delegates to readPromise for Suspense integration.
    // Throws for pending promises; returns data for fulfilled ones.
    resolved = readPromise(data);
  } else {
    resolved = data as T | undefined | null;
  }

  const bone = (type: BoneType, options?: BoneOptions): BoneProps => {
    if (!isLoading) return {};

    const props: BoneProps = {
      "data-bone": type,
      "aria-busy": true,
    };

    if (type === "text") {
      const style = buildTextStyle(options);
      if (style) props.style = style;
    }

    if (type === "block") {
      props.src = TRANSPARENT_PIXEL;
    }

    return props;
  };

  const repeat = <U>(arr: U[] | undefined | null, count: number): (U | undefined)[] => {
    if (isLoading) {
      return Array.from({ length: count });
    }
    return arr ?? [];
  };

  return { bone, data: isLoading ? undefined : (resolved as T), repeat };
}
