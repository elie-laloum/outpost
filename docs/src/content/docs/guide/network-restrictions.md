---
title: "Network restrictions"
description: "Block or allowlist the outbound traffic of a sandbox with an egress policy on Docker, Podman, Vercel or Daytona."
---

## Choose a policy

:::caution[Experimental]
Egress policies are experimental. Check that your provider and account enforce a policy before you rely on it.
:::

Set `egress` on the sandbox provider. Without it, the provider keeps its own network defaults.

| Policy                                  | Effect                                                         |
| --------------------------------------- | -------------------------------------------------------------- |
| `{ mode: "deny-all" }`                  | Blocks all outbound traffic from the sandbox.                  |
| `{ mode: "allowlist", domains }`        | Allows the listed DNS names only.                              |
| `{ mode: "allowlist", allowCidrs }`     | Allows the listed IP ranges, independently of `domains`.       |
| `{ mode: "allowlist", ..., denyCidrs }` | Denies these IP ranges even when a domain or CIDR allows them. |

Support depends on the provider. Outpost rejects an unsupported policy with a `configuration` error when you create the provider.

| Provider           | `deny-all`            | `domains` | `allowCidrs`                     | `denyCidrs` |
| ------------------ | --------------------- | --------- | -------------------------------- | ----------- |
| Docker, Podman     | Yes (network `none`)  | No        | No                               | No          |
| Vercel             | Yes                   | Yes       | IPv4 and IPv6                    | Yes         |
| Daytona            | Yes, server-confirmed | Up to 100 | Up to 10 IPv4, without `domains` | No          |
| Local, Firecracker | No                    | No        | No                               | No          |

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
- Docker and Podman enforce `deny-all` only; `networks` other than `none` conflict with it. For allowlists, use Vercel or a firewall you manage.
- Local execution and [Firecracker](../firecracker/) reject `egress`; Firecracker networking is configured on your host.
- A cloud service can still reject a policy when Outpost acquires the sandbox.
- Allowed destinations can still receive data from the agent.
- Network rules do not restrict mounts, credentials or host sockets you expose to the sandbox. See [Security](../security/).

API: [EgressPolicy](../../reference/egresspolicy/) · [ContainerOptions](../../reference/containeroptions/) · [VercelOptions](../../reference/verceloptions/) · [DaytonaOptions](../../reference/daytonaoptions/).
