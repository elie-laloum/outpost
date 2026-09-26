import { invariant } from "../../domain/errors.ts";
import type { ModelProvider } from "../../domain/model.types.ts";
import type { AnthropicModelProviderOptions } from "./anthropic-model-provider.types.ts";
import {
  ANTHROPIC_BASE_URL,
  ANTHROPIC_VERSION,
} from "./anthropic-model-provider.constants.ts";
import { anthropicBody, supportedReasoning } from "./anthropic-request.ts";
import { readAnthropicResponse } from "./anthropic-response.ts";
import { httpModelProvider } from "./http-provider.ts";

export function anthropicModelProvider(
  options: AnthropicModelProviderOptions,
): ModelProvider {
  invariant(
    options && typeof options === "object",
    "Model provider options must be an object",
  );
  invariant(
    Object.keys(options).every((key) =>
      [
        "baseUrl",
        "apiKey",
        "cacheSystem",
        "timeoutMs",
        "maxResponseBytes",
      ].includes(key),
    ),
    "Unsupported Anthropic model provider option",
  );
  invariant(
    typeof options.apiKey === "string",
    "Anthropic requires an API key",
  );
  invariant(
    options.cacheSystem === undefined ||
      typeof options.cacheSystem === "boolean",
    "cacheSystem must be boolean",
  );
  const cacheSystem = options.cacheSystem ?? false;
  return httpModelProvider(
    { ...options, baseUrl: options.baseUrl ?? ANTHROPIC_BASE_URL },
    {
      path: "messages",
      validate(model) {
        invariant(
          model.maxOutputTokens !== undefined,
          "Anthropic requires maxOutputTokens on the agent model",
        );
        supportedReasoning(model.reasoning);
      },
      build: (request, context) => anthropicBody(request, context, cacheSystem),
      read: readAnthropicResponse,
    },
    "anthropic",
    { "x-api-key": options.apiKey, "anthropic-version": ANTHROPIC_VERSION },
  );
}
