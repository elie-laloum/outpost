import { isIP } from "node:net";
import { egressRuntime } from "./egress.constants.ts";
import type { Allowlist } from "./egress.types.ts";
import { egressCidr } from "./address.ts";

export function egressFirewall(policy: Allowlist): string {
  const destination = (value: string) => {
    const cidr = egressCidr(value);
    return `${isIP(cidr.split("/")[0]!) === 4 ? "ip" : "ip6"} daddr ${cidr}`;
  };
  return `table inet outpost_egress {
 set live { type nf_proto; flags timeout; timeout 3s; }
 chain permitted {
  ${(policy.denyCidrs ?? []).map((cidr) => `${destination(cidr)} drop`).join("\n  ")}
  meta skuid ${egressRuntime.uid} meta l4proto { tcp, udp } accept
  ${(policy.allowCidrs ?? []).map((cidr) => `${destination(cidr)} meta l4proto { tcp, udp } accept`).join("\n  ")}
 }
 chain output {
  type filter hook output priority -150; policy drop;
  oifname "lo" ip daddr 127.0.0.1 accept
  oifname "lo" ip6 daddr ::1 accept
  ip6 hoplimit 255 icmpv6 type { nd-neighbor-solicit, nd-neighbor-advert, nd-router-solicit } accept
  meta nfproto @live jump permitted
 }
 chain forward { type filter hook forward priority 0; policy drop; }
}`;
}

export function egressHeartbeat(): string {
  return "flush set inet outpost_egress live\nadd element inet outpost_egress live { ipv4 timeout 3s, ipv6 timeout 3s }";
}
