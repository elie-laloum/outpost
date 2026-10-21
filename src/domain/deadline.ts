import type { DeadlineOptions } from "./deadline.types.ts";

export function createDeadline(options: DeadlineOptions) {
  const deadline = new AbortController();
  const signal = options.parent
    ? AbortSignal.any([options.parent, deadline.signal])
    : deadline.signal;
  const timer =
    options.durationMs === undefined || signal.aborted
      ? undefined
      : setTimeout(() => deadline.abort(options.reason), options.durationMs);
  const close = () => {
    clearTimeout(timer);
    options.parent?.removeEventListener("abort", close);
  };
  options.parent?.addEventListener("abort", close, { once: true });
  return { signal, expired: deadline.signal, close };
}
