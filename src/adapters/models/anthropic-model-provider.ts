import { invariant } from "../../domain/errors.ts";
import type {
  ModelProvider,
  ModelReasoning,
} from "../../domain/model.types.ts";
import type { AnthropicModelProviderOptions } from "./anthropic-model-provider.types.ts";
import {
  ANTHROPIC_BASE_URL,
  ANTHROPIC_REASONING,
  ANTHROPIC_VERSION,
} from "./anthropic-model-provider.constants.ts";
import { readAnthropicResponse } from "./anthropic-response.ts";
import { textProvider } from "./text-provider.ts";

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
  return textProvider(
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
      build(model, request) {
        invariant(
          !cacheSystem || !!request.system?.trim(),
          "System cache requires system instructions",
        );
        invariant(
          request.maxOutputTokens !== undefined,
          "Anthropic requests require maxOutputTokens",
        );
        supportedReasoning(request.reasoning);
        return {
          model,
          max_tokens: request.maxOutputTokens,
          ...(request.reasoning === undefined
            ? {}
            : ANTHROPIC_REASONING[request.reasoning]),
          stream: false,
          messages: [{ role: "user", content: request.prompt }],
          ...(request.system === undefined
            ? {}
            : {
                system: cacheSystem
                  ? [
                      {
                        type: "text",
                        text: request.system,
                        cache_control: { type: "ephemeral" },
                      },
                    ]
                  : request.system,
              }),
        };
      },
      read: readAnthropicResponse,
    },
    "anthropic",
    { "x-api-key": options.apiKey, "anthropic-version": ANTHROPIC_VERSION },
  );
}

function supportedReasoning(reasoning: ModelReasoning | undefined): void {
  invariant(
    reasoning === undefined || Object.hasOwn(ANTHROPIC_REASONING, reasoning),
    `Anthropic does not support reasoning "${reasoning}"`,
  );
}
