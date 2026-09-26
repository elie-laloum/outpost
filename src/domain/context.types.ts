import type { AgentModel, ModelMessage } from "./model.types.ts";

export interface HarnessContextInput {
  readonly messages: readonly ModelMessage[];
  readonly step: number;
  readonly model: AgentModel;
  readonly signal: AbortSignal;
  summarize(messages: readonly ModelMessage[]): Promise<string>;
}

export type HarnessContextResult = readonly ModelMessage[] | undefined;

export interface HarnessContextStrategyOptions {
  readonly name: string;
  compact(
    input: HarnessContextInput,
  ): HarnessContextResult | Promise<HarnessContextResult>;
}

export interface HarnessContextStrategy {
  readonly kind: "context";
  readonly name: string;
  compact(input: HarnessContextInput): Promise<HarnessContextResult>;
}

export interface TruncateToolResultsOptions {
  readonly keepRecent?: number;
  readonly maxCharacters?: number;
}

export interface SummarizeHistoryOptions {
  readonly triggerCharacters?: number;
  readonly keepRecentMessages?: number;
}
