import {
  task,
  type Task,
  type TaskContext,
  type TaskOptions,
} from "../domain/workflow.ts";
import type { AgentAdapter, Command, CommandResult } from "../domain/ports.ts";
import { OutpostError } from "../domain/errors.ts";
import type { DispatchOptions } from "./execution.ts";
import type { DispatchResult, Sandbox, SandboxOptions } from "./outpost.ts";
import { dispatch } from "./outpost.ts";

export function agentTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform"> & {
    sandbox: Sandbox;
    request: (context: TaskContext) => DispatchOptions<T>;
  },
): Task<DispatchResult<T>> {
  const { sandbox, request, ...definition } = options;
  return task({
    ...definition,
    perform: (context) =>
      sandbox.dispatch({ ...request(context), signal: context.signal }),
  });
}

export function isolatedTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform"> & {
    request: (
      context: TaskContext,
    ) => SandboxOptions & DispatchOptions<T> & { readonly agent: AgentAdapter };
  },
): Task<DispatchResult<T>> {
  const { request, ...definition } = options;
  return task({
    ...definition,
    perform: (context) =>
      dispatch({ ...request(context), signal: context.signal }),
  });
}

export function commandTask(
  options: Omit<TaskOptions<CommandResult>, "perform"> & {
    sandbox: Sandbox;
    command: Command | ((context: TaskContext) => Command);
  },
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
