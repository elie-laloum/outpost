---
title: "ExecutionInspectionSettings"
description: "ExecutionInspectionSettings — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ExecutionInspectionSettings } from "@elie-laloum/outpost/core";
```

## Paramètres et propriétés

| Nom            | Type                                                             | Présence  | Rôle                                                                                                                                                                                                                                                                                                                      |
| -------------- | ---------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `steering`     | `Steering \| undefined`                                          | Optionnel | Contrôleur issu de createSteering(), attaché pendant tout le dispatch et libéré à sa fin. resume() et fork() ne le réutilisent pas.                                                                                                                                                                                       |
| `agent`        | `DispatchAgent \| undefined`                                     | Optionnel | Agent qui exécute le brief : issu de createAgent() ou createReplayAgent(), ou un createFallbackAgent() qui passe au candidat suivant sur une faute quota ou unavailable listée. Un agent de secours n’accepte pas continuation.                                                                                           |
| `response`     | `ResponseSpec<unknown> \| undefined`                             | Optionnel | Contrat de réponse typée : ajoute les consignes de format final et le schéma d’entrée JSON après le brief rendu et les messages de steering incorporés au début du tour. Analyse et valide la réponse balisée, avec jusqu’à repairs tours de correction. Exige une seule passe ; l’injection ne peut pas être désactivée. |
| `continuation` | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optionnel | Conversation native à continuer, par identifiant ; fork: true continue une copie et laisse l’originale intacte. Exige une seule passe et un agent qui sait reprendre.                                                                                                                                                     |

## Signature

```ts
export type ExecutionInspectionSettings = Pick<
  DispatchOptions<unknown>,
  "agent" | "continuation" | "response" | "steering"
>;
```

## Contrats associés

- [DispatchOptions](../dispatchoptions/)
