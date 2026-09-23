export async function interruptible<T>(
  pending: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  let abort = () => {};
  const interrupted = new Promise<never>((_, reject) => {
    abort = () => reject(signal.reason);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
  try {
    return await Promise.race([pending, interrupted]);
  } finally {
    signal.removeEventListener("abort", abort);
  }
}
