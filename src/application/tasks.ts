import { observationDefaults } from "../domain/observation.constants.ts";
import { taskObservation } from "./task-observation.ts";
import { taskUsage } from "./task-usage.ts";
import { OutpostError } from "../domain/errors.ts";
import type { CommandResult } from "../domain/ports.ts";
import { task, type Task, type TaskOptions } from "../domain/workflow.ts";
import type { DispatchResult } from "./outpost.ts";
import { dispatch } from "./outpost.ts";
import type {
  AgentTaskOptions,
  CommandTaskOptions,
  IsolatedTaskOptions,
} from "./tasks.types.ts";

export function agentTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform"> &
    AgentTaskOptions<T>,
): Task<DispatchResult<T>> {
  const { sandbox, request, ...definition } = options;
  return task({
    ...definition,
    async perform(context) {
      const options = request(context);
      const usage = taskUsage(context, undefined);
      const observation = taskObservation(
        context.observation ?? options.observation,
        options.observe,
      );
      try {
        const result = await sandbox.dispatch({
          ...options,
          observation,
          signal: context.signal,
          observe: usage.observe,
        });
        usage.reconcile(result.usage);
        return result;
      } finally {
        await observation.close();
      }
    },
  });
}

export function isolatedTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform"> &
    IsolatedTaskOptions<T>,
): Task<DispatchResult<T>> {
  const { request, ...definition } = options;
  return task({
    ...definition,
    async perform(context) {
      const options = await request(context);
      const usage = taskUsage(context, undefined);
      const observation = taskObservation(
        context.observation ?? options.observation,
        options.observe,
      );
      try {
        const result = await dispatch({
          ...options,
          observation,
          signal: context.signal,
          observe: usage.observe,
        });
        usage.reconcile(result.usage);
        return result;
      } finally {
        await observation.close();
      }
    },
  });
}

export function commandTask(
  options: Omit<TaskOptions<CommandResult>, "perform"> & CommandTaskOptions,
): Task<CommandResult> {
  const { sandbox, command, ...definition } = options;
  return task({
    ...definition,
    async perform(context) {
      const invocation =
        typeof command === "function" ? command(context) : command;
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
          invocation.observe?.(channel, text);
        },
        signal: context.signal,
      });
      if (result.status !== 0)
        throw new OutpostError("process", "Workflow command failed", {
          ...result,
        });
      return result;
    },
  });
}
