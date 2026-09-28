import type { ModelResult } from "../domain/model.types.ts";

export interface HarnessBudget {
  check(): void;
  account(result: ModelResult): void;
}
