---
title: "RecipeConfiguration"
description: "RecipeConfiguration — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeConfiguration } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                   | Presence | Meaning                                                                                                                                                                                                                                                         |
| --------- | ------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox` | `SandboxOptions`                                       | Required | Sandbox creation options reused by the recipe CLI. Required inputs and agent names are checked before allocation; the CLI supplies cancellation, owns the created sandbox, integrates successful work according to its branch policy and preserves failed work. |
| `agents`  | `Readonly<Record<string, DispatchAgent>> \| undefined` | Optional | Locally composed agents keyed by the roles referenced in recipe tasks. The CLI rejects missing roles before opening a sandbox. Keep models, credentials and provider-specific choices in this trusted local configuration.                                      |

## Signature

```ts
export interface RecipeConfiguration {
  readonly sandbox: SandboxOptions;
  readonly agents?: Readonly<Record<string, DispatchAgent>>;
}
```

## Related contracts

- [DispatchAgent](../dispatchagent/)
- [SandboxOptions](../sandboxoptions/)
