import type { RequiredAgent, Usage } from "../domain/agent.types.ts";
import { invariant, recordRecovery } from "../domain/errors.ts";
import { addUsage } from "../domain/usage.ts";
import { storageFor } from "./agent-storage.ts";
import { continuationConfiguration } from "./continuation.ts";
import { preflightDispatch } from "./dispatch-validation.ts";
import { executionDefaults } from "./execution.constants.ts";
import type { DispatchOptions } from "./execution.types.ts";
import { notify } from "./observation.ts";
import type {
  ContinuationOptions,
  DispatchResult,
  SandboxOptions,
} from "./outpost.types.ts";
import { observeDispatch } from "./dispatch-observation.ts";
import { createSandbox } from "./sandbox.ts";

export async function dispatch<T = undefined>(
  options: SandboxOptions & DispatchOptions<T> & RequiredAgent,
): Promise<DispatchResult<T>> {
  const { telemetry: _telemetry, ...configuration } = options;
  return observeDispatch(options, (observed) =>
    dispatchOperation({ ...configuration, ...observed }, options),
  );
}

async function dispatchOperation<T>(
  options: SandboxOptions & DispatchOptions<T> & RequiredAgent,
  original: SandboxOptions & DispatchOptions<T> & RequiredAgent,
): Promise<DispatchResult<T>> {
  options.signal?.throwIfAborted();
  await preflightDispatch(
    options,
    options.workspace?.repository ?? options.repository ?? process.cwd(),
    options.agent,
  );
  if ((options.passes ?? executionDefaults.passes) > 1) {
    const outputs: DispatchResult<T>[] = [];
    for (let index = 0; index < options.passes!; index++) {
      options.signal?.throwIfAborted();
      const output = await dispatchOperation(
        {
          ...options,
          passes: 1,
          observe: (event) =>
            notify(options.observe, { ...event, pass: index + 1 }),
        },
        original,
      );
      outputs.push(output);
      if (output.completed) break;
    }
    const last = outputs.at(-1)!;
    return {
      ...last,
      text: outputs.map((output) => output.text).join("\n"),
      turns: outputs.flatMap((output) => output.turns),
      commits: outputs.flatMap((output) => output.commits),
      usage: outputs.reduce((sum, output) => addUsage(sum, output.usage), {
        input: 0,
        cached: 0,
        output: 0,
      } as Usage),
    };
  }
  if (options.continuation) {
    const storage = storageFor(options.agent);
    invariant(storage, "This adapter does not support native conversations");
    await storage.locate(
      options.continuation.id,
      options.workspace?.repository ?? options.repository ?? process.cwd(),
      options.conversationHome,
    );
  }
  const sandbox = await createSandbox(options);
  const {
    brief: _brief,
    response: _response,
    continuation: _continuation,
    passes: _passes,
    ...configuration
  } = original;
  let successful = false;
  try {
    const output = await sandbox.dispatch(options);
    await sandbox.workspace.integrate();
    successful = true;
    const disposed = await sandbox.close();
    const continuation = output.conversation;
    return {
      ...output,
      ...disposed,
      resume<U>(next: ContinuationOptions<U>) {
        invariant(continuation, "No conversation was emitted");
        return dispatch({
          ...continuationConfiguration(configuration, next),
          ...next,
          continuation: { id: continuation },
        });
      },
      fork<U>(next: ContinuationOptions<U>) {
        invariant(continuation, "No conversation was emitted");
        return dispatch({
          ...continuationConfiguration(configuration, next),
          ...next,
          continuation: { id: continuation, fork: true },
        });
      },
    };
  } catch (cause) {
    recordRecovery(cause, {
      branch: sandbox.workspace.branch,
      directory: sandbox.workspace.directory,
    });
    throw cause;
  } finally {
    if (!successful) await sandbox.close({ preserve: true });
  }
}
