import type { Usage } from "./agent.types.ts";

export type ModelReasoning =
  "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";

export interface AgentModel {
  readonly name: string;
  readonly reasoning?: ModelReasoning;
  readonly maxOutputTokens?: number;
}

export type ModelSpec = string | AgentModel;

export interface ModelRequest {
  readonly model: string;
  readonly prompt: string;
  readonly system?: string;
  readonly maxOutputTokens?: number;
  readonly reasoning?: ModelReasoning;
  readonly signal?: AbortSignal;
}

export interface ModelResult {
  readonly text: string;
  readonly usage?: Usage;
}

export interface ModelProvider {
  readonly name: string;
  validate?(model: AgentModel): void;
  request(request: ModelRequest): Promise<ModelResult>;
}
