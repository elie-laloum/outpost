---
title: "WorkspacePathRecoveryOptions"
description: "WorkspacePathRecoveryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspacePathRecoveryOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type   | Présence | Rôle                                                                                                                        |
| ------------------ | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `processesStopped` | `true` | Requis   | Attestation explicite d’arrêt du précédent propriétaire et de ses processus ; jamais déduite d’une expiration de heartbeat. |

## Signature

```ts
export interface WorkspacePathRecoveryOptions {
  readonly processesStopped: true;
}
```
