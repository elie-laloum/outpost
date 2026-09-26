---
title: "HarnessHookInput"
description: "HarnessHookInput — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Conversations persistées, jeux d’outils fournis et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessHookInput } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type           | Présence | Rôle                                                                                       |
| --------- | -------------- | -------- | ------------------------------------------------------------------------------------------ |
| `sandbox` | `SandboxLease` | Requis   | Sandbox emprunté de la passe ; les hooks peuvent inspecter le dépôt par son intermédiaire. |
| `signal`  | `AbortSignal`  | Requis   | Signal d’annulation de la passe ; les hooks asynchrones doivent le respecter.              |
| `model`   | `AgentModel`   | Requis   | Modèle normalisé de l’agent qui exécute la passe.                                          |
| `step`    | `number`       | Requis   | Numéro de l’étape en cours ; 0 pendant session-start.                                      |

## Signature

```ts
export type HarnessHookInput<Phase extends HarnessHookPhase> =
  HarnessHookEvents[Phase] & HarnessHookContext;
```

## Contrats associés

- [HarnessHookContext](../harnesshookcontext/)
- [HarnessHookEvents](../harnesshookevents/)
- [HarnessHookPhase](../harnesshookphase/)
