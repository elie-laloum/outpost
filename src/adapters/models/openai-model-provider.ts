import { invariant } from "../../domain/errors.ts";
import type { ModelProvider } from "../../domain/model.types.ts";
import type { OpenAIModelProviderOptions } from "./openai-model-provider.types.ts";
import { modelProtocols } from "./openai-protocols.ts";
import { httpModelProvider } from "./http-provider.ts";

export function openaiModelProvider(
  options: OpenAIModelProviderOptions,
): ModelProvider {
  invariant(
    options && typeof options === "object",
    "Model provider options must be an object",
  );
  invariant(
    Object.keys(options).every((key) =>
      ["baseUrl", "apiKey", "api", "timeoutMs", "maxResponseBytes"].includes(
        key,
      ),
    ),
    "Unsupported OpenAI model provider option",
  );
  const api = options.api ?? "chat-completions";
  invariant(
    Object.hasOwn(modelProtocols, api),
    "Unsupported model API protocol",
  );
  return httpModelProvider(
    options,
    modelProtocols[api]!,
    "openai",
    options.apiKey === false
      ? {}
      : { Authorization: `Bearer ${options.apiKey}` },
  );
}
