import type { HarnessMcpContext } from "../domain/harness.types.ts";
import type { HarnessBudget } from "./harness-budget.types.ts";
import type { HarnessPermissions } from "../domain/permissions.types.ts";
import type { HarnessModelScope } from "./harness-model-provider.types.ts";
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
import type { DispatchOptions, TurnContext } from "./execution.types.ts";

export interface HarnessRuntime {
  readonly verbose?: boolean;
  readonly repository: string;
  readonly conversation?: string | undefined;
  readonly budget: HarnessBudget;
  readonly permissions: readonly HarnessPermissions[];
  readonly depth: number;
  readonly maxDepth: number;
  readonly modelScope: Pick<HarnessModelScope, "track" | "account">;
  readonly agent: CustomAgent;
  readonly tools: readonly HarnessTool[];
  readonly modelProvider: ModelProvider;
  readonly sandbox: SandboxLease;
  readonly mcp?: HarnessMcpContext | undefined;
  readonly signal: AbortSignal;
  /** Run id of the built-in subagent this loop runs, absent for the main loop. */
  readonly subagentId?: string | undefined;
  /** Steering intake shared with subagents so the active loop receives instructions. */
  readonly steering?: HarnessSteering | undefined;
  emit(event: AgentEvent): void;
  hold(): () => void;
}

export interface HarnessSteering {
  /** Delivers and returns the instructions for the main loop or the given subagent. */
  take(subagent: string | undefined): readonly string[];
  /** Rejects instructions still addressed to a subagent run that ended. */
  finish(subagent: string): void;
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

export interface HarnessHistory {
  readonly messages: readonly ModelMessage[];
  append(message: ModelMessage): Promise<void>;
  replace(messages: readonly ModelMessage[]): Promise<void>;
}

export interface CustomTurnContext extends TurnContext {
  readonly continuation?: DispatchOptions["continuation"];
}

export interface LoopState {
  readonly history: HarnessHistory;
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

export type BlockRenderers = {
  readonly [Type in ModelContentBlock["type"]]: (
    block: Extract<ModelContentBlock, { type: Type }>,
  ) => string;
};
