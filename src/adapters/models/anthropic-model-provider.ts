import { invariant, positive } from "../../domain/errors.ts";
import type { ModelProvider } from "../../domain/model.types.ts";
import type { AnthropicModelProviderOptions } from "./anthropic-model-provider.types.ts";
import {
  ANTHROPIC_BASE_URL,
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
        "maxOutputTokens",
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
  const maxOutputTokens = positive(options.maxOutputTokens, "maxOutputTokens");
  const cacheSystem = options.cacheSystem ?? false;
  return textProvider(
    { ...options, baseUrl: options.baseUrl ?? ANTHROPIC_BASE_URL },
    {
      path: "messages",
      build(model, request) {
        invariant(
          !cacheSystem || !!request.system?.trim(),
          "System cache requires system instructions",
        );
        return {
          model,
          max_tokens: request.maxOutputTokens ?? maxOutputTokens,
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
