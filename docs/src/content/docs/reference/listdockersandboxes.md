---
title: "listDockerSandboxes"
description: "listDockerSandboxes — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { listDockerSandboxes } from "@elie-laloum/outpost/providers/docker";
```

## Purpose and behavior

List the Docker sandboxes created by Outpost that carry every label of the query, whatever the repositoryMode of the provider that created them. A sandbox whose egress companion remains after its container is gone is still reported under the sandbox name, so it can be removed. Containers not named outpost-&lt;uuid> are never reported. The result is a snapshot sorted by name; it does not tell whether a sandbox is still in use. Failed docker commands reject with code process.

[Complete example and detailed rules](../../guide/containers/).

## Parameters and properties

| Name    | Type                    | Presence | Meaning                                                                                                             |
| ------- | ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `query` | `ContainerSandboxQuery` | Required | Labels every reported sandbox must carry, with the cancellation signal and deadline applied to each docker command. |

## Returns

`Promise<ContainerSandbox[]>`

## Signature

```ts
export declare const listDockerSandboxes: (
  query: ContainerSandboxQuery,
) => Promise<ContainerSandbox[]>;
```

## Related contracts

- [ContainerSandbox](../containersandbox/)
- [ContainerSandboxQuery](../containersandboxquery/)
