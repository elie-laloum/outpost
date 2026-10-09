---
title: "FileRecipeConfiguration"
description: "FileRecipeConfiguration — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileRecipeConfiguration } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                   | Presence | Meaning                                                                                                                                                                                                                    |
| --------- | ------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox` | `FileSandboxOptions`                                   | Required | Sandbox bound to this workspace; closing it leaves a borrowed workspace open.                                                                                                                                              |
| `agents`  | `Readonly<Record<string, DispatchAgent>> \| undefined` | Optional | Locally composed agents keyed by the roles referenced in recipe tasks. The CLI rejects missing roles before opening a sandbox. Keep models, credentials and provider-specific choices in this trusted local configuration. |

## Signature

```ts
export interface FileRecipeConfiguration extends Omit<
  RecipeConfiguration,
  "sandbox"
> {
  readonly sandbox: FileSandboxOptions;
}
```

## Related contracts

- [RecipeConfiguration](../recipeconfiguration/)
