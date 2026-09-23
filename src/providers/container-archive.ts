import { PassThrough } from "node:stream";
import type { Command } from "../domain/command.types.ts";
import { binaryExecutor } from "../infrastructure/binary-process.ts";
import { containerCommand } from "./container-command.ts";
import type { ContainerRuntime } from "./container.types.ts";

export async function containerArchive(
  runtime: ContainerRuntime,
  local: Command,
  remote: Command,
  upload: boolean,
  signal: AbortSignal,
): Promise<void> {
  const pipe = new PassThrough();
  const stop = new AbortController();
  const combined = AbortSignal.any([signal, stop.signal]);
  const host = binaryExecutor(upload ? { output: pipe } : { input: pipe });
  const guest = containerCommand({
    ...runtime,
    executor: binaryExecutor(upload ? { input: pipe } : { output: pipe }),
  });
  const pending = [
    host({ ...local, signal: combined }),
    guest({ ...remote, signal: combined }),
  ];
  try {
    await Promise.all(pending);
  } catch (cause) {
    stop.abort(cause);
    pipe.destroy();
    await Promise.allSettled(pending);
    throw cause;
  }
}
