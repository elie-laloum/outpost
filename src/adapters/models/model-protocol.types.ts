import type { ServerSentEvent } from "../../infrastructure/sse.types.ts";
import type {
  AgentModel,
  ModelContentBlock,
  ModelRequest,
  ModelResult,
} from "../../domain/model.types.ts";

export interface HttpModelOptions {
  readonly baseUrl: string;
  readonly apiKey: string | false;
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}

export interface ProtocolContext {
  readonly identity: string;
  readonly model: string;
}

export interface StreamDecoder {
  push(event: ServerSentEvent): string | undefined;
  final(): unknown;
}

export interface StreamProtocol {
  readonly body: Readonly<Record<string, unknown>>;
  decoder(): StreamDecoder;
}

export interface ModelProtocol {
  readonly path: string;
  readonly stream?: StreamProtocol;
  validate?(model: AgentModel): void;
  build(
    request: ModelRequest,
    context: ProtocolContext,
  ): Record<string, unknown>;
  read(value: unknown, context: ProtocolContext): ModelResult;
}

export type BlockEncoders<Extra extends unknown[] = []> = {
  readonly [Type in ModelContentBlock["type"]]: (
    block: Extract<ModelContentBlock, { type: Type }>,
    ...extra: Extra
  ) => unknown;
};

export interface ChatToolCallDraft {
  id?: string;
  readonly type: "function";
  readonly function: ChatFunctionDraft;
}

export interface ChatFunctionDraft {
  name?: string;
  arguments: string;
}
