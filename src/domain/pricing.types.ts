import type { Usage } from "./agent.types.ts";

export interface ModelPrice {
  readonly input: number;
  readonly output: number;
  readonly cached?: number;
  readonly cacheCreated?: number;
}

export interface ModelPriceTable {
  readonly currency: "EUR" | "USD";
  readonly models: Readonly<Record<string, ModelPrice>>;
}

export interface UsageCost {
  readonly currency: "EUR" | "USD";
  readonly amount: number;
  readonly complete: boolean;
}

export interface ModelUsage extends Omit<Usage, "models"> {
  readonly inputIncludesCache?: boolean;
}

export type TokenUsage = Omit<Usage, "models">;
