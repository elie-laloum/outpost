import type { ResourceOperationKind } from "../infrastructure/resource-activity.types.ts";
import { OutpostError } from "../domain/errors.ts";
import { validateBrief } from "../domain/prompts.ts";
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

export async function createSandbox(
  options: SandboxOptions = {},
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
      return observeDispatch(settings, (observed) => {
        validateDispatch(observed);
        return exclusive("dispatch", () =>
          dispatchInSandbox(context, agents, result, observed),
        );
      });
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
          return await runtime.invoke({
            ...command,
            signal: command.signal
              ? AbortSignal.any([command.signal, stop.signal])
              : stop.signal,
          });
        } finally {
          await sync?.pull();
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
          await sync?.close();
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
  return result;
}
