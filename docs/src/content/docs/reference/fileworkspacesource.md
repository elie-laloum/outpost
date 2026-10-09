---
title: "FileWorkspaceSource"
description: "FileWorkspaceSource — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { FileWorkspaceSource } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name        | Type                                                                                                             | Presence          | Meaning                                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------- |
| `kind`      | `"directory" \| "ephemeral"`                                                                                     | Required          | Discriminant selecting Git, a directory source or an initially empty workspace.                       |
| `directory` | `string`                                                                                                         | Variant-dependent | Absolute local materialization or source directory; it is not a portable resource identity.           |
| `access`    | `{ readonly mode: "copy"; } \| { readonly mode: "mount"; readonly target: string; readonly readOnly: boolean; }` | Variant-dependent | Copy isolates source changes; mount exposes the full source at target with an explicit readOnly flag. |

## Signature

```ts
export type FileWorkspaceSource =
  | {
      readonly kind: "directory";
      readonly directory: string;
      readonly access:
        | {
            readonly mode: "copy";
          }
        | {
            readonly mode: "mount";
            readonly target: string;
            readonly readOnly: boolean;
          };
    }
  | {
      readonly kind: "ephemeral";
    };
```
