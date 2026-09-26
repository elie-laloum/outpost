---
title: "HarnessToolContext"
description: "HarnessToolContext — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Conversations persistées, jeux d’outils fournis et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessToolContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                | Présence | Rôle                                                                                                                                                                |
| --------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox` | `SandboxLease`                      | Requis   | Sandbox emprunté pour les commandes et transferts. Les opérations suivent le délai de l’appel et l’annulation de la passe ; l’outil ne peut pas libérer le sandbox. |
| `signal`  | `AbortSignal`                       | Requis   | Annulé à l’expiration du délai de l’appel ou à l’annulation de la passe. Un JavaScript qui l’ignore continue détaché.                                               |
| `callId`  | `string`                            | Requis   | Identifiant de l’appel d’outil du modèle en cours d’exécution.                                                                                                      |
| `model`   | `AgentModel`                        | Requis   | Modèle normalisé de l’agent qui exécute l’outil.                                                                                                                    |
| `observe` | `(event: HarnessToolEvent) => void` | Requis   | Signale des événements text, warning ou raw aux observateurs du dispatch ; les autres variantes sont refusées.                                                      |

## Signature

```ts
export interface HarnessToolContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  readonly callId: string;
  readonly model: AgentModel;
  observe(event: HarnessToolEvent): void;
}
```

## Contrats associés

- [AgentModel](../agentmodel/)
- [HarnessToolEvent](../harnesstoolevent/)
- [SandboxLease](../sandboxlease/)
