export function delay<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    promise.then((value) => setTimeout(() => resolve(value), ms), reject);
  });
}
