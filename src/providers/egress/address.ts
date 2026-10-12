import { isIP } from "node:net";
import type { EgressAddress } from "./egress.types.ts";

export function egressAddress(address: string): EgressAddress {
  const family = isIP(address);
  if (family !== 6) return { address, family };
  const canonical = new URL(`http://[${address}]/`).hostname;
  const mapped = /^\[::ffff:([a-f0-9]+):([a-f0-9]+)\]$/.exec(canonical);
  if (!mapped) return { address, family };
  const high = Number.parseInt(mapped[1]!, 16);
  const low = Number.parseInt(mapped[2]!, 16);
  return {
    address: `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`,
    family: 4,
  };
}

export function egressCidr(value: string): string {
  const [address, prefix] = value.split("/");
  const normalized = egressAddress(address!);
  if (isIP(address!) !== 6 || normalized.family !== 4) return value;
  if (Number(prefix) < 96)
    throw new Error("IPv4-mapped CIDRs require a prefix of at least 96");
  return `${normalized.address}/${Number(prefix) - 96}`;
}
