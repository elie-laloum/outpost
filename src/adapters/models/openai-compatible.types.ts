import type { ModelRequest, ModelResult } from "../../domain/model.types.ts";

export interface OpenAICompatibleOptions {
  readonly baseUrl: string;
  readonly model: string;
  readonly apiKey: string | false;
  readonly api?: "chat-completions" | "responses";
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}

export interface ModelProtocol {
  readonly path: string;
  build(model: string, request: ModelRequest): Record<string, unknown>;
  read(value: unknown): ModelResult;
}
