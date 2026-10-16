---
title: "AgentHookContext"
description: "AgentHookContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentHookContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type           | Présence | Rôle                                                                                                             |
| --------- | -------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `sandbox` | `SandboxLease` | Requis   | Sandbox d’exécution emprunté. Les opérations héritent du délai du callback ; la libération du lease est refusée. |
| `signal`  | `AbortSignal`  | Requis   | Signal d’annulation du callback, annulé à sa fin ou à expiration du délai.                                       |

## Signature

```ts
export interface AgentHookContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
}
```

## Contrats associés

- [SandboxLease](../sandboxlease/)
