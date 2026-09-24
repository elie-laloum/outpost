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
import { dispatchInSandbox } from "./sandbox-dispatch.ts";
import { provisionSandbox } from "./sandbox-provision.ts";

export async function createSandbox(
  options: SandboxOptions = {},
): Promise<Sandbox> {
  const context = await provisionSandbox(options);
  const { workspace, runtime, sync, stop, state, owned } = context;
  const agents = sandboxAgents(context);
  const gate = operationGate();
  const exclusive = gate.run;
  let closing: Promise<Disposal> | undefined;
  const result: Sandbox = {
    workspace,
    root: runtime.root,
    dispatch(settings) {
      validateDispatch(settings);
      return exclusive(() =>
        dispatchInSandbox(context, agents, result, settings),
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
      return exclusive(() => attachInSandbox(context, agents, settings));
    },
    diagnose(settings = {}) {
      settings.signal?.throwIfAborted();
      return exclusive(() =>
        diagnoseSandbox(runtime, {
          ...settings,
          provider: context.provider,
          signal: settings.signal
            ? AbortSignal.any([settings.signal, stop.signal])
            : stop.signal,
        }),
      );
    },
    command(command) {
      command.signal?.throwIfAborted();
      return exclusive(async () => {
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
        try {
          await runtime.release();
          await sync?.close();
        } catch (cause) {
          failure = cause;
        }
        state.active = false;

        unregister();
        const disposal = owned
          ? await workspace.close({ preserve: settings.preserve || !!failure })
          : {};
        if (failure) throw failure;
        return disposal;
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
