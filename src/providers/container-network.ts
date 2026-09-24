import { validateEgress } from "../domain/egress.ts";
import { invariant } from "../domain/errors.ts";
import type { ContainerOptions } from "./container.types.ts";

export function containerNetworks(
  options: ContainerOptions,
): readonly string[] {
  const policy = validateEgress(options.egress);
  const networks =
    typeof options.networks === "string"
      ? [options.networks]
      : [...(options.networks ?? [])];
  if (!policy) return networks;
  invariant(
    policy.mode === "deny-all",
    "Docker/Podman cannot enforce egress allowlists; use Vercel or an externally managed firewall",
  );
  invariant(
    networks.every((network) => network === "none"),
    "egress deny-all conflicts with configured networks",
  );
  return ["none"];
}
