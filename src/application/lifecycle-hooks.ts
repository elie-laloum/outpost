import { observedOperation } from "../domain/observed-operation.ts";
import { changed } from "../domain/lifecycle.ts";
import { invariant } from "../domain/errors.ts";
import type { LifecycleCommand } from "../domain/lifecycle.types.ts";
import type { ObservationHub } from "../domain/observation.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { fileFingerprint } from "../infrastructure/file-fingerprint.ts";
import { requireSuccess } from "../infrastructure/process.ts";
import { hookDeadlineMs } from "./lifecycle.constants.ts";

export function createLifecycleHookRunner(
  commands: readonly LifecycleCommand[],
  directory: string,
  invoke: SandboxLease["invoke"],
  parallel = false,
) {
  const fingerprints = new Map<LifecycleCommand, string>();
  const configured = commands.map((command) => {
    if (command.when === undefined) return command;
    invariant(
      command.when !== null && command.when.kind === "changed",
      "Unsupported lifecycle hook condition",
    );
    return { ...command, when: changed(command.when.files) };
  });
  return async (
    signal?: AbortSignal,
    incremental = false,
    observation?: ObservationHub,
  ): Promise<void> => {
    signal?.throwIfAborted();
    const controller = new AbortController();
    const combined = signal
      ? AbortSignal.any([signal, controller.signal])
      : controller.signal;
    const run = async (command: LifecycleCommand) => {
      if (incremental && !command.when) return;
      const { when, ...settings } = command;
      const request = {
        ...settings,
        directory: command.directory ?? directory,
        deadlineMs: command.deadlineMs ?? hookDeadlineMs,
        signal: command.signal
          ? AbortSignal.any([combined, command.signal])
          : combined,
      };
      const fingerprint = when
        ? await fileFingerprint(when.files, request, invoke)
        : undefined;
      if (
        fingerprint !== undefined &&
        fingerprints.get(command) === fingerprint
      )
        return;
      await observedOperation(
        observation,
        "hooks",
        "lifecycle.command",
        async () => requireSuccess(request, invoke),
      );
      request.signal.throwIfAborted();
      if (fingerprint !== undefined) fingerprints.set(command, fingerprint);
    };
    if (!parallel) {
      for (const command of configured) await run(command);
      return;
    }
    const outcomes = await Promise.allSettled(
      configured.map((command) =>
        run(command).catch((cause) => {
          controller.abort(cause);
          throw cause;
        }),
      ),
    );
    const failure = outcomes.find((outcome) => outcome.status === "rejected");
    if (failure?.status === "rejected") throw failure.reason;
  };
}

export async function hooks(
  commands: readonly LifecycleCommand[],
  directory: string,
  invoke: SandboxLease["invoke"],
  signal?: AbortSignal,
): Promise<void> {
  await createLifecycleHookRunner(commands, directory, invoke)(signal);
}
