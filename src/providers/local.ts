import { cp, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import type { Command } from "../domain/command.types.ts";
import { invariant, OutpostError } from "../domain/errors.ts";
import type {
  SandboxProvider,
  TransferOptions,
} from "../domain/sandbox.types.ts";
import { executeProcess } from "../infrastructure/process.ts";
import type { LocalOptions } from "./local.types.ts";

export function localSandboxProvider(
  options: LocalOptions = {},
): SandboxProvider {
  invariant(
    !("egress" in options) || options.egress === undefined,
    "Local execution cannot enforce egress policies",
  );
  return {
    name: "local",
    placement: "host",
    variables: { ...options.variables },
    async acquire(context) {
      context.signal?.throwIfAborted();
      const stop = new AbortController();
      const active = new Set<Promise<unknown>>();
      let disposed = false;
      const copy = async (
        source: string,
        destination: string,
        options: TransferOptions = {},
      ) => {
        options.signal?.throwIfAborted();
        if (disposed)
          throw new OutpostError("provider", "Local sandbox is closed");
        if (resolve(source) === resolve(destination)) return;
        await mkdir(dirname(destination), { recursive: true });
        await cp(source, destination, {
          recursive: true,
          force: true,
          filter: () => {
            options.signal?.throwIfAborted();
            return true;
          },
        });
      };
      return {
        root: context.directory,
        home: homedir(),
        invoke(command: Command) {
          if (disposed)
            return Promise.reject(
              new OutpostError("provider", "Local sandbox is closed"),
            );
          const signal = command.signal
            ? AbortSignal.any([command.signal, stop.signal])
            : stop.signal;
          const pending = executeProcess({
            ...command,
            directory: command.directory ?? context.directory,
            variables: { ...context.variables, ...command.variables },
            signal,
          });
          active.add(pending);
          void pending.then(
            () => active.delete(pending),
            () => active.delete(pending),
          );
          return pending;
        },
        upload: copy,
        download: copy,
        async release() {
          if (disposed) return;
          disposed = true;
          stop.abort(new OutpostError("aborted", "Sandbox disposed"));
          await Promise.allSettled(active);
        },
      };
    },
  };
}
