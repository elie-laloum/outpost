import { invariant, OutpostError, positive } from "../../domain/errors.ts";
import type { ModelProvider, ModelRequest } from "../../domain/model.types.ts";
import type {
  HttpModelOptions,
  ModelProtocol,
} from "./model-protocol.types.ts";
import {
  MODEL_MAX_TIMEOUT_MS,
  MODEL_RESPONSE_BYTES,
  MODEL_TIMEOUT_MS,
} from "./model.constants.ts";
import { validateModelRequest } from "./model-request.ts";
import { modelJson } from "./model-http.ts";

export function httpModelProvider(
  options: HttpModelOptions,
  protocol: ModelProtocol,
  name: string,
  headers: Readonly<Record<string, string>>,
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
    options.apiKey === false ||
      (typeof options.apiKey === "string" &&
        options.apiKey.trim() &&
        !/[\r\n]/.test(options.apiKey)),
    "Model apiKey must be a nonempty key or false for unauthenticated endpoints",
  );
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
  const identity = `${name}:${protocol.path}:${base.origin}${base.pathname.replace(/\/+$/, "")}`;
  return Object.freeze({
    name,
    identity,
    ...(protocol.validate ? { validate: protocol.validate } : {}),
    async request(request: ModelRequest) {
      validateModelRequest(request);
      const context = { identity, model: request.model };
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
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(protocol.build(request, context)),
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
        return protocol.read(value, context);
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
