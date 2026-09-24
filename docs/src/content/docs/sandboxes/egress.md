---
title: Restrict outbound networking
description: Opt-in egress policy prototype for Vercel, Docker and Podman.
sidebar:
  order: 9
---

`egress` is an opt-in research prototype configured when constructing a provider. Omitting it preserves the provider's existing networking behavior. Outpost validates and copies the policy before allocation; it does not install an in-process proxy or depend on agent cooperation.

| Provider                      | `deny-all`                 | `allowlist`                     |
| ----------------------------- | -------------------------- | ------------------------------- |
| Docker / Podman               | Container network `none`   | Rejected before allocation      |
| Vercel                        | Native firewall            | Native domain and CIDR firewall |
| Local / Daytona / Firecracker | No Outpost `egress` option | No Outpost `egress` option      |

## Run an offline command

Use an existing Git repository and a previously built Outpost image. This example makes no model calls. Package installation and agent API calls need networking, so install dependencies in the image beforehand.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

const box = await createSandbox({
  repository: "/path/to/repository",
  provider: docker({
    image: "outpost:my-project",
    egress: { mode: "deny-all" },
  }),
  branch: { mode: "named", name: "offline-check" },
});
try {
  const result = await box.command({
    executable: "git",
    arguments: ["status"],
  });
  console.log(result.status, result.stdout);
} finally {
  await box.close();
}
```

Podman accepts the same policy. Combining `deny-all` with any `networks` entry other than `none` fails. Loopback remains available with [Docker's `none` network](https://docs.docker.com/engine/network/drivers/none/). The host still uses its own network for image pulls and orchestration. Mounted sockets, devices, privileged host control and services exposed through files can provide other communication paths; this option does not inspect them.

## Select Vercel destinations

Configure [Vercel prerequisites](../../providers/vercel/) before allocation. Cloud sandboxes may incur provider charges.

```ts
import type { EgressPolicy } from "@elie-laloum/outpost";
import { vercel } from "@elie-laloum/outpost/providers/vercel";

const policy: EgressPolicy = {
  mode: "allowlist",
  domains: ["registry.npmjs.org", "api.example.com", "*.packages.example.com"],
  denyCidrs: ["10.0.0.0/8"],
};
const provider = vercel({ egress: policy });
```

Pass `provider` to `createSandbox` and close the sandbox in `finally`. Adjust destinations for your actual workflow; the example is not a complete agent login or package registry allowlist. Requests to missing destinations fail instead of opening access automatically.

Domains must be ASCII DNS names with at least two labels, optionally prefixed by `*.`. URLs, ports, partial wildcards and bare IP addresses are rejected. Use `allowCidrs` for IPv4/IPv6 address ranges. Empty allowlists fail; choose `deny-all` explicitly. The SDK-specific `create.networkPolicy` remains available, but cannot be combined with `egress`.

Vercel's [firewall contract](https://vercel.com/docs/sandbox/concepts/firewall/) governs enforcement: domain filtering uses TLS SNI, not HTTP paths or virtual hosts. Wildcards exclude the apex. Allowed CIDRs bypass domain rules; denied CIDRs take precedence. CIDR-only policies permit unrestricted DNS, and shared endpoints may allow domain fronting. These limits mean an allowlist is not a guarantee against exfiltration. `deny-all` also blocks DNS.

This prototype does not offer dynamic policy updates, request-level filtering, credential brokering, traffic auditing or container domain allowlists. Vercel mapping has deterministic contract tests; live cloud firewall enforcement requires separate account-backed validation. Real container tests verify network isolation and raw-IP failure without relying on an external service.
