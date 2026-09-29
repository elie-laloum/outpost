---
title: "HarnessHookInput"
description: "HarnessHookInput — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { HarnessHookInput } from "@elie-laloum/outpost";
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
export type HarnessHookInput<Phase extends HarnessHookPhase> =
  HarnessHookEvents[Phase] & HarnessHookContext;
```

## Contrats associés

- [HarnessHookContext](../harnesshookcontext/)
- [HarnessHookEvents](../harnesshookevents/)
- [HarnessHookPhase](../harnesshookphase/)
