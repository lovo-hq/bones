"use client";

import { type ReactNode, Suspense, use } from "react";
import { BonesContext } from "./context.ts";
import type {
  Streamable as StreamableT,
  BonesProps,
  BonesForcedProps,
  BonesStreamingProps,
  BonesArrayProps,
} from "./types.ts";

// ---------------------------------------------------------------------------
// Streamable utilities — promise caching, all(), from()
// ---------------------------------------------------------------------------

function isPromise<T>(value: StreamableT<T>): value is Promise<T> {
  return value instanceof Promise;
}

function useStreamable<T>(streamable: StreamableT<T>): T {
  return isPromise(streamable) ? use(streamable) : streamable;
}

const stableKeys = (function () {
  const cache = new WeakMap<object, string>();
  let nextId = 0;

  return {
    get: (streamable: unknown): string => {
      if (streamable != null && typeof streamable === "object") {
        let key = cache.get(streamable);

        if (key === undefined) {
          key = String(nextId++);
          cache.set(streamable, key);
        }

        return key;
      }

      return JSON.stringify(streamable);
    },
  };
})();

function getCompositeKey(streamables: readonly unknown[]): string {
  return streamables.map(stableKeys.get).join(".");
}

function weakRefCache<K, T extends object>() {
  const cache = new Map<K, WeakRef<T>>();

  const registry = new FinalizationRegistry((key: K) => {
    const valueRef = cache.get(key);

    if (valueRef && !valueRef.deref()) cache.delete(key);
  });

  return {
    get: (key: K) => cache.get(key)?.deref(),
    set: (key: K, value: T) => {
      cache.set(key, new WeakRef(value));
      registry.register(value, key);
    },
  };
}

const promiseCache = weakRefCache<string, Promise<unknown>>();

function all<T extends readonly unknown[] | []>(
  streamables: T,
): StreamableT<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
  if (!streamables.some(isPromise)) {
    return streamables as { -readonly [P in keyof T]: Awaited<T[P]> };
  }

  const cacheKey = getCompositeKey(streamables);
  const cached = promiseCache.get(cacheKey);

  if (cached != null) return cached as { -readonly [P in keyof T]: Awaited<T[P]> };

  const result = Promise.all(streamables);
  promiseCache.set(cacheKey, result);

  return result;
}

function from<T>(thunk: () => Promise<T>): StreamableT<T> {
  let promise: Promise<T> | undefined;

  // eslint-disable-next-line unicorn/no-thenable
  return {
    then(onfulfilled, onrejected) {
      promise ??= thunk();
      return promise.then(onfulfilled, onrejected);
    },
    catch(onrejected) {
      promise ??= thunk();
      return promise.catch(onrejected);
    },
    [Symbol.toStringTag]: "LazyPromise",
    finally(onfinally) {
      promise ??= thunk();
      return promise.finally(onfinally);
    },
  } satisfies Promise<T>;
}

export const Streamable = {
  all,
  from,
};

// ---------------------------------------------------------------------------
// Bones component — streaming + forced modes
// ---------------------------------------------------------------------------

function Resolved<T>({
  value,
  children,
}: {
  value: StreamableT<T>;
  children: (data: T) => ReactNode;
}) {
  return children(useStreamable(value));
}

function ThemeWrapper({
  baseColor,
  highlightColor,
  duration,
  children,
}: {
  baseColor?: string;
  highlightColor?: string;
  duration?: number;
  children: ReactNode;
}) {
  const style: Record<string, string> = {};
  if (baseColor) style["--bone-base"] = baseColor;
  if (highlightColor) style["--bone-highlight"] = highlightColor;
  if (duration) style["--bone-duration"] = `${String(duration)}s`;

  if (Object.keys(style).length > 0) {
    return <div style={style}>{children}</div>;
  }

  return children;
}

function isForced(props: BonesProps): props is BonesForcedProps {
  return "forced" in props && props.forced === true;
}

export function Bones(props: BonesProps): ReactNode {
  const { baseColor, highlightColor, duration } = props;

  if (isForced(props)) {
    return (
      <BonesContext.Provider value={{ forced: true }}>
        <ThemeWrapper baseColor={baseColor} highlightColor={highlightColor} duration={duration}>
          {props.children}
        </ThemeWrapper>
      </BonesContext.Provider>
    );
  }

  const { value, children } = props as BonesStreamingProps<any> | BonesArrayProps<any>;
  const streamable = Array.isArray(value) ? Streamable.all(value) : value;

  return (
    <ThemeWrapper baseColor={baseColor} highlightColor={highlightColor} duration={duration}>
      <Suspense fallback={children(undefined)}>
        <Resolved value={streamable}>{children}</Resolved>
      </Suspense>
    </ThemeWrapper>
  );
}
