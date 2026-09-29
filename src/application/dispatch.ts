import type { Usage } from "../domain/agent.types.ts";
import { dispatchCandidates } from "../domain/fallback-agent.ts";
import { invariant, recordRecovery } from "../domain/errors.ts";
import { addUsage } from "../domain/usage.ts";
import { storageFor } from "./agent-storage.ts";
import { continuationConfiguration } from "./continuation.ts";
import { preflightDispatch } from "./dispatch-validation.ts";
import { executionDefaults } from "./execution.constants.ts";
import { notify } from "./observation.ts";
import type {
  ContinuationOptions,
  DispatchRequest,
  DispatchResult,
} from "./outpost.types.ts";
import { observeDispatch } from "./dispatch-observation.ts";
import { createSandbox } from "./sandbox.ts";

export async function dispatch<T = undefined>(
  options: DispatchRequest<T>,
): Promise<DispatchResult<T>> {
  const { telemetry: _telemetry, ...configuration } = options;
  return observeDispatch(
    options,
    (observed) => dispatchOperation({ ...configuration, ...observed }, options),
    options.workspace?.repository ?? options.repository ?? process.cwd(),
  );
}

async function dispatchOperation<T>(
  options: DispatchRequest<T>,
  original: DispatchRequest<T>,
): Promise<DispatchResult<T>> {
  options.signal?.throwIfAborted();
  invariant(
    options.agent.kind !== "fallback" || !options.continuation,
    "Fallback agents cannot continue a conversation; resume with the agent that produced it",
  );
  for (const candidate of dispatchCandidates(options.agent))
    await preflightDispatch(
      options,
      options.workspace?.repository ?? options.repository ?? process.cwd(),
      candidate,
    );
  if ((options.passes ?? executionDefaults.passes) > 1) {
    const outputs: DispatchResult<T>[] = [];
    let offset = 0;
    for (let index = 0; index < options.passes!; index++) {
      options.signal?.throwIfAborted();
      let passes = 1;
      const output = await dispatchOperation(
        {
          ...options,
          passes: 1,
          observe: (event) => {
            passes = Math.max(passes, event.pass);
            notify(options.observe, { ...event, pass: offset + event.pass });
          },
        },
        original,
      );
      offset += passes;
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
  if (options.continuation && options.agent.kind !== "fallback") {
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
    const agent =
      options.agent.kind === "fallback" && output.fallback
        ? options.agent.agents[output.fallback.selected.index]!
        : options.agent;
    return {
      ...output,
      ...disposed,
      resume<U>(next: ContinuationOptions<U>) {
        invariant(continuation, "No conversation was emitted");
        return dispatch({
          ...continuationConfiguration(configuration, next),
          agent,
          ...next,
          continuation: { id: continuation },
        });
      },
      fork<U>(next: ContinuationOptions<U>) {
        invariant(continuation, "No conversation was emitted");
        return dispatch({
          ...continuationConfiguration(configuration, next),
          agent,
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
