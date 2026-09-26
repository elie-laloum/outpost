import { invariant, OutpostError, positive } from "../../domain/errors.ts";
import type {
  ModelProvider,
  ModelRequest,
  ModelStreamEvent,
} from "../../domain/model.types.ts";
import { serverSentEvents } from "../../infrastructure/sse.ts";
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
  const post = async (body: unknown, signal: AbortSignal) => {
    signal.throwIfAborted();
    const response = await fetch(endpoint, {
      method: "POST",
      redirect: "error",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal,
    });
    if (response.ok) return response;
    await response.body?.cancel();
    throw new OutpostError(
      "provider",
      `Model request failed with HTTP ${response.status}`,
      { status: response.status },
    );
  };
  const failure = (
    error: unknown,
    signal: AbortSignal,
    deadline: AbortSignal,
    request: ModelRequest,
  ): OutpostError => {
    if (signal.aborted) {
      const timedOut = deadline.aborted && !request.signal?.aborted;
      return new OutpostError(
        timedOut ? "timeout" : "aborted",
        timedOut ? "Model request timed out" : "Model request was cancelled",
      );
    }
    if (error instanceof OutpostError) return error;
    return new OutpostError(
      "provider",
      "Model request failed during HTTP transport",
    );
  };
  async function* stream(
    request: ModelRequest,
  ): AsyncGenerator<ModelStreamEvent> {
    validateModelRequest(request);
    const streaming = protocol.stream!;
    const context = { identity, model: request.model };
    const deadline = new AbortController();
    const signal = request.signal
      ? AbortSignal.any([request.signal, deadline.signal])
      : deadline.signal;
    let timer = setTimeout(() => deadline.abort(), timeoutMs);
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => deadline.abort(), timeoutMs);
    };
    try {
      const response = await post(
        { ...protocol.build(request, context), ...streaming.body },
        signal,
      );
      if (!response.body)
        throw new OutpostError("response", "Model response has no body");
      const decoder = streaming.decoder();
      for await (const event of serverSentEvents(
        response.body,
        maxBytes,
        refresh,
      )) {
        signal.throwIfAborted();
        const text = decoder.push(event);
        if (text) yield { type: "text-delta", text };
      }
      signal.throwIfAborted();
      yield { type: "result", result: protocol.read(decoder.final(), context) };
    } catch (error) {
      throw failure(error, signal, deadline.signal, request);
    } finally {
      clearTimeout(timer);
    }
  }
  return Object.freeze({
    name,
    identity,
    ...(protocol.validate ? { validate: protocol.validate } : {}),
    ...(protocol.stream ? { stream } : {}),
    async request(request: ModelRequest) {
      validateModelRequest(request);
      const context = { identity, model: request.model };
      const deadline = new AbortController();
      const signal = request.signal
        ? AbortSignal.any([request.signal, deadline.signal])
        : deadline.signal;
      const timer = setTimeout(() => deadline.abort(), timeoutMs);
      try {
        const response = await post(protocol.build(request, context), signal);
        const value = await modelJson(response, maxBytes);
        signal.throwIfAborted();
        return protocol.read(value, context);
      } catch (error) {
        throw failure(error, signal, deadline.signal, request);
      } finally {
        clearTimeout(timer);
      }
    },
  });
}
