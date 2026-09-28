import type { EgressPolicy } from "../../src/domain/egress.types.ts";

export interface NetworkProbe {
  readonly name: string;
  readonly url?: string;
  readonly host?: string;
  readonly redirect?: boolean;
  readonly allowed: boolean;
}

export interface NetworkScenario {
  readonly name: string;
  readonly egress?: EgressPolicy;
}
