import type { Deadline, DeadlineOptions } from "./deadline.types.ts";

export function createDeadline(options: DeadlineOptions): Deadline {
  const expiry = new AbortController();
  const scope = new AbortController();
  const signal = AbortSignal.any([
    ...(options.parent ? [options.parent] : []),
    expiry.signal,
    scope.signal,
  ]);
  const timer =
    options.durationMs === undefined || signal.aborted
      ? undefined
      : setTimeout(() => expiry.abort(options.reason), options.durationMs);
  const stop = () => {
    clearTimeout(timer);
    options.parent?.removeEventListener("abort", stop);
  };
  options.parent?.addEventListener("abort", stop, { once: true });
  return {
    signal,
    expired: expiry.signal,
    close(reason) {
      stop();
      if (reason !== undefined) scope.abort(reason);
    },
  };
}
