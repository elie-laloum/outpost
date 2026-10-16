import { httpTransportFailure } from "../../infrastructure/http-transport.ts";
import { invariant, OutpostError, positive } from "../../domain/errors.ts";
import {
  defineDecision,
  validateDecisionState,
} from "../../domain/decision.ts";
import type {
  DecisionProvider,
  DecisionRequest,
} from "../../domain/decision.types.ts";
import { modelJson } from "../models/model-http.ts";
import { httpFailure } from "../models/http-failure.ts";
import { readSystemOneResponse } from "./system-one-response.ts";
import type { SystemOneDecisionProviderOptions } from "./system-one-provider.types.ts";
import {
  DECISION_TIMEOUT_MS,
  DECISION_RESPONSE_BYTES,
  DECISION_MAX_TIMEOUT_MS,
  SYSTEM_ONE_PROVIDER_FIELDS,
} from "./system-one-provider.constants.ts";

export function createSystemOneDecisionProvider(
  options: SystemOneDecisionProviderOptions,
): DecisionProvider {
  invariant(
    options && typeof options === "object",
    "Decision provider options must be an object",
  );
  invariant(
    Object.keys(options).every((key) => SYSTEM_ONE_PROVIDER_FIELDS.has(key)),
    "Unsupported System One provider option",
  );
  let base: URL;
  try {
    base = new URL(options.baseUrl);
  } catch {
    throw new OutpostError(
      "configuration",
      "Decision baseUrl must be an absolute HTTP(S) URL",
    );
  }
  invariant(
    ["http:", "https:"].includes(base.protocol) &&
      !base.username &&
      !base.password &&
      !base.href.includes("?") &&
      !base.href.includes("#"),
    "Decision baseUrl must use HTTP(S) without credentials, query or fragment",
  );
  invariant(
    options.apiKey === false ||
      (typeof options.apiKey === "string" &&
        options.apiKey.trim() &&
        !/[^\x21-\x7e]/.test(options.apiKey)),
    "Decision apiKey must be nonempty or false",
  );
  const endpoint = `${base.href.replace(/\/+$/, "")}/systemone`;
  const timeoutMs = positive(
    options.timeoutMs ?? DECISION_TIMEOUT_MS,
    "Decision timeoutMs",
  );
  invariant(
    timeoutMs <= DECISION_MAX_TIMEOUT_MS,
    "Decision timeoutMs exceeds the supported timer range",
  );
  const maxBytes = positive(
    options.maxResponseBytes ?? DECISION_RESPONSE_BYTES,
    "Decision maxResponseBytes",
  );
  const key = options.apiKey;
  return Object.freeze({
    name: "system-one",
    identity: `system-one:${endpoint}`,
    async request(request: DecisionRequest) {
      invariant(
        request && typeof request.model === "string" && request.model.trim(),
        "Decision model must be nonempty text",
      );
      const decision = defineDecision({ questions: request.questions });
      validateDecisionState(request.state);
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
            ...(key === false ? {} : { Authorization: `Bearer ${key}` }),
          },
          body: JSON.stringify({
            model: request.model,
            state: request.state,
            questions: decision.questions,
          }),
          signal,
        });
        if (!response.ok)
          throw await httpFailure(response, maxBytes, "Decision");
        const value = await modelJson(response, maxBytes);
        signal.throwIfAborted();
        return readSystemOneResponse(value);
      } catch (error) {
        if (signal.aborted)
          throw new OutpostError(
            request.signal?.aborted ? "aborted" : "timeout",
            request.signal?.aborted
              ? "Decision request was cancelled"
              : "Decision request timed out",
          );
        if (error instanceof OutpostError) throw error;
        throw new OutpostError(
          "provider",
          "Decision request failed during HTTP transport",
          httpTransportFailure(error),
        );
      } finally {
        clearTimeout(timer);
      }
    },
  });
}
