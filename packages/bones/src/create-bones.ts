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
