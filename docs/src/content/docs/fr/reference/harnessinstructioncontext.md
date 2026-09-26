---
title: "HarnessInstructionContext"
description: "HarnessInstructionContext — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le streaming n’est pas encore disponible ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessInstructionContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type           | Présence | Rôle                                                                                                   |
| --------- | -------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `sandbox` | `SandboxLease` | Requis   | Sandbox emprunté de la passe, par exemple pour lire les consignes du projet avant la première requête. |
| `signal`  | `AbortSignal`  | Requis   | Signal d’annulation de la passe ; respectez-le dans les résolveurs asynchrones.                        |
| `model`   | `AgentModel`   | Requis   | Modèle normalisé de l’agent qui exécute la passe.                                                      |

## Signature

```ts
export interface HarnessInstructionContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  readonly model: AgentModel;
}
```

## Contrats associés

- [AgentModel](../agentmodel/)
- [SandboxLease](../sandboxlease/)
