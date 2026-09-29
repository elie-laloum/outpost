import type { SteeringMode } from "../domain/steering.types.ts";
import type { DispatchOptions } from "./execution.types.ts";

export interface SteeringTurnInput {
  readonly prompt: string;
  readonly continuation: DispatchOptions["continuation"];
  readonly mode: SteeringMode;
}
