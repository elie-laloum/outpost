import type { Agent } from "../domain/agent.types.ts";
import type { Command } from "../domain/command.types.ts";
import type { TaskContext } from "../domain/workflow.types.ts";
import type { DispatchOptions } from "./execution.types.ts";
import type { Sandbox, SandboxOptions } from "./outpost.types.ts";

export type CommandTaskOptions = {
  sandbox: Sandbox;
  command: Command | ((context: TaskContext) => Command);
};

export type IsolatedTaskOptions<T> = {
  request: (
    context: TaskContext,
  ) => IsolatedTaskRequest<T> | Promise<IsolatedTaskRequest<T>>;
};

export type AgentTaskOptions<T> = {
  sandbox: Sandbox;
  request: (context: TaskContext) => DispatchOptions<T>;
};

export type IsolatedTaskRequest<T> = SandboxOptions &
  DispatchOptions<T> & { readonly agent: Agent };
