import type { HttpModelOptions } from "./model-protocol.types.ts";

export interface OpenAIModelProviderOptions extends HttpModelOptions {
  readonly api?: "chat-completions" | "responses";
}
