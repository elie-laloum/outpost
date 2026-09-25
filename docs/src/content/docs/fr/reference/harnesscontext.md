---
title: "HarnessContext"
description: "HarnessContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                          | Présence | Rôle                                                                                                                                                                            |
| --------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`         | `string`                      | Requis   | Nom du modèle sélectionné sur l’agent composé ; les requêtes héritent de son raisonnement et de sa limite de sortie sauf si elles fixent les leurs.                             |
| `modelProvider` | `ModelProvider`               | Requis   | Wrapper de requêtes lié au modèle de cet agent et à son annulation ; l’usage rapporté est cumulé entre les appels.                                                              |
| `sandbox`       | `SandboxLease`                | Requis   | Capacités empruntées du sandbox pour commandes et transferts. Le harness ne peut pas libérer le lease ; les opérations héritent de l’annulation.                                |
| `signal`        | `AbortSignal`                 | Requis   | Annulation externe et délai d’exécution combinés ; les callbacks doivent respecter ce signal.                                                                                   |
| `observe`       | `(event: AgentEvent) => void` | Requis   | Émet une observation sans laisser les erreurs d’observateur altérer l’exécution. Résultat, usage et fin sont gérés par le runner ; les événements de conversation sont refusés. |

## Signature

```ts
export interface HarnessContext {
  readonly model: string;
  readonly modelProvider: ModelProvider;
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  observe(event: AgentEvent): void;
}
```

## Contrats associés

- [AgentEvent](../agentevent/)
- [ModelProvider](../modelprovider/)
- [SandboxLease](../sandboxlease/)
