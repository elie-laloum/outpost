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

export interface ModelProtocol {
  readonly path: string;
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
