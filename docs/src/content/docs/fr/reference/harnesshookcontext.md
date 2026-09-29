---
title: "HarnessHookContext"
description: "HarnessHookContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessHookContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type           | Présence | Rôle                                                                                    |
| --------- | -------------- | -------- | --------------------------------------------------------------------------------------- |
| `sandbox` | `SandboxLease` | Requis   | Sandbox empruntée du tour ; les hooks peuvent inspecter le dépôt par son intermédiaire. |
| `signal`  | `AbortSignal`  | Requis   | Signal d’annulation du tour ; les hooks asynchrones doivent le respecter.               |
| `model`   | `AgentModel`   | Requis   | Modèle normalisé de l’agent qui exécute le tour.                                        |
| `step`    | `number`       | Requis   | Numéro de l’étape en cours ; 0 pendant session-start.                                   |

## Signature

```ts
export interface HarnessHookContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  readonly model: AgentModel;
  readonly step: number;
}
```

## Contrats associés

- [AgentModel](../agentmodel/)
- [SandboxLease](../sandboxlease/)
