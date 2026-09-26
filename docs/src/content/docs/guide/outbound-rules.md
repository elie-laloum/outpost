---
title: "Outbound rules"
description: "Request explicit provider-supported network restrictions."
---

:::note[Experimental]
Egress policies are opt-in and depend on provider capabilities.
:::

Use `egress` to request a network restriction. Unsupported restrictions fail explicitly.

```ts
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = dockerSandboxProvider({
  image: "outpost:dev",
  egress: { mode: "deny-all" },
});
```

## Offline execution

`deny-all` prevents outbound access on supporting container providers. Prepare dependencies and tools in the image before using it. A cloud model API cannot be reached from a network-disabled CLI agent; use this policy for offline commands or an architecture whose model access occurs outside that sandbox.

## Allowlisting

The policy contract also describes domains and CIDR rules for providers supporting allowlists. Do not assume Docker networks implement those rules or that every provider accepts the same policy. Consult the provider’s exact contract and live-validation status.

A network policy is separate from filesystem mounts and credentials. Restricting one does not automatically restrict the others.

API: [EgressPolicy](../../reference/egresspolicy/).
