---
title: "Restrict network access"
description: "Configure supported outbound rules and understand where they apply."
---

## Choose a policy

:::caution[Experimental]
Egress policies are experimental. Check that your provider and account enforce a policy before you rely on it.
:::

Set `egress` on the sandbox provider to restrict outbound traffic from the sandbox. If you omit it, the provider’s network defaults apply. Check the support table before selecting a policy.

API reference: [EgressPolicy](../../reference/egresspolicy/).

Support depends on the provider. Outpost rejects an unsupported policy with a `configuration` error when you create the provider.

| Provider           | `deny-all`            | `domains`        | `allowCidrs`                     | `denyCidrs` |
| ------------------ | --------------------- | ---------------- | -------------------------------- | ----------- |
| Docker, Podman     | Yes (network `none`)  | HTTP/HTTPS proxy | IPv4 and IPv6 TCP/UDP            | Yes         |
| Vercel             | Yes                   | Yes              | IPv4 and IPv6                    | Yes         |
| Daytona            | Yes, server-confirmed | Up to 100        | Up to 10 IPv4, without `domains` | No          |
| Local, Firecracker | No                    | No               | No                               | No          |

## Allow model APIs and registries

A CLI agent in a cloud sandbox needs its model API and the registries it installs from. List each host it contacts.

```ts
import { createVercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

const sandboxProvider = createVercelSandboxProvider({
  egress: {
    mode: "allowlist",
    domains: ["api.openai.com", "registry.npmjs.org"],
  },
});
```

Entries in `domains` follow these rules:

- DNS names only, without scheme, path or port: `api.openai.com`.
- An exact name matches that host, not its subdomains.
- `*.example.com` matches subdomains; add `example.com` for the apex.
- Empty allowlists, IP addresses, bare `*`, single-label names and partial wildcards such as `api*.example.com` are rejected.

Outpost adds no destination for you. Include download hosts, redirect targets, authentication endpoints and custom model URLs. When bootstrap needs broad access, preinstall the tools in an [agent image](../agent-images/) instead.

## Vercel specifics

Vercel enforces the policy with its [native firewall](https://vercel.com/docs/sandbox/concepts/firewall).

- Domain rules match the TLS server name (SNI). Plain HTTP needs a CIDR rule.
- `allowCidrs` grant IP access on their own; a broad range bypasses your domain list.
- `denyCidrs` take priority over every allow rule.
- A CIDR-only policy still lets the sandbox resolve other DNS names.

For per-domain request rules and transforms, set Vercel's native `create.networkPolicy` instead. It is outside the portable policy, and Outpost rejects a provider that sets both.

## Daytona specifics

Daytona enforces sandbox-level network rules only on Tier 3 or 4 accounts with the `WRITE_SANDBOXES` permission.

```ts
import { createDaytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";

const sandboxProvider = createDaytonaSandboxProvider({
  egress: { mode: "allowlist", allowCidrs: ["203.0.113.0/24"] },
});
```

Outpost sends the policy at creation, then applies it again through Daytona's network API before it prepares the workspace. If Daytona refuses, acquisition fails with a `provider` error and Outpost deletes the sandbox.

- Use `domains` or `allowCidrs`, not both, and no `denyCidrs`.
- List at most 100 domains or 10 IPv4 CIDRs.
- Daytona's `*.example.com` also matches `example.com`, so Outpost requires `example.com` in the list too.
- Choose `egress` or Daytona's native network settings in `create`, including `outboundProxyUrl`. Native settings keep Daytona's semantics, without Outpost's confirmation.

Confirmation happens after the sandbox starts, so code the image launches on its own may run first. Use trusted images without startup workloads or embedded secrets. See [Daytona network limits](https://www.daytona.io/docs/en/network-limits/).

## Filter Docker and Podman traffic

An allowlist automatically starts one dedicated egress container per sandbox. The sandbox shares its network namespace, but not its filesystem or process namespace. Only the companion receives `NET_ADMIN`; the sandbox cannot change the firewall, including commands run with `elevated`. Both containers are removed on release, and explicit recovery also finds a companion left by interrupted provisioning. No host firewall configuration or `sudo` is required by Outpost.

This provider implementation is unreleased in the npm package. Its companion image is public, supports Linux amd64 and arm64, and is pinned by digest in Outpost. The engine downloads it automatically when absent; no local companion build or registry login is required.

Use a domain for web access and a CIDR for direct TCP/UDP access. This example grants HTTPS to a registry and direct connections to a documentation-only IP range; replace that range with your service's actual addresses. `denyCidrs` takes priority over domain and CIDR grants.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  egress: {
    mode: "allowlist",
    domains: ["registry.npmjs.org"],
    allowCidrs: ["192.0.2.0/24"],
    denyCidrs: ["192.0.2.42/32"],
  },
});
```

The Podman factory accepts the same options. Omitting `egressImage` selects the verified public image pinned by digest. For development, build `images/egress/Dockerfile` and select it with `egressImage: "outpost-egress:dev"`. An override is trusted runtime code, so pin its digest in production. The companion receives the policy, not the workspace or agent credentials.

Outpost sets upper- and lowercase `HTTP_PROXY`/`HTTPS_PROXY`, a loopback-only `NO_PROXY`, and `NODE_USE_ENV_PROXY=1`. Software that ignores the proxy must use an explicitly allowed CIDR or its connection fails. Domain rules permit HTTP on port 80 and HTTPS CONNECT on port 443. For domain targets, CONNECT must carry a bounded TLS ClientHello whose SNI matches the requested host; encrypted HTTP headers are not inspected. Plain HTTP is forwarded with the authorized target's Host header. WebSocket upgrades over plain HTTP and other proxy ports are refused.

CIDRs independently permit raw TCP and UDP on any port, including IPv6 when the engine supplies IPv6 connectivity. A broad CIDR therefore permits traffic beyond the domain list. Denied destinations remain denied through the proxy and for IPv4-mapped IPv6 addresses. ICMP and other outbound protocols are blocked, apart from the IPv6 neighbor/router discovery needed for link connectivity. IPv4-mapped CIDRs are normalized to IPv4 and require a prefix of at least 96. Localhost (`127.0.0.1` and `::1`) remains available for sandbox services and the proxy; it is outside external egress policy. Unlisted proxy hostnames are rejected before DNS resolution, even with CIDR grants; use a declared domain or an allowed IP literal. Direct DNS is not automatically allowed: the companion resolves proxy targets, while a sandbox needing its own resolver must explicitly allow that resolver's CIDR. This also grants that resolver the traffic allowed by a CIDR rule. Denials also apply to the companion’s resolver: denying its address prevents domain resolution.

Acquisition waits for the firewall and proxy before starting the sandbox. External permissions expire in the kernel within three seconds if the companion dies or stops refreshing them; filtering never falls back to unrestricted networking. Local commands remain usable. UID 65532 is reserved for the proxy. Additional `networks` are refused with an allowlist.

The regression fixture checks real HTTP/HTTPS, TCP/UDP, denial precedence, elevated commands, IPv4-mapped addresses, companion loss and cleanup. The [publication workflow](https://github.com/elie-laloum/outpost/actions/runs/38321177589) passed Docker and rootless Podman tests on GitHub-hosted Linux amd64/arm64 runners. Rootless Docker and Podman also passed in nested Linux test environments. Native macOS/Windows VM setups, standalone rootless Docker hosts and native IPv6 routing still require live validation; an OS name alone does not establish support. An engine that cannot install the firewall refuses acquisition. Image pulls and model requests made on the host remain outside this policy.

The source example is in `examples/73-container-egress/`; it needs no model credentials. The image publication procedure is in `images/egress/README.md`.

## Run a container offline

`deny-all` attaches a Docker or Podman container to the `none` network. Prepare tools and dependencies in the [image](../agent-images/) first.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  egress: { mode: "deny-all" },
});
```

A CLI agent in this sandbox cannot reach its model. The [built-in harness](../harness/) can: its model requests leave from your host, and only its tools run offline.

Sandbox egress does not govern traffic that Outpost handles on the host:

- Model requests from the built-in harness.
- Image pulls and file transfers.
- Requests to a cloud provider's control plane.

## Limits

- A policy is fixed when you create the provider. Outpost does not change it during a run.
- Docker and Podman require a compatible egress image and kernel namespace filtering for allowlists. Explicit `networks` conflict with an allowlist; networks other than `none` conflict with `deny-all`.
- Local execution and [Firecracker](../firecracker/) reject `egress`; Firecracker networking is configured on your host.
- A cloud service can still reject a policy when Outpost acquires the sandbox.
- Allowed destinations can still receive data from the agent.
- Network rules do not restrict mounts, credentials or host sockets you expose to the sandbox. See [Security](../security/).

API: [EgressPolicy](../../reference/egresspolicy/) · [ContainerOptions](../../reference/containeroptions/) · [VercelOptions](../../reference/verceloptions/) · [DaytonaOptions](../../reference/daytonaoptions/).
