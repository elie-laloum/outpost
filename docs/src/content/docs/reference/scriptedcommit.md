---
title: "ScriptedCommit"
description: "ScriptedCommit — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ScriptedCommit } from "@elie-laloum/outpost/testing";
```

## Parameters and properties

| Name      | Type                                       | Presence | Meaning                                                                                                                                                                                                                   |
| --------- | ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `message` | `string`                                   | Required | Nonempty commit message. Test commits use Outpost Test identity, with signing and host hooks disabled.                                                                                                                    |
| `files`   | `Readonly<Record<string, string \| null>>` | Required | Nonempty map of repository-relative paths to UTF-8 contents; null deletes an existing file. Traversal, .git, .outpost and symlinks are refused. Only these paths enter the commit; separately staged work remains staged. |

## Signature

```ts
export interface ScriptedCommit {
  readonly message: string;
  readonly files: Readonly<Record<string, string | null>>;
}
```
