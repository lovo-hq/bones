export function delay<T>(promise: Promise<T>, ms: number): Promise<T> {
  if (!Number.isFinite(ms)) return new Promise(() => {});
  return new Promise((resolve, reject) => {
    promise.then((value) => setTimeout(() => resolve(value), ms), reject);
  });
}
