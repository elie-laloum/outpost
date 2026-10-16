import type { AgentHookContext } from "../../domain/agent-hook.types.ts";
import type { HookCommand } from "../../domain/hook-command.types.ts";

export type NativeHookOptions<Phase extends string, Event, Result> = {
  readonly on: Phase;
  readonly name?: string;
  readonly matcher?: string;
  readonly timeoutMs?: number;
} & (
  | { readonly command: HookCommand; readonly run?: never }
  | {
      readonly command?: never;
      run(
        context: AgentHookContext & { readonly event: Event },
      ): Result | void | Promise<Result | void>;
    }
);

export type { NativeHook } from "../../domain/agent-hook.types.ts";

export interface NativeHookSchema {
  readonly input: Readonly<Record<string, unknown>>;
  readonly output: Readonly<Record<string, unknown>>;
  readonly text?: boolean;
}
