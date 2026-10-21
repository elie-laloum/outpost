import type { JsonSchema } from "../domain/tool.types.ts";

export interface JsonDecoder<T> {
  readonly schema: JsonSchema;
  parse(value: unknown, label?: string): T;
}
