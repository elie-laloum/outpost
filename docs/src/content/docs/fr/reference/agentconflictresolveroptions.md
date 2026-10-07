---
title: "AgentConflictResolverOptions"
description: "AgentConflictResolverOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentConflictResolverOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                                               | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                          |
| ----------------- | -------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandboxProvider` | `SandboxProvider`                                  | Requis    | Provider explicite allouant la sandbox de résolution. Indépendant de l’agent et du provider de la tâche initiale ; aucun repli implicite vers l’hôte.                                                                                                                                                                                                         |
| `verify`          | `Command`                                          | Requis    | Commande obligatoire non interactive exécutée après le commit de résolution combinée par l’agent, à la racine de la sandbox de résolution. Refuse les réglages directory, terminal et entrée en direct. Un statut non nul échoue avec le code process ; deadlineMs vaut 300000 par défaut et l’annulation de l’appelant est combinée au signal d’intégration. |
| `instructions`    | `string \| undefined`                              | Optionnel | Consignes littérales supplémentaires ajoutées au brief de résolution intégré. Elles guident l’agent ; vérification, ascendance et garde-fous de diff sont imposés indépendamment.                                                                                                                                                                             |
| `observe`         | `((event: AgentObservation) => void) \| undefined` | Optionnel | Callback historique d’observation de l’agent pour le dispatch de résolution. Ses échecs sont isolés par le mécanisme normal d’observation du dispatch.                                                                                                                                                                                                        |
| `logging`         | `Logging \| undefined`                             | Optionnel | Configuration du journal du dispatch dans la sandbox de résolution ; son omission utilise le journal local habituel, false le désactive.                                                                                                                                                                                                                      |

## Signature

```ts
export interface AgentConflictResolverOptions {
  readonly sandboxProvider: SandboxProvider;
  readonly verify: Command;
  readonly instructions?: string;
  readonly observe?: (event: AgentObservation) => void;
  readonly logging?: Logging;
}
```

## Contrats associés

- [AgentObservation](../agentobservation/)
- [Command](../command/)
- [Logging](../logging/)
- [SandboxProvider](../sandboxprovider/)
