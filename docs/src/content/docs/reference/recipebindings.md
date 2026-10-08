---
title: "RecipeBindings"
description: "RecipeBindings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeBindings } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                   | Presence | Meaning                                                                                                                                                                                                                           |
| --------- | ------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox` | `Sandbox`                                              | Required | Caller-owned open sandbox shared by all command and agent steps. Keep it open until Workflow.start() settles, then close it; recipe concurrency must be 1.                                                                        |
| `agents`  | `Readonly<Record<string, DispatchAgent>> \| undefined` | Optional | Composed Outpost agents keyed by the exact names used in YAML agent fields. Missing names are rejected at declaration; command-only recipes may omit this registry. Authentication and model choices stay in the composed agents. |
| `inputs`  | `Readonly<Record<string, WorkflowJson>> \| undefined`  | Optional | Declared recipe input values; format 3 also accepts lossless JSON objects, arrays and null. Inputs are validated before tasks run.                                                                                                |

## Signature

```ts
export interface RecipeBindings {
  readonly sandbox: Sandbox;
  readonly agents?: Readonly<Record<string, DispatchAgent>>;
  readonly inputs?: Readonly<Record<string, WorkflowJson>>;
}
```

## Related contracts

- [DispatchAgent](../dispatchagent/)
- [Sandbox](../sandbox/)
- [WorkflowJson](../workflowjson/)
