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

| Name      | Type                                                                 | Presence | Meaning                                                                                                                                                                                                                                                                    |
| --------- | -------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox` | `Sandbox`                                                            | Required | Caller-owned open sandbox shared by all command and agent steps. Keep it open until Workflow.start() settles, then close it; recipe concurrency must be 1.                                                                                                                 |
| `agents`  | `Readonly<Record<string, DispatchAgent>> \| undefined`               | Optional | Composed Outpost agents keyed by the exact names used in YAML agent fields. Missing names are rejected at declaration; command-only recipes may omit this registry. Authentication and model choices stay in the composed agents.                                          |
| `inputs`  | `Readonly<Record<string, string \| number \| boolean>> \| undefined` | Optional | Explicit scalar values for version-2 parameters, keyed by their declared names. Defaults apply to omitted inputs; missing required values, unknown names, type mismatches and enum violations fail before execution. Substitution is single-pass and never evaluates code. |

## Signature

```ts
export interface RecipeBindings {
  readonly sandbox: Sandbox;
  readonly agents?: Readonly<Record<string, DispatchAgent>>;
  readonly inputs?: Readonly<Record<string, string | number | boolean>>;
}
```

## Related contracts

- [DispatchAgent](../dispatchagent/)
- [Sandbox](../sandbox/)
