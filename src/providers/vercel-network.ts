import { validateEgress } from "../domain/egress.ts";
import { invariant } from "../domain/errors.ts";
import type { VercelOptions } from "./vercel.types.ts";

export function vercelNetworkPolicy(
  options: VercelOptions,
): NonNullable<VercelOptions["create"]>["networkPolicy"] {
  const policy = validateEgress(options.egress);
  if (!policy) return options.create?.networkPolicy;
  invariant(
    options.create?.networkPolicy === undefined,
    "Use egress or create.networkPolicy, not both",
  );
  if (policy.mode === "deny-all") return "deny-all";
  return {
    allow: [...(policy.domains ?? [])],
    subnets: {
      allow: [...(policy.allowCidrs ?? [])],
      deny: [...(policy.denyCidrs ?? [])],
    },
  };
}
