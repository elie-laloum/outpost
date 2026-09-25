import { invariant, OutpostError, positive } from "../../domain/errors.ts";
import type { ModelProvider, ModelRequest } from "../../domain/model.types.ts";
import type { OpenAICompatibleOptions } from "./openai-compatible.types.ts";
import {
  MODEL_MAX_TIMEOUT_MS,
  MODEL_RESPONSE_BYTES,
  MODEL_TIMEOUT_MS,
} from "./openai-compatible.constants.ts";
import { modelProtocols, validateModelRequest } from "./openai-request.ts";
import { modelJson } from "./openai-http.ts";

export function openaiCompatible(
  options: OpenAICompatibleOptions,
): ModelProvider {
  let base: URL;
  try {
    base = new URL(options.baseUrl);
  } catch {
    throw new OutpostError(
      "configuration",
      "Model baseUrl must be an absolute HTTP(S) URL",
    );
  }
  invariant(
    ["http:", "https:"].includes(base.protocol) &&
      !base.username &&
      !base.password &&
      !base.search &&
      !base.hash,
    "Model baseUrl must use HTTP(S) without credentials, query or fragment",
  );
  invariant(
    typeof options.model === "string" && options.model.trim(),
    "Model name must be nonempty text",
  );
  invariant(
    options.apiKey === false ||
      (typeof options.apiKey === "string" &&
        options.apiKey.trim() &&
        !/[\r\n]/.test(options.apiKey)),
    "Model apiKey must be a nonempty key or false for unauthenticated endpoints",
  );
  const api = options.api ?? "chat-completions";
  invariant(
    Object.hasOwn(modelProtocols, api),
    "Unsupported model API protocol",
  );
  const protocol = modelProtocols[api]!;
  const endpoint = `${base.href.replace(/\/+$/, "")}/${protocol.path}`;
  const timeoutMs = positive(
    options.timeoutMs ?? MODEL_TIMEOUT_MS,
    "Model timeoutMs",
  );
  invariant(
    timeoutMs <= MODEL_MAX_TIMEOUT_MS,
    "Model timeoutMs exceeds the supported timer range",
  );
  const maxBytes = positive(
    options.maxResponseBytes ?? MODEL_RESPONSE_BYTES,
    "Model maxResponseBytes",
  );
  const model = options.model;
  const apiKey = options.apiKey;
  return Object.freeze({
    name: "openai-compatible",
    async generate(request: ModelRequest) {
      validateModelRequest(request);
      const deadline = new AbortController();
      const signal = request.signal
        ? AbortSignal.any([request.signal, deadline.signal])
        : deadline.signal;
      const timer = setTimeout(() => deadline.abort(), timeoutMs);
      try {
        signal.throwIfAborted();
        const response = await fetch(endpoint, {
          method: "POST",
          redirect: "error",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey === false ? {} : { Authorization: `Bearer ${apiKey}` }),
          },
          body: JSON.stringify(protocol.build(model, request)),
          signal,
        });
        if (!response.ok) {
          await response.body?.cancel();
          throw new OutpostError(
            "provider",
            `Model request failed with HTTP ${response.status}`,
            { status: response.status },
          );
        }
        const value = await modelJson(response, maxBytes);
        signal.throwIfAborted();
        return protocol.read(value);
      } catch (error) {
        if (signal.aborted) {
          const timedOut = deadline.signal.aborted && !request.signal?.aborted;
          throw new OutpostError(
            timedOut ? "timeout" : "aborted",
            timedOut
              ? "Model request timed out"
              : "Model request was cancelled",
          );
        }
        if (error instanceof OutpostError) throw error;
        throw new OutpostError(
          "provider",
          "Model request failed during HTTP transport",
        );
      } finally {
        clearTimeout(timer);
      }
    },
  });
}
