---
title: "AgentAuthentication"
description: "AgentAuthentication — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AgentAuthentication } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name      | Type                | Presence          | Meaning                                                                                                                                             |
| --------- | ------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `account` | `AccountCredential` | Variant-dependent | Subscription or plan credentials: a file or profile directory on the host (file), a literal token (key) or a variable holding the token (variable). |
| `usage`   | `UsageCredential`   | Variant-dependent | API-billed credentials: a literal key (key) or the variable holding it (variable), mapped to the CLI's standard API-key variable.                   |

## Signature

```ts
export type AgentAuthentication =
  | "account"
  | "usage"
  | {
      readonly account: AccountCredential;
    }
  | {
      readonly usage: UsageCredential;
    };
```

## Related contracts

- [AccountCredential](../accountcredential/)
- [UsageCredential](../usagecredential/)
