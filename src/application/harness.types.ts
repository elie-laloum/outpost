import type { AgentEvent, CustomAgent } from "../domain/agent.types.ts";
import type {
  ModelContentBlock,
  ModelMessage,
  ModelProvider,
  ModelResult,
  ModelToolCallBlock,
} from "../domain/model.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { HarnessTool } from "../domain/tool.types.ts";

export interface HarnessRuntime {
  readonly agent: CustomAgent;
  readonly modelProvider: ModelProvider;
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  emit(event: AgentEvent): void;
  hold(): () => void;
}

export interface ToolCallBatch {
  readonly concurrent: boolean;
  readonly calls: readonly PreparedCall[];
}

export type ValidatedInput =
  { readonly value: unknown } | { readonly outcome: ToolOutcome };

export interface ToolOutcome {
  readonly content: string;
  readonly isError: boolean;
}

export interface LoopState {
  readonly messages: ModelMessage[];
  readonly step: number;
  toolCalls: number;
}

export type StopHandler = (
  runtime: HarnessRuntime,
  state: LoopState,
  result: ModelResult,
  content: readonly ModelContentBlock[],
) => Promise<string | undefined>;

export interface PreparedCall {
  readonly call: ModelToolCallBlock;
  readonly tool?: HarnessTool;
  readonly input?: unknown;
  readonly outcome?: ToolOutcome;
}

export interface ToolDenial {
  readonly deny: string;
}
