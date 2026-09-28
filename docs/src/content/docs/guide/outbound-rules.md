---
title: "Outbound rules"
description: "Request explicit provider-supported network restrictions."
---

:::note[Experimental]
Egress policies are opt-in. Daytona support and immutable Vercel configuration are implemented for the next release. Provider-specific live validation remains necessary.
:::

Set `egress` on the sandbox provider. Outpost validates unsupported combinations before allocation; a cloud service can still reject a policy during acquisition. An omitted policy preserves the provider's existing network defaults.

## Choose a provider

| Provider            | `deny-all`                      | Domain allowlist                             | CIDR rules                             |
| ------------------- | ------------------------------- | -------------------------------------------- | -------------------------------------- |
| Docker / Podman     | Yes, isolated network namespace | Rejected                                     | Rejected                               |
| Vercel              | Native firewall                 | Exact names and `*.example.com`              | IPv4/IPv6 allow and deny               |
| Daytona             | Requires server confirmation    | Exact names; wildcards require explicit apex | IPv4 allow only; no domain/CIDR mixing |
| Local / Firecracker | Rejected by Outpost             | Rejected                                     | Rejected                               |

Container allowlists and runtime policy changes are separate future work. Firecracker host networking remains the operator's responsibility.

## Allow model APIs and package registries

```ts
import { vercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

const sandboxProvider = vercelSandboxProvider({
  egress: {
    mode: "allowlist",
    domains: ["api.openai.com", "registry.npmjs.org"],
  },
});
```

This example permits the model endpoint and registry, not every endpoint an agent may need. Outpost adds no domains automatically. Include download hosts, redirects, authentication endpoints and custom model URLs explicitly. Prefer preinstalled tools when bootstrap would require broader access; see [authentication](../access-credentials/) and [images](../image-recipes/).

Entries are DNS names without scheme, path or port. Exact names do not grant subdomain access. `*.example.com` grants subdomains; list `example.com` separately when the apex is needed. Empty allowlists, raw IPs in `domains`, bare `*` and partial-label wildcards are rejected. Use CIDRs for explicit IP access. Keep any destination list narrow: allowed services can still receive data from the agent.

## Vercel behavior

Vercel domain filtering uses TLS SNI, not an HTTP path or the encrypted `Host` header. Plain HTTP needs CIDR access. Allowed CIDRs independently grant IP access; they do not narrow allowed domains. Denied CIDRs take priority. Broad CIDRs can therefore defeat domain scoping. CIDR-only policies also permit DNS resolution beyond those destinations. See the [native firewall guarantees](https://vercel.com/docs/sandbox/concepts/firewall).

Choose either `egress` or native `create.networkPolicy`. Outpost snapshots both forms so later caller mutations cannot change future allocations. Native request transforms and forwarding remain available through `create.networkPolicy`; they are outside the portable contract.

## Daytona confirmation

```ts
import { daytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";

const sandboxProvider = daytonaSandboxProvider({
  egress: {
    mode: "allowlist",
    domains: ["api.openai.com", "registry.npmjs.org"],
  },
});
```

Daytona requires Tier 3/4 and `WRITE_SANDBOXES` for sandbox-specific enforcement. Outpost supplies the policy at creation, then reapplies it through the server's network-update API before workspace setup or returning a lease. Rejection fails acquisition and triggers deletion. This confirmation does not cover autonomous image startup before acquisition completes; use trusted images without startup workloads or embedded secrets.

Daytona accepts up to 100 domains or 10 IPv4 CIDRs. It cannot represent `denyCidrs` or combined domain/CIDR rules. Its native wildcard includes the apex, so Outpost requires that apex explicitly in `domains` to avoid silently broadening access. Choose either `egress` or native creation networking, including proxy settings. Native options without `egress` retain Daytona's own semantics and do not receive Outpost confirmation. See [Daytona network limits](https://www.daytona.io/docs/en/network-limits/).

## Offline execution and scope

```ts
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = dockerSandboxProvider({
  image: "outpost:dev",
  egress: { mode: "deny-all" },
});
```

Prepare tools and dependencies in the image first. A CLI inside this sandbox cannot reach a remote model. Model-provider requests made by the built-in harness on the host are outside sandbox egress; so are host-side image pulls, transfers and cloud control-plane requests. Network rules do not constrain filesystem mounts, credentials or host sockets deliberately exposed through mounts.

## Reproduce live checks

From a repository checkout with Node.js 24 and installed dependencies:

```sh
OUTPOST_NETWORK_LIVE=1 OUTPOST_NETWORK_PROVIDER=vercel \
  node --env-file=test/.env test/network-live.ts
```

Use `daytona` to exercise that backend. These checks create temporary billable cloud sandboxes, make no model calls, and release acquired leases. Supply the chosen provider's credentials in the ignored environment file. Reports compare unrestricted reachability with restricted probes, including redirects, IP access and warm reuse. An unreachable baseline is `unverified`, never proof of filtering. Exit codes are 0 for passed, 1 for failed and 2 for partial/skipped validation. Daytona confirmation rejection is reported as unavailable, not successful isolation.

The 28 September 2026 campaign verified Vercel exact/wildcard domains, blocked redirects, IPv4 access and CIDR deny precedence, plus deny-all and warm reuse. IPv6 had no reachable baseline and remains unverified. The available Daytona account rejected domain, CIDR and deny-all enforcement; eligible-account enforcement remains unvalidated. Real Docker tests passed; Podman was unavailable on this host.

API: [EgressPolicy](../../reference/egresspolicy/) · [DaytonaOptions](../../reference/daytonaoptions/) · [VercelOptions](../../reference/verceloptions/).
