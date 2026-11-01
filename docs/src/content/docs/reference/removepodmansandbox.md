---
title: "removePodmanSandbox"
description: "removePodmanSandbox — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { removePodmanSandbox } from "@elie-laloum/outpost/providers/podman";
```

## Purpose and behavior

Remove a Podman sandbox and its egress companion by name, whatever the repositoryMode of the provider that created it. Containers already gone are ignored, so repeating the call succeeds. A name other than outpost-&lt;uuid> is refused with code configuration before any podman command. The container is removed even while a lease still uses it; that lease's later commands fail and its release remains safe.

[Complete example and detailed rules](../../guide/containers/).

## Parameters and properties

| Name                 | Type                                     | Presence | Meaning                                                                                          |
| -------------------- | ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `name`               | `string`                                 | Required | Sandbox name, as reported by listPodmanSandboxes or received by SandboxContext.registerRecovery. |
| `options`            | `ContainerInventoryOptions \| undefined` | Optional | Cancellation signal and deadline applied to each podman command of the removal.                  |
| `options.signal`     | `AbortSignal \| undefined`               | Optional | Cooperative cancellation; aborting stops the running engine command and rejects the operation.   |
| `options.deadlineMs` | `number \| undefined`                    | Optional | Maximum duration in milliseconds of each engine command, default 10000.                          |

## Returns

`Promise<void>`

## Signature

```ts
export declare const removePodmanSandbox: (
  name: string,
  options?: ContainerInventoryOptions,
) => Promise<void>;
```

## Related contracts

- [ContainerInventoryOptions](../containerinventoryoptions/)
