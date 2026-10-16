import type { Command } from "./command.types.ts";
import type { HookCommand } from "./hook-command.types.ts";
import type { SandboxLease } from "./sandbox.types.ts";

export interface AgentHookContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
}

export interface AgentHookHandler {
  readonly on: string;
  readonly name: string;
  readonly timeoutMs: number;
  readonly command?: HookCommand;
  readonly matcher?: string;
  run(event: unknown, context: AgentHookContext): Promise<string>;
}

export interface AgentHookInstallation {
  command(command: Command): Command;
  close(): Promise<void>;
}

export interface AgentHookPlan {
  readonly handlers: readonly AgentHookHandler[];
  prepare(
    sandbox: SandboxLease,
    commands: readonly string[],
    signal: AbortSignal,
  ): Promise<AgentHookInstallation>;
}

export interface NativeHook<
  Agent extends string,
  Phase extends string = string,
> extends AgentHookHandler {
  readonly kind: "native-hook";
  readonly agent: Agent;
  readonly on: Phase;
}
