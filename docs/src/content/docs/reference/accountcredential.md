---
title: "AccountCredential"
description: "AccountCredential — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AccountCredential } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name       | Type     | Presence          | Meaning                                                                                                                                                                                                                               |
| ---------- | -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file`     | `string` | Variant-dependent | Host path of a session file, or of a Kimi Code profile directory, read instead of the CLI's default location. ~ expands to the host home; relative paths resolve from the current directory. Only regular files up to 1 MiB are read. |
| `key`      | `string` | Variant-dependent | Literal subscription token forwarded in the CLI's token variable (Claude CLAUDE_CODE_OAUTH_TOKEN, Copilot COPILOT_GITHUB_TOKEN). Prefer variable to keep secrets out of source files.                                                 |
| `variable` | `string` | Variant-dependent | Name of a resolved workflow variable holding the subscription token; its value is forwarded in the CLI's token variable.                                                                                                              |

## Signature

```ts
export type AccountCredential =
  | {
      readonly file: string;
    }
  | {
      readonly key: string;
    }
  | {
      readonly variable: string;
    };
```
