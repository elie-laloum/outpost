import type { Usage } from "./agent.types.ts";

export interface ModelRequest {
  readonly prompt: string;
  readonly system?: string;
  readonly maxOutputTokens?: number;
  readonly signal?: AbortSignal;
}

export interface ModelResult {
  readonly text: string;
  readonly usage?: Usage;
}

export interface ModelProvider {
  readonly name: string;
  generate(request: ModelRequest): Promise<ModelResult>;
}
