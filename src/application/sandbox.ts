import { observedOperation } from "../domain/observed-operation.ts";
import type { ResourceOperationKind } from "../infrastructure/resource-activity.types.ts";
import { OutpostError } from "../domain/errors.ts";
import { validateBrief } from "../domain/prompts.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { Disposal } from "../domain/workspace.types.ts";
import { registerCleanup } from "../infrastructure/shutdown.ts";
import { validateDispatch } from "./dispatch-validation.ts";
import { diagnoseSandbox } from "./doctor-sandbox.ts";
import { operationGate } from "./operation-gate.ts";
import type { Sandbox, SandboxOptions } from "./outpost.types.ts";
import { sandboxAgents } from "./sandbox-agents.ts";
import { attachInSandbox } from "./sandbox-attach.ts";
import { observeDispatch } from "./dispatch-observation.ts";
import { dispatchInSandbox } from "./sandbox-dispatch.ts";
import { provisionSandbox } from "./sandbox-provision.ts";
import { steeringScope } from "./steering-scope.ts";

export async function createSandbox(
  options: SandboxOptions = {},
): Promise<Sandbox> {
  return createPreparedSandbox(options);
}

export async function createPreparedSandbox(
  options: SandboxOptions,
  prepare?: (lease: SandboxLease) => Promise<void>,
): Promise<Sandbox> {
  const context = await provisionSandbox(options);
  const { workspace, runtime, sync, stop, state, owned } = context;
  const agents = sandboxAgents(context);
  const gate = operationGate();
  const exclusive = <T>(
    kind: ResourceOperationKind,
    action: () => Promise<T>,
  ) => gate.run(() => context.activity.run(kind, action));
  let closing: Promise<Disposal> | undefined;
  const result: Sandbox = {
    workspace,
    root: runtime.root,
    dispatch(settings) {
      validateDispatch(settings);
      return steeringScope(settings.steering, () =>
        exclusive("dispatch", () =>
          observeDispatch(
            {
              ...(options.logging === undefined
                ? {}
                : { logging: options.logging }),
              ...(options.observation
                ? { observation: options.observation }
                : {}),
              ...settings,
            },
            (observed) => dispatchInSandbox(context, agents, result, observed),
            workspace.repository,
          ),
        ),
      );
    },
    resume(id, settings) {
      return result.dispatch({ ...settings, continuation: { id } });
    },
    fork(id, settings) {
      return result.dispatch({ ...settings, continuation: { id, fork: true } });
    },
    attach(settings = {}) {
      settings.signal?.throwIfAborted();
      validateBrief(settings.brief, true);
      return exclusive("attach", () =>
        attachInSandbox(context, agents, settings),
      );
    },
    diagnose(settings = {}) {
      settings.signal?.throwIfAborted();
      return exclusive("diagnose", () =>
        diagnoseSandbox(runtime, {
          ...settings,
          sandboxProvider: context.sandboxProvider,
          signal: settings.signal
            ? AbortSignal.any([settings.signal, stop.signal])
            : stop.signal,
        }),
      );
    },
    command(command) {
      command.signal?.throwIfAborted();
      return exclusive("command", async () => {
        try {
          const signal = command.signal
            ? AbortSignal.any([command.signal, stop.signal])
            : stop.signal;
          await context.readyHooks(signal);
          return await runtime.invoke({
            ...command,
            signal,
          });
        } finally {
          await observedOperation(
            options.observation,
            "transfer",
            "repository.refresh",
            async () => sync?.pull(),
          );
        }
      });
    },
    close(settings = {}) {
      if (closing) return closing;
      closing = (async () => {
        stop.abort(new OutpostError("aborted", "Sandbox closed"));
        await gate.close();
        let failure: unknown;
        await context.activity.phase("closing").catch(() => undefined);
        try {
          await runtime.release();
          await observedOperation(
            options.observation,
            "transfer",
            "repository.release",
            async () => sync?.close(),
          );
          if (!(await context.activity.idle()))
            throw new OutpostError(
              "provider",
              "Sandbox operations remain unsettled after release",
            );
        } catch (cause) {
          failure = cause;
        }
        state.active = false;

        unregister();
        let disposal: Disposal = {};
        try {
          if (owned)
            disposal = await workspace.close({
              preserve: settings.preserve || !!failure,
            });
          if (failure) throw failure;
          await context.activity.remove();
          return disposal;
        } catch (cause) {
          await context.activity.phase("cleanup-failed").catch(() => undefined);
          throw cause;
        }
      })();
      return closing;
    },
    async [Symbol.asyncDispose]() {
      await result.close();
    },
  };
  const unregister = registerCleanup(() => result.close({ preserve: true }));
  if (prepare) {
    try {
      await exclusive("command", () => prepare(runtime));
    } catch (cause) {
      await result.close({ preserve: true });
      throw cause;
    }
  }
  return result;
}
