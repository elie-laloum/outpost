---
title: "AzureSecretReference"
description: "AzureSecretReference — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AzureSecretReference } from "@elie-laloum/outpost/secrets/azure";
```

## Parameters and properties

| Name      | Type                  | Presence | Meaning                                                                                                       |
| --------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`              | Required | Key Vault secret name using letters, digits and hyphens; can differ from the environment variable identifier. |
| `version` | `string \| undefined` | Optional | Optional nonempty Key Vault version string; omitted lets the service select its latest version.               |

## Signature

```ts
export interface AzureSecretReference {
  readonly name: string;
  readonly version?: string;
}
```
