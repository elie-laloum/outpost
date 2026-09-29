---
title: "SessionBundleRelocation"
description: "SessionBundleRelocation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SessionBundleRelocation } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                   | Presence | Meaning                                               |
| --------- | ---------------------- | -------- | ----------------------------------------------------- |
| `id`      | `string`               | Required | Identifier of the restored conversation.              |
| `cwd`     | `string`               | Required | Sandbox workspace the restored session must point to. |
| `target`  | `string`               | Required | Sandbox directory the session is restored into.       |
| `helpers` | `SessionBundleHelpers` | Required | Sandbox-side path and hashing helpers.                |

## Signature

```ts
export interface SessionBundleRelocation {
  readonly id: string;
  /** Sandbox workspace the restored session must point to. */
  readonly cwd: string;
  /** Sandbox directory the session is restored into. */
  readonly target: string;
  readonly helpers: SessionBundleHelpers;
}
```

## Related contracts

- [SessionBundleHelpers](../sessionbundlehelpers/)
