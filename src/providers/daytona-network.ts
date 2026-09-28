import { isIP } from "node:net";
import type { Sandbox } from "@daytona/sdk";
import { validateEgress } from "../domain/egress.ts";
import { invariant, OutpostError } from "../domain/errors.ts";
import {
  daytonaNetworkFields,
  daytonaNetworkLimits,
} from "./daytona-network.constants.ts";
import type { DaytonaOptions } from "./daytona.types.ts";

export function daytonaNetworkPolicy(
  options: DaytonaOptions,
): Parameters<Sandbox["updateNetworkSettings"]>[0] | undefined {
  const policy = validateEgress(options.egress);
  if (!policy) return undefined;
  invariant(
    daytonaNetworkFields.every(
      (field) => options.create?.[field] === undefined,
    ),
    "Use egress or Daytona create network settings, not both",
  );
  if (policy.mode === "deny-all") return { networkBlockAll: true };
  const domains = policy.domains ?? [];
  const cidrs = policy.allowCidrs ?? [];
  invariant(
    !policy.denyCidrs?.length,
    "Daytona cannot enforce egress denyCidrs",
  );
  invariant(
    !domains.length || !cidrs.length,
    "Daytona cannot combine egress domains and allowCidrs",
  );
  invariant(
    cidrs.every((entry) => isIP(entry.split("/")[0]!) === 4),
    "Daytona egress allowCidrs supports IPv4 only",
  );
  invariant(
    cidrs.length <= daytonaNetworkLimits.cidrs &&
      domains.length <= daytonaNetworkLimits.domains,
    "Daytona egress supports at most 10 CIDRs or 100 domains",
  );
  const names = new Set(domains.map((name) => name.toLowerCase()));
  invariant(
    domains.every(
      (name) =>
        !name.startsWith("*.") || names.has(name.slice(2).toLowerCase()),
    ),
    "Daytona wildcard domains also allow the apex; list the apex domain explicitly",
  );
  if (domains.length) return { domainAllowList: domains.join(",") };
  return { networkAllowList: cidrs.join(",") };
}

export async function confirmDaytonaNetworkPolicy(
  sandbox: Pick<Sandbox, "updateNetworkSettings">,
  policy: Parameters<Sandbox["updateNetworkSettings"]>[0],
): Promise<void> {
  try {
    await sandbox.updateNetworkSettings({ ...policy });
  } catch (cause) {
    throw new OutpostError(
      "provider",
      "Daytona could not confirm egress enforcement; sandbox-level network controls require Tier 3/4 and WRITE_SANDBOXES permission",
      { stage: "egress-confirmation" },
      cause,
    );
  }
}
