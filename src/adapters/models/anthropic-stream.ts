import type { StreamDecoder } from "./model-protocol.types.ts";
import { object, requireResponse } from "./model-response.ts";
import { eventData, streamFailure } from "./stream-events.ts";

export function anthropicStream(): StreamDecoder {
  let message: Record<string, unknown> | undefined;
  let usage: Record<string, unknown> = {};
  let stop: unknown = null;
  const blocks: Record<string, unknown>[] = [];
  const arguments_: string[] = [];
  const append = (
    block: Record<string, unknown>,
    key: string,
    text: unknown,
  ) => {
    requireResponse(typeof text === "string");
    block[key] = `${typeof block[key] === "string" ? block[key] : ""}${text}`;
    return text;
  };
  const deltas: Readonly<
    Record<
      string,
      (
        block: Record<string, unknown>,
        delta: Record<string, unknown>,
        index: number,
      ) => string | undefined
    >
  > = {
    text_delta: (block, delta) => append(block, "text", delta.text),
    thinking_delta: (block, delta) => {
      append(block, "thinking", delta.thinking);
      return undefined;
    },
    signature_delta: (block, delta) => {
      block.signature = delta.signature;
      return undefined;
    },
    input_json_delta: (_block, delta, index) => {
      requireResponse(typeof delta.partial_json === "string");
      arguments_[index] = `${arguments_[index] ?? ""}${delta.partial_json}`;
      return undefined;
    },
  };
  const handlers: Readonly<
    Record<string, (data: Record<string, unknown>) => string | undefined>
  > = {
    message_start: (data) => {
      message = object(data.message);
      usage = { ...object(message.usage ?? {}) };
      return undefined;
    },
    content_block_start: (data) => {
      blocks[index(data)] = { ...object(data.content_block) };
      return undefined;
    },
    content_block_delta: (data) => {
      const delta = object(data.delta);
      const block = blocks[index(data)];
      requireResponse(block);
      const handler =
        typeof delta.type === "string" && Object.hasOwn(deltas, delta.type)
          ? deltas[delta.type]
          : undefined;
      return handler?.(block, delta, index(data));
    },
    content_block_stop: (data) => {
      const block = blocks[index(data)];
      requireResponse(block);
      if (block.type === "tool_use")
        block.input = parse(arguments_[index(data)] ?? "");
      return undefined;
    },
    message_delta: (data) => {
      stop = object(data.delta).stop_reason ?? stop;
      usage = { ...usage, ...object(data.usage ?? {}) };
      return undefined;
    },
    error: streamFailure,
  };
  return {
    push(event) {
      const data = eventData(event);
      const handler =
        typeof data.type === "string" && Object.hasOwn(handlers, data.type)
          ? handlers[data.type]
          : undefined;
      return handler?.(data);
    },
    final() {
      requireResponse(message);
      return {
        ...message,
        content: blocks.filter(Boolean),
        stop_reason: stop,
        ...(Object.keys(usage).length ? { usage } : {}),
      };
    },
  };
}

function index(data: Record<string, unknown>): number {
  requireResponse(Number.isSafeInteger(data.index) && Number(data.index) >= 0);
  return Number(data.index);
}

function parse(text: string): unknown {
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
