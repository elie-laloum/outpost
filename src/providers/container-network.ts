import { validateEgress } from "../domain/egress.ts";
import { invariant } from "../domain/errors.ts";
import type { ContainerOptions } from "./container.types.ts";
import { egressCidr } from "./egress/address.ts";

export function containerNetworks(
  options: ContainerOptions,
): readonly string[] {
  const policy = validateEgress(options.egress);
  const networks =
    typeof options.networks === "string"
      ? [options.networks]
      : [...(options.networks ?? [])];
  if (!policy) return networks;
  if (policy.mode === "allowlist") {
    for (const cidr of [
      ...(policy.allowCidrs ?? []),
      ...(policy.denyCidrs ?? []),
    ]) {
      try {
        egressCidr(cidr);
      } catch {
        invariant(
          false,
          "IPv4-mapped egress CIDRs require a prefix of at least 96",
        );
      }
    }
    invariant(
      networks.length === 0,
      "egress allowlist conflicts with configured networks",
    );
    return [];
  }
  invariant(
    networks.every((network) => network === "none"),
    "egress deny-all conflicts with configured networks",
  );
  return ["none"];
}
