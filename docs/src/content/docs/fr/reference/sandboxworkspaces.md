---
title: "SandboxWorkspaces"
description: "SandboxWorkspaces — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxWorkspaces } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                                                      | Présence | Rôle                                                                                                                    |
| ---------- | ------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `bindings` | `readonly ("copy" \| "ephemeral" \| "mount-readonly" \| "mount-write")[]` | Requis   | Liaisons de copie, éphémère, montage en lecture seule et montage inscriptible explicitement prises en charge.           |
| `acquire`  | `(context: FileSandboxContext) => Promise<SandboxLease>`                  | Requis   | Acquiert depuis un contexte de fichiers sans recherche de dépôt ; les liaisons incompatibles échouent avant allocation. |

## Signature

```ts
export interface SandboxWorkspaces {
  readonly bindings: readonly (
    "copy" | "ephemeral" | "mount-readonly" | "mount-write"
  )[];
  acquire(context: FileSandboxContext): Promise<SandboxLease>;
}
```

## Contrats associés

- [FileSandboxContext](../filesandboxcontext/)
- [SandboxLease](../sandboxlease/)
