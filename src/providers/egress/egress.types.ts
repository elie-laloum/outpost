import type { EgressPolicy } from "../../domain/egress.types.ts";

export type Allowlist = Extract<EgressPolicy, { mode: "allowlist" }>;
export interface EgressAddress {
  readonly address: string;
  readonly family: number;
}
export interface EgressResolver {
  (hostname: string): Promise<readonly EgressAddress[]>;
}
