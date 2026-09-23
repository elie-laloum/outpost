import type { SandboxLease, TransferOptions } from "../domain/ports.ts";
import { invariant, OutpostError } from "../domain/errors.ts";
import { interruptible } from "./abort.ts";

export async function transfer<T>(
  options: TransferOptions,
  perform: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  options.signal?.throwIfAborted();
  const deadlineMs = options.deadlineMs ?? 120_000;
  invariant(
    Number.isFinite(deadlineMs) && deadlineMs > 0,
    "Transfer deadline must be positive",
  );
  const stop = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, stop.signal])
    : stop.signal;
  const timer = setTimeout(
    () =>
      stop.abort(
        new OutpostError("timeout", "File transfer timed out", { deadlineMs }),
      ),
    deadlineMs,
  );
  try {
    return await interruptible(perform(signal), signal);
  } finally {
    clearTimeout(timer);
  }
}

export function boundedTransfers(
  lease: SandboxLease,
  defaults: TransferOptions,
): SandboxLease {
  const copy =
    (method: "upload" | "download") =>
    (source: string, destination: string, options: TransferOptions = {}) =>
      transfer({ ...defaults, ...options }, (signal) =>
        lease[method](source, destination, { ...defaults, ...options, signal }),
      );
  return {
    ...lease,
    invoke: lease.invoke.bind(lease),
    release: lease.release.bind(lease),
    upload: copy("upload"),
    download: copy("download"),
  };
}
