import { observationDefaults } from "../domain/observation.constants.ts";
import { OutpostError } from "../domain/errors.ts";
import { taskObservation } from "./task-observation.ts";
import { taskUsage } from "./task-usage.ts";
import { quotaContinuation } from "./quota-resume.ts";
import type { TaskContext } from "../domain/workflow.types.ts";
import type {
  MixedAgentTaskOptions,
  CommandTaskOptions,
} from "./tasks.types.ts";

export async function executeAgentTask<T>(
  { sandbox, request, quotaResume }: MixedAgentTaskOptions<T>,
  context: TaskContext,
) {
  const options = quotaContinuation(context, request(context), quotaResume);
  const usage = taskUsage(context, undefined);
  const observation = taskObservation(
    context.observation ?? options.observation,
    options.observe,
  );
  try {
    const result = await sandbox.dispatch({
      ...options,
      ...(context.prices ? { prices: context.prices } : {}),
      observation,
      signal: context.signal,
      ...usage.dispatchOptions,
    });
    usage.reconcile(result.usage);
    return result;
  } finally {
    await observation.close();
  }
}

export async function executeCommandTask(
  { sandbox, command }: CommandTaskOptions,
  context: TaskContext,
) {
  const invocation = typeof command === "function" ? command(context) : command;
  const result = await sandbox.command({
    ...invocation,
    observe(channel, text) {
      for (
        let offset = 0;
        offset < text.length;
        offset += observationDefaults.outputCharacters
      )
        context.observation?.emit("sandbox", {
          kind: "command-output",
          channel,
          text: text.slice(
            offset,
            offset + observationDefaults.outputCharacters,
          ),
        });
      invocation.observe?.(channel, context.observation?.redact(text) ?? text);
    },
    signal: context.signal,
  });
  if (result.status !== 0)
    throw new OutpostError("process", "Workflow command failed", {
      ...result,
    });
  return result;
}
