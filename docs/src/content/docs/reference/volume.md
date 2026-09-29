---
title: "Volume"
description: "Volume — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Volume } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                   | Presence | Meaning                                                                                                                                                    |
| ---------- | ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`   | `string`               | Required | Host path to mount; ~ expands to your home and a relative path resolves from the repository. A missing path fails acquisition with code provider.          |
| `target`   | `string`               | Required | Path inside the container: absolute, relative to the workspace root, or under the agent home with ~/. A single file must be mounted inside the agent home. |
| `readOnly` | `boolean \| undefined` | Optional | Mount the volume without write access from the sandbox.                                                                                                    |

## Signature

```ts
export interface Volume {
  readonly source: string;
  readonly target: string;
  readonly readOnly?: boolean;
}
```
