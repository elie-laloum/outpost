import type {
  AgentModel,
  ModelMessage,
  ModelResult,
  ModelToolCallBlock,
} from "./model.types.ts";
import type { SandboxLease } from "./sandbox.types.ts";
import type { ToolOutput } from "./tool.types.ts";

export type HarnessHookPhase =
  | "session-start"
  | "before-model"
  | "after-model"
  | "before-tool"
  | "after-tool"
  | "stop";

export interface HarnessHookContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  readonly model: AgentModel;
  readonly step: number;
}

export interface HarnessToolResultView {
  readonly content: string;
  readonly isError: boolean;
}

export interface HarnessHookEvents {
  readonly "session-start": { readonly prompt: string };
  readonly "before-model": { readonly messages: readonly ModelMessage[] };
  readonly "after-model": { readonly result: ModelResult };
  readonly "before-tool": { readonly call: ModelToolCallBlock };
  readonly "after-tool": {
    readonly call: ModelToolCallBlock;
    readonly result: HarnessToolResultView;
  };
  readonly stop: { readonly text: string };
}

export interface HarnessHookDecisions {
  readonly "session-start": { readonly instructions: string };
  readonly "before-model": never;
  readonly "after-model": never;
  readonly "before-tool":
    { readonly deny: string } | { readonly input: unknown };
  readonly "after-tool": { readonly result: ToolOutput };
  readonly stop: { readonly continue: string };
}

export type HarnessHookInput<Phase extends HarnessHookPhase> =
  HarnessHookEvents[Phase] & HarnessHookContext;

export type HarnessHookResult<Phase extends HarnessHookPhase> =
  HarnessHookDecisions[Phase] | undefined | void;

export interface HarnessHookOptions<Phase extends HarnessHookPhase> {
  readonly on: Phase;
  readonly name?: string;
  run(
    input: HarnessHookInput<Phase>,
  ): HarnessHookResult<Phase> | Promise<HarnessHookResult<Phase>>;
}

export interface HarnessHook<
  Phase extends HarnessHookPhase = HarnessHookPhase,
> {
  readonly kind: "hook";
  readonly on: Phase;
  readonly name: string;
  run(
    input: HarnessHookInput<Phase>,
  ): HarnessHookResult<Phase> | Promise<HarnessHookResult<Phase>>;
}
