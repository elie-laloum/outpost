import { invariant, OutpostError, positive } from "../../domain/errors.ts";
import {
  defineDecision,
  validateDecisionState,
} from "../../domain/decision.ts";
import { resetTimestamp } from "../../domain/quota.ts";
import type {
  DecisionProvider,
  DecisionRequest,
} from "../../domain/decision.types.ts";
import { modelJson } from "../models/model-http.ts";
import { retryAfterMs } from "../models/retry-after.ts";
import { readSystemOneResponse } from "./system-one-response.ts";
import type { SystemOneDecisionProviderOptions } from "./system-one-provider.types.ts";
import {
  DECISION_TIMEOUT_MS,
  DECISION_RESPONSE_BYTES,
  DECISION_MAX_TIMEOUT_MS,
  DECISION_UNAVAILABLE_STATUSES,
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
        !/[\r\n]/.test(options.apiKey)),
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
      request.signal?.throwIfAborted();
      const deadline = new AbortController();
      const signal = request.signal
        ? AbortSignal.any([request.signal, deadline.signal])
        : deadline.signal;
      const timer = setTimeout(() => deadline.abort(), timeoutMs);
      try {
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
        if (!response.ok) {
          const retryAfter = retryAfterMs(response.headers.get("Retry-After"));
          await response.body?.cancel();
          const resetAt =
            response.status === 429 && retryAfter !== undefined
              ? resetTimestamp(retryAfter)
              : undefined;
          throw new OutpostError(
            response.status === 429 ? "quota" : "provider",
            `Decision request failed with HTTP ${response.status}`,
            {
              status: response.status,
              ...(retryAfter === undefined ? {} : { retryAfterMs: retryAfter }),
              ...(resetAt === undefined ? {} : { resetAt }),
              ...(DECISION_UNAVAILABLE_STATUSES.has(response.status)
                ? { unavailable: `HTTP ${response.status}` }
                : {}),
            },
          );
        }
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
          { unavailable: "HTTP transport failure" },
        );
      } finally {
        clearTimeout(timer);
      }
    },
  });
}
