---
title: "checkSpeculationIntegration"
description: "checkSpeculationIntegration — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { checkSpeculationIntegration } from "@elie-laloum/outpost";
```

## Purpose and behavior

Resolve a candidate ref and use Git merge-tree to check it against the current host commit without modifying the index or worktree. Return conflict paths or a blocking reason, and pin both inspected commits. Rerun immediately before an explicit integration if either ref or host files change.

[Complete example and detailed rules](../../guide/speculation/).

## Parameters and properties

| Name             | Type                  | Presence | Meaning                                                                                         |
| ---------------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `repository`     | `string`              | Required | Host Git checkout to inspect without changing its index or working files.                       |
| `branch`         | `string`              | Required | Candidate ref to resolve to a commit and test against the current host HEAD.                    |
| `expectedCommit` | `string \| undefined` | Optional | Optional validated candidate commit; block the preflight if the ref has moved since validation. |

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
