import { setTimeout as delay } from "node:timers/promises";
import { OutpostError } from "../domain/errors.ts";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import { executeProcess, quote } from "../infrastructure/process.ts";
import { firecrackerCommand, firecrackerSsh } from "./firecracker-command.ts";
import { firecrackerDefaults } from "./firecracker.constants.ts";
import { firecrackerFiles } from "./firecracker-files.ts";
import {
  firecrackerMachine,
  validateFirecracker,
} from "./firecracker-machine.ts";
import type { FirecrackerOptions } from "./firecracker.types.ts";

export type { FirecrackerOptions } from "./firecracker.types.ts";

export function firecrackerSandboxProvider(
  options: FirecrackerOptions,
): SandboxProvider {
  validateFirecracker(options);
  let allocated = false;
  return {
    name: "firecracker",
    placement: "remote",
    variables: { ...options.variables },
    async acquire(context) {
      if (allocated)
        throw new OutpostError(
          "provider",
          "This Firecracker provider already owns its TAP; create separate configurations for concurrent VMs",
        );
      allocated = true;
      let machine;
      try {
        machine = await firecrackerMachine(options, context.signal);
      } catch (cause) {
        allocated = false;
        throw cause;
      }
      const root = options.root ?? firecrackerDefaults.root;
      let closed = false;
      const active = new Set<Promise<unknown>>();
      const stop = new AbortController();
      const runtime = {
        options,
        root,
        variables: context.variables,
        executor: executeProcess,
        isClosed: () => closed || machine.isClosed(),
      };
      let releasing: Promise<void> | undefined;
      const release = () =>
        (releasing ??= (async () => {
          closed = true;
          stop.abort(
            new OutpostError("aborted", "Firecracker sandbox disposed"),
          );
          await Promise.allSettled([...active]);
          await machine.release();
          allocated = false;
        })().catch((cause) => {
          releasing = undefined;
          throw cause;
        }));
      try {
        const deadline =
          Date.now() +
          (options.bootDeadlineMs ?? firecrackerDefaults.bootDeadlineMs);
        while (true) {
          context.signal?.throwIfAborted();
          if (machine.isClosed())
            throw new OutpostError(
              "provider",
              "Firecracker exited before guest readiness",
            );
          const result = await executeProcess({
            ...firecrackerSsh(
              options,
              `test "$HOME" = ${quote(options.home)} && node -e 'if(Number(process.versions.node.split(".")[0])<24)process.exit(1)' && command -v git setsid tar >/dev/null && mkdir -p ${quote(root)}`,
            ),
            deadlineMs: Math.max(
              1,
              Math.min(firecrackerDefaults.probeMs, deadline - Date.now()),
            ),
            ...(context.signal ? { signal: context.signal } : {}),
          }).catch((cause) => {
            context.signal?.throwIfAborted();
            return { status: 1, stdout: "", stderr: String(cause) };
          });
          if (machine.isClosed())
            throw new OutpostError(
              "provider",
              "Firecracker exited during guest readiness",
            );
          if (result.status === 0) break;
          if (Date.now() >= deadline)
            throw new OutpostError(
              "timeout",
              "Firecracker guest SSH/prerequisites did not become ready",
              { stderr: result.stderr },
            );
          await delay(100, undefined, { signal: context.signal });
        }
      } catch (cause) {
        try {
          await release();
        } catch (cleanup) {
          throw new AggregateError(
            [cause, cleanup],
            "Firecracker acquisition and cleanup failed",
          );
        }
        throw cause;
      }
      const invoke = firecrackerCommand(runtime);
      const files = firecrackerFiles(runtime);
      const track = <T>(
        operation: (signal: AbortSignal) => Promise<T>,
        signal?: AbortSignal,
      ): Promise<T> => {
        if (closed)
          return Promise.reject(
            new OutpostError("provider", "Firecracker sandbox is closed"),
          );
        const pending = operation(
          signal ? AbortSignal.any([signal, stop.signal]) : stop.signal,
        );
        active.add(pending);
        void pending.then(
          () => active.delete(pending),
          () => active.delete(pending),
        );
        return pending;
      };
      return {
        root,
        home: options.home,
        invoke: (command) =>
          track((signal) => invoke({ ...command, signal }), command.signal),
        upload: (source, destination, options = {}) =>
          track(
            (signal) =>
              files.upload(source, destination, { ...options, signal }),
            options.signal,
          ),
        download: (source, destination, options = {}) =>
          track(
            (signal) =>
              files.download(source, destination, { ...options, signal }),
            options.signal,
          ),
        release,
      };
    },
  };
}
