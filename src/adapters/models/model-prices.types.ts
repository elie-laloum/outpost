export interface ModelPricesOptions {
  readonly source?: "models.dev" | "openrouter";
  readonly provider?: string;
  readonly models: Readonly<Record<string, string>>;
  readonly currency?: "EUR" | "USD";
  readonly usdExchangeRate?: number;
  readonly url?: string;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}
