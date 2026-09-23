import type { AgentAdapter } from "../domain/agent.types.ts";
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
  ) => SandboxOptions & DispatchOptions<T> & { readonly agent: AgentAdapter };
};

export type AgentTaskOptions<T> = {
  sandbox: Sandbox;
  request: (context: TaskContext) => DispatchOptions<T>;
};
