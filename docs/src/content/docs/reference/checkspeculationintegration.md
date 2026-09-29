---
title: "checkSpeculationIntegration"
description: "checkSpeculationIntegration — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Speculation is experimental: its options and result can still change. See [Competing candidates](../../guide/speculation/).
:::

## Import

```ts
import { checkSpeculationIntegration } from "@elie-laloum/outpost";
```

## Purpose and behavior

Test with git merge-tree whether a candidate branch merges into the host checkout's HEAD, without changing its files or index. Returns clean or conflict with the exact commits tested, or blocked when the checkout is dirty or detached, the branch moved or Git fails. It never merges.

[Complete example and detailed rules](../../guide/speculation/).

## Parameters and properties

| Name             | Type                  | Presence | Meaning                                                                                                     |
| ---------------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `repository`     | `string`              | Required | Host Git checkout to test; it must be clean and on a branch.                                                |
| `branch`         | `string`              | Required | Candidate branch or ref, resolved to a commit and tested against the checkout's HEAD.                       |
| `expectedCommit` | `string \| undefined` | Optional | Commit validated earlier, usually winner.commit; the check is blocked if the branch no longer points to it. |

## Returns

`Promise<SpeculationIntegration>`

## Signature

```ts
export declare function checkSpeculationIntegration(
  repository: string,
  branch: string,
  expectedCommit?: string,
): Promise<SpeculationIntegration>;
```

## Related contracts

- [SpeculationIntegration](../speculationintegration/)
