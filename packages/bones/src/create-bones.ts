import { cache, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Server-safe loading context via React.cache
//
// cache() returns the same value per request (server) or per render (client),
// so a flag set by a parent is visible to all descendants in the same pass.
// ---------------------------------------------------------------------------

export const getBonesContext = cache(() => ({ loading: false }));

export type BoneType = "text" | "block" | "container";

// ---------------------------------------------------------------------------
// minMax — variable-length skeleton helper
//
// Returns a descriptor that `bone("text", { length: minMax(4, 12) })` uses to
// produce a different deterministic width on each call within a createBones
// instance. Ideal inside repeat() loops for natural-looking skeleton lists.
// ---------------------------------------------------------------------------

const MIN_MAX_BRAND = Symbol("minMax");

export interface MinMax {
  readonly [MIN_MAX_BRAND]: true;
  readonly min: number;
  readonly max: number;
}

export function minMax(min: number, max: number): MinMax {
  return { [MIN_MAX_BRAND]: true, min, max };
}

export function isMinMax(value: unknown): value is MinMax {
  return typeof value === "object" && value !== null && MIN_MAX_BRAND in value;
}

export interface BoneOptions {
  length?: number | MinMax;
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

function resolveLength(length: number | MinMax | undefined, callIndex: number): number | undefined {
  if (length == null) return undefined;
  if (typeof length === "number") return length;
  // MinMax: deterministic variation based on call index
  const range = length.max - length.min + 1;
  return length.min + ((callIndex * 7 + 3) % range);
}

function buildTextStyle(
  options: BoneOptions | undefined,
  resolvedLength: number | undefined,
): Record<string, unknown> | undefined {
  const style: Record<string, unknown> = {};

  if (options?.contained) {
    style["--bone-contained"] = 1;
  }
  if (resolvedLength) {
    style["--bone-length"] = resolvedLength;
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

export interface CreateBonesOptions {
  loading?: boolean;
}

export interface CreateBonesReturn<T> {
  bone: {
    (type: "text", options?: BoneOptions): BoneProps;
    (type: "block" | "container"): BoneProps;
  };
  data: T | null | undefined;
  repeat: {
    (count: number, render: (item: undefined, index: number) => ReactNode): ReactNode[];
    <U>(arr: U[] | undefined | null, count: number, render: (item: U | undefined, index: number) => ReactNode): ReactNode[];
  };
  lines: <V>(value: V | null | undefined, count: number, render: (item: V | undefined, index: number) => ReactNode) => ReactNode[];
}

export function createBones(options: CreateBonesOptions): CreateBonesReturn<never>;
export function createBones<T>(
  data: T | Promise<T> | undefined | null,
  options?: CreateBonesOptions,
): CreateBonesReturn<T>;
export function createBones<T>(
  dataOrOptions?: T | Promise<T> | undefined | null | CreateBonesOptions,
  maybeOptions?: CreateBonesOptions,
): CreateBonesReturn<T> {
  let data: T | Promise<T> | undefined | null;
  let options: CreateBonesOptions | undefined;

  if (
    maybeOptions === undefined &&
    dataOrOptions !== null &&
    dataOrOptions !== undefined &&
    typeof dataOrOptions === "object" &&
    !(dataOrOptions instanceof Promise) &&
    "loading" in dataOrOptions
  ) {
    data = undefined;
    options = dataOrOptions as CreateBonesOptions;
  } else {
    data = dataOrOptions as T | Promise<T> | undefined | null;
    options = maybeOptions;
  }

  let resolved: T | undefined | null;
  let isLoading = false;

  if (options?.loading) {
    // Explicit loading flag — show skeletons regardless of data state.
    isLoading = true;
    resolved = undefined;
  } else if (data != null && (data as unknown) === forceBones) {
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

  let boneCallIndex = 0;

  const bone = (type: BoneType, options?: BoneOptions): BoneProps => {
    if (!isLoading) return {};

    const callIndex = boneCallIndex++;
    const props: BoneProps = {
      "data-bone": type,
      "aria-busy": true,
    };

    if (type === "text") {
      const length = resolveLength(options?.length, callIndex);
      const style = buildTextStyle(options, length);
      if (style) props.style = style;
    }

    if (type === "block") {
      props.src = TRANSPARENT_PIXEL;
    }

    return props;
  };

  function repeat(count: number, render: (item: undefined, index: number) => ReactNode): ReactNode[];
  function repeat<U>(arr: U[] | undefined | null, count: number, render: (item: U | undefined, index: number) => ReactNode): ReactNode[];
  function repeat<U>(
    arrOrCount: U[] | undefined | null | number,
    countOrRender: number | ((item: U | undefined, index: number) => ReactNode),
    maybeRender?: (item: U | undefined, index: number) => ReactNode,
  ): ReactNode[] {
    let arr: U[] | undefined | null;
    let count: number;
    let render: (item: U | undefined, index: number) => ReactNode;

    if (typeof arrOrCount === "number") {
      arr = undefined;
      count = arrOrCount;
      render = countOrRender as (item: U | undefined, index: number) => ReactNode;
    } else {
      arr = arrOrCount;
      count = countOrRender as number;
      render = maybeRender!;
    }

    const items: (U | undefined)[] = isLoading
      ? Array.from({ length: count })
      : (arr ?? []);

    return items.map(render);
  }

  function lines<V>(
    value: V | null | undefined,
    count: number,
    render: (item: V | undefined, index: number) => ReactNode,
  ): ReactNode[] {
    if (isLoading) {
      return Array.from({ length: count }, (_, i) => render(undefined, i));
    }
    if (value == null) return [];
    return [render(value, 0)];
  }

  return { bone, data: isLoading ? undefined : (resolved as T), repeat, lines };
}
