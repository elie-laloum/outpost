export type EgressPolicy =
  | { readonly mode: "deny-all" }
  | {
      readonly mode: "allowlist";
      readonly domains?: readonly string[];
      readonly allowCidrs?: readonly string[];
      readonly denyCidrs?: readonly string[];
    };
