---
title: "ConfigurationFile"
description: "ConfigurationFile — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ConfigurationFile } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                | Presence | Meaning                                                                                                                                                       |
| --------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`    | `string`                            | Required | Path relative to the agent home, without . or .. segments.                                                                                                    |
| `section` | `string`                            | Required | Top-level object key that receives the entries, such as mcpServers. Other keys of the file are preserved.                                                     |
| `entries` | `Readonly<Record<string, unknown>>` | Required | Entries added to the section or replacing existing entries with the same name. An unreadable file or a non-object section fails instead of being overwritten. |

## Signature

```ts
export interface ConfigurationFile {
  readonly path: string;
  readonly section: string;
  readonly entries: Readonly<Record<string, unknown>>;
}
```
