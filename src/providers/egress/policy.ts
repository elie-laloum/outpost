import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { egressAddress, egressCidr } from "./address.ts";
import type {
  Allowlist,
  EgressAddress,
  EgressResolver,
} from "./egress.types.ts";

function subnets(cidrs: readonly string[]) {
  const result = { ipv4: new BlockList(), ipv6: new BlockList() };
  for (const cidr of cidrs.map(egressCidr)) {
    const [address, prefix] = cidr.split("/");
    const family = isIP(address!) === 4 ? "ipv4" : "ipv6";
    result[family].addSubnet(
      address!,
      Number(prefix),
      isIP(address!) === 4 ? "ipv4" : "ipv6",
    );
  }
  return result;
}

export function egressAccess(policy: Allowlist) {
  const denied = subnets(policy.denyCidrs ?? []);
  const allowed = subnets(policy.allowCidrs ?? []);
  const local = subnets(["127.0.0.0/8", "::1/128", "0.0.0.0/8", "::/128"]);
  const domains = (policy.domains ?? []).map((name) => name.toLowerCase());
  const matches = (
    list: ReturnType<typeof subnets>,
    address: EgressAddress,
  ) => {
    const family = address.family === 4 ? "ipv4" : "ipv6";
    return list[family].check(address.address, family);
  };
  const domain = (hostname: string) => {
    if (
      hostname.length > 253 ||
      !hostname
        .split(".")
        .every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))
    )
      return false;
    return domains.some((pattern) =>
      pattern.startsWith("*.")
        ? hostname.toLowerCase().endsWith(pattern.slice(1))
        : hostname.toLowerCase() === pattern,
    );
  };
  return {
    domain,
    async resolve(
      hostname: string,
      resolver: EgressResolver = (name) => lookup(name, { all: true }),
    ): Promise<EgressAddress> {
      const version = isIP(hostname);
      if (!version && !domain(hostname))
        throw new Error("Egress destination denied");
      const addresses = version
        ? [{ address: hostname, family: version }]
        : await resolver(hostname);
      const selected = addresses
        .filter((item) => isIP(item.address) === item.family)
        .map((item) => egressAddress(item.address))
        .find(
          (address) =>
            isIP(address.address) === address.family &&
            !matches(local, address) &&
            !matches(denied, address) &&
            (domain(hostname) || matches(allowed, address)),
        );
      if (!selected) throw new Error("Egress destination denied");
      return selected;
    },
  };
}
