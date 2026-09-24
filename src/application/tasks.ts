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
      const usage = taskUsage(context, options.observe);
      const result = await sandbox.dispatch({
        ...options,
        signal: context.signal,
        observe: usage.observe,
      });
      usage.reconcile(result.usage);
      return result;
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
      const options = request(context);
      const usage = taskUsage(context, options.observe);
      const result = await dispatch({
        ...options,
        signal: context.signal,
        observe: usage.observe,
      });
      usage.reconcile(result.usage);
      return result;
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
