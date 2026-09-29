---
title: "HarnessToolContext"
description: "HarnessToolContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessToolContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                | Présence | Rôle                                                                                                                                                                          |
| --------- | ----------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox` | `SandboxLease`                      | Requis   | Sandbox empruntée pour les commandes et les transferts. Les opérations suivent le délai de l’appel et l’annulation du tour ; release() est rejeté avec le code configuration. |
| `signal`  | `AbortSignal`                       | Requis   | Annulé à l’expiration du délai de l’appel ou à l’annulation du tour. Du JavaScript qui l’ignore continue de s’exécuter, détaché.                                              |
| `callId`  | `string`                            | Requis   | Identifiant de l’appel d’outil du modèle en cours d’exécution.                                                                                                                |
| `model`   | `AgentModel`                        | Requis   | Modèle normalisé de l’agent qui exécute l’outil.                                                                                                                              |
| `observe` | `(event: HarnessToolEvent) => void` | Requis   | Transmet un événement text, warning ou raw aux observateurs du dispatch ; tout autre type lève le code configuration.                                                         |

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
