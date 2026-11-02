import { isIP } from "node:net";
import { egressAddress } from "./address.ts";
import { egressRuntime } from "./egress.constants.ts";
import type { EgressAddress } from "./egress.types.ts";

function nameserver(line: string): string | undefined {
  const [keyword, value = ""] = line.trim().split(/\s+/);
  if (keyword !== "nameserver") return undefined;
  const [address = "", zone] = value.split("%");
  if (zone !== undefined && isIP(address) !== 6) return undefined;
  return isIP(address) ? address : undefined;
}

export function egressNameservers(resolvConf: string): EgressAddress[] {
  const addresses = resolvConf
    .split(/\r?\n/)
    .map(nameserver)
    .filter((address) => address !== undefined)
    .slice(0, egressRuntime.maxNameservers)
    .map(egressAddress);
  return addresses.filter(
    (candidate, index) =>
      addresses.findIndex((other) => other.address === candidate.address) ===
      index,
  );
}
