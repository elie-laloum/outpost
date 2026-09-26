import type { AgentEvent, CustomAgent } from "../domain/agent.types.ts";
import type {
  ModelContentBlock,
  ModelMessage,
  ModelProvider,
  ModelResult,
  ModelToolCallBlock,
} from "../domain/model.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";

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
  readonly calls: readonly ModelToolCallBlock[];
}

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
