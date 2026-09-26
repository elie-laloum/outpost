import type { Usage } from "./agent.types.ts";

export type ModelReasoning =
  "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";

export interface AgentModel {
  readonly name: string;
  readonly reasoning?: ModelReasoning;
  readonly maxOutputTokens?: number;
}

export type ModelSpec = string | AgentModel;

export interface ModelTextBlock {
  readonly type: "text";
  readonly text: string;
}

export interface ModelToolCallBlock {
  readonly type: "tool-call";
  readonly id: string;
  readonly name: string;
  readonly input: unknown;
}

export interface ModelToolResultBlock {
  readonly type: "tool-result";
  readonly callId: string;
  readonly content: string;
  readonly isError?: boolean;
}

export interface ModelReasoningBlock {
  readonly type: "reasoning";
  readonly provider: string;
  readonly model: string;
  readonly data: unknown;
}

export type ModelContentBlock =
  | ModelTextBlock
  | ModelToolCallBlock
  | ModelToolResultBlock
  | ModelReasoningBlock;

export interface ModelMessage {
  readonly role: "user" | "assistant";
  readonly content: readonly ModelContentBlock[];
}

export interface ModelToolSpec {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: Readonly<Record<string, unknown>>;
}

export type ModelStopReason = "end" | "tool-calls" | "max-tokens" | "refusal";

export interface ModelRequest {
  readonly model: string;
  readonly prompt?: string;
  readonly messages?: readonly ModelMessage[];
  readonly system?: string;
  readonly tools?: readonly ModelToolSpec[];
  readonly maxOutputTokens?: number;
  readonly reasoning?: ModelReasoning;
  readonly cache?: boolean;
  readonly signal?: AbortSignal;
}

export interface ModelResult {
  readonly text: string;
  readonly content?: readonly ModelContentBlock[];
  readonly stopReason?: ModelStopReason;
  readonly usage?: Usage;
}

export interface ModelProvider {
  readonly name: string;
  readonly identity?: string;
  validate?(model: AgentModel): void;
  request(request: ModelRequest): Promise<ModelResult>;
}
