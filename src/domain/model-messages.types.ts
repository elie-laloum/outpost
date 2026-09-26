import type { ModelContentBlock, ModelMessage } from "./model.types.ts";

export interface BlockRule {
  readonly role: ModelMessage["role"] | "any";
  valid(block: Readonly<Record<string, unknown>>): boolean;
}

export type BlockRules = Readonly<Record<ModelContentBlock["type"], BlockRule>>;
