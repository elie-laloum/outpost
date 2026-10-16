import type {
  AgentModel,
  ModelMessage,
  ModelResult,
  ModelToolCallBlock,
} from "./model.types.ts";
import type { SandboxLease } from "./sandbox.types.ts";
import type { ToolOutput } from "./tool.types.ts";
import type { HookCommand } from "./hook-command.types.ts";

export type HarnessHookPhase =
  | "session-start"
  | "before-model"
  | "after-model"
  | "before-tool"
  | "after-tool"
  | "before-prompt"
  | "model-error"
  | "before-compaction"
  | "after-compaction"
  | "before-subagent"
  | "after-subagent"
  | "run-end"
  | "stop";

export interface HarnessHookContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  readonly model: AgentModel;
  readonly step: number;
  readonly conversation?: string;
  readonly subagentId?: string;
  readonly depth?: number;
}

export interface HarnessToolResultView {
  readonly content: string;
  readonly isError: boolean;
}

export interface HarnessHookEvents {
  readonly "session-start": {
    readonly prompt: string;
    readonly source?: "start" | "resume" | "repair";
  };
  readonly "before-prompt": {
    readonly prompt: string;
    readonly source: "initial" | "steering";
  };
  readonly "before-model": {
    readonly messages: readonly ModelMessage[];
    readonly system?: string;
  };
  readonly "after-model": { readonly result: ModelResult };
  readonly "model-error": { readonly error: unknown };
  readonly "before-compaction": {
    readonly messages: readonly ModelMessage[];
    readonly strategy: string;
  };
  readonly "after-compaction": {
    readonly messages: readonly ModelMessage[];
    readonly strategy: string;
  };
  readonly "before-subagent": {
    readonly id: string;
    readonly name: string;
    readonly callId: string;
    readonly prompt: string;
  };
  readonly "after-subagent": {
    readonly id: string;
    readonly name: string;
    readonly callId: string;
    readonly text?: string;
    readonly error?: unknown;
    readonly conversation?: string;
  };
  readonly "run-end": {
    readonly reason: "success" | "error" | "aborted" | "timeout" | "limit";
    readonly text?: string;
    readonly error?: unknown;
  };
  readonly "before-tool": { readonly call: ModelToolCallBlock };
  readonly "after-tool": {
    readonly call: ModelToolCallBlock;
    readonly result: HarnessToolResultView;
    readonly status?: "success" | "denied" | "error";
  };
  readonly stop: { readonly text: string };
}

export interface HarnessHookDecisions {
  readonly "session-start": { readonly instructions: string };
  readonly "before-prompt":
    { readonly prompt: string } | { readonly deny: string };
  readonly "before-model": {
    readonly messages?: readonly ModelMessage[];
    readonly system?: string;
  };
  readonly "after-model": {
    readonly result: Pick<ModelResult, "text" | "content"> & {
      readonly usage?: never;
      readonly stopReason?: never;
    };
  };
  readonly "model-error": never;
  readonly "before-compaction": { readonly messages: readonly ModelMessage[] };
  readonly "after-compaction": { readonly messages: readonly ModelMessage[] };
  readonly "before-subagent":
    { readonly prompt: string } | { readonly deny: string };
  readonly "after-subagent": { readonly text: string };
  readonly "run-end": never;
  readonly "before-tool":
    { readonly deny: string } | { readonly input: unknown };
  readonly "after-tool": { readonly result: ToolOutput };
  readonly stop: { readonly continue: string };
}

export type HarnessHookInput<Phase extends HarnessHookPhase> =
  HarnessHookEvents[Phase] & HarnessHookContext;

export type HarnessHookResult<Phase extends HarnessHookPhase> =
  HarnessHookDecisions[Phase] | undefined | void;

export type HarnessHookOptions<Phase extends HarnessHookPhase> = {
  readonly on: Phase;
  readonly name?: string;
  readonly timeoutMs?: number;
} & (
  | {
      readonly command?: never;
      run(
        input: HarnessHookInput<Phase>,
      ): HarnessHookResult<Phase> | Promise<HarnessHookResult<Phase>>;
    }
  | { readonly command: HookCommand; readonly run?: never }
);

export interface HarnessHook<
  Phase extends HarnessHookPhase = HarnessHookPhase,
> {
  readonly kind: "hook";
  readonly on: Phase;
  readonly name: string;
  readonly timeoutMs?: number;
  run(
    input: HarnessHookInput<Phase>,
  ): HarnessHookResult<Phase> | Promise<HarnessHookResult<Phase>>;
}
