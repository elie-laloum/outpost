import { OutpostError } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";

export function hookSnapshot<T>(value: T): T {
  const copy = structuredClone(value);
  const freeze = (entry: unknown): void => {
    if (entry === null || typeof entry !== "object" || Object.isFrozen(entry))
      return;
    Object.freeze(entry);
    for (const child of Object.values(entry)) freeze(child);
  };
  freeze(copy);
  return copy;
}

export async function invokeHook<T>(
  name: string,
  timeoutMs: number,
  parent: AbortSignal,
  run: (signal: AbortSignal) => T | Promise<T>,
): Promise<T> {
  parent.throwIfAborted();
  const controller = new AbortController();
  const signal = AbortSignal.any([parent, controller.signal]);
  const timer = setTimeout(
    () =>
      controller.abort(
        new OutpostError("timeout", `Hook ${name} exceeded ${timeoutMs} ms`),
      ),
    timeoutMs,
  );
  let cancel: () => void = () => undefined;
  const aborted = new Promise<never>((_, reject) => {
    cancel = () => reject(signal.reason);
    signal.addEventListener("abort", cancel, { once: true });
  });
  try {
    return await Promise.race([
      Promise.resolve().then(() => run(signal)),
      aborted,
    ]);
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", cancel);
    controller.abort(new OutpostError("aborted", `Hook ${name} ended`));
  }
}

export function hookSandbox(
  lease: SandboxLease,
  signal: AbortSignal,
): SandboxLease {
  const combine = (own?: AbortSignal) => {
    signal.throwIfAborted();
    return own ? AbortSignal.any([signal, own]) : signal;
  };
  return {
    root: lease.root,
    home: lease.home,
    ...(lease.liveInput ? { liveInput: true } : {}),
    invoke: (command) =>
      lease.invoke({ ...command, signal: combine(command.signal) }),
    upload: (source, destination, options = {}) =>
      lease.upload(source, destination, {
        ...options,
        signal: combine(options.signal),
      }),
    download: (source, destination, options = {}) =>
      lease.download(source, destination, {
        ...options,
        signal: combine(options.signal),
      }),
    release: async () => {
      throw new OutpostError(
        "configuration",
        "A hook does not own its sandbox lease",
      );
    },
  };
}
