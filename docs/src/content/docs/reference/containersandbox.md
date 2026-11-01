---
title: "ContainerSandbox"
description: "ContainerSandbox — Outpost API"
sidebar:
  order: 20
---

## Import

Choose one of these equivalent imports.

```ts
import type { ContainerSandbox } from "@elie-laloum/outpost/providers/docker";
```

```ts
import type { ContainerSandbox } from "@elie-laloum/outpost/providers/podman";
```

## Parameters and properties

| Name     | Type                               | Presence | Meaning                                                                                                                                                                                                     |
| -------- | ---------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`   | `string`                           | Required | Sandbox container name, outpost-&lt;uuid>, to pass to removeDockerSandbox or removePodmanSandbox. It is also reported when only the egress companion remains.                                               |
| `labels` | `Readonly<Record<string, string>>` | Required | Labels the engine reports for the sandbox container, including labels inherited from its image. When only the egress companion remains, the companion's labels, which also include io.outpost.egress.owner. |

## Signature

```ts
export interface ContainerSandbox {
  readonly name: string;
  readonly labels: ContainerLabels;
}
```

## Related contracts

- [ContainerLabels](../containerlabels/)
