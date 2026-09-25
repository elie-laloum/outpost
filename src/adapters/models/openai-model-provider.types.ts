import type {
  AgentModel,
  ModelRequest,
  ModelResult,
} from "../../domain/model.types.ts";

export interface HttpModelOptions {
  readonly baseUrl: string;
  readonly apiKey: string | false;
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}

export interface ModelProtocol {
  readonly path: string;
  validate?(model: AgentModel): void;
  build(model: string, request: ModelRequest): Record<string, unknown>;
  read(value: unknown): ModelResult;
}

export interface OpenAIModelProviderOptions extends HttpModelOptions {
  readonly api?: "chat-completions" | "responses";
}
