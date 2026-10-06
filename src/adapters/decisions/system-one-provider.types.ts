export interface SystemOneDecisionProviderOptions {
  readonly baseUrl: string;
  readonly apiKey: string | false;
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}
