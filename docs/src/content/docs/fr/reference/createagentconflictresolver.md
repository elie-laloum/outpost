---
title: "createAgentConflictResolver"
description: "createAgentConflictResolver — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createAgentConflictResolver } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée une stratégie explicite qui prépare une fusion dans le workspace de résolution fourni, lance un seul dispatch d’agent puis exécute la vérification obligatoire dans la même sandbox. Exige un sandboxProvider et une commande de vérification non interactive, renvoie le commit vérifié, l’usage et la sortie du contrôle, et ferme sa sandbox quel que soit le résultat. Refuse les entrées non fusionnées, l’ascendance manquante, les changements non ignorés non commités et les commits modifiés par la vérification. Aucun modèle ni sandbox ne s’exécute à la construction.

[Exemple complet et règles détaillées](../../guide/workspaces/).

## Paramètres et propriétés

| Nom                       | Type                                               | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------- | -------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent`                   | `DispatchAgent`                                    | Requis    | Agent utilisé pour un dispatch de résolution de la fusion en cours ; CLI, harness intégré et agents de repli explicites utilisent leurs protocoles et authentification habituels.                                                                                                                                                                             |
| `options`                 | `AgentConflictResolverOptions`                     | Requis    | Provider d’exécution explicite, commande de vérification obligatoire et consignes, callback d’observation et journal optionnels du dispatch de résolution.                                                                                                                                                                                                    |
| `options.sandboxProvider` | `SandboxProvider`                                  | Requis    | Provider explicite allouant la sandbox de résolution. Indépendant de l’agent et du provider de la tâche initiale ; aucun repli implicite vers l’hôte.                                                                                                                                                                                                         |
| `options.verify`          | `Command`                                          | Requis    | Commande obligatoire non interactive exécutée après le commit de résolution combinée par l’agent, à la racine de la sandbox de résolution. Refuse les réglages directory, terminal et entrée en direct. Un statut non nul échoue avec le code process ; deadlineMs vaut 300000 par défaut et l’annulation de l’appelant est combinée au signal d’intégration. |
| `options.instructions`    | `string \| undefined`                              | Optionnel | Consignes littérales supplémentaires ajoutées au brief de résolution intégré. Elles guident l’agent ; vérification, ascendance et garde-fous de diff sont imposés indépendamment.                                                                                                                                                                             |
| `options.observe`         | `((event: AgentObservation) => void) \| undefined` | Optionnel | Callback historique d’observation de l’agent pour le dispatch de résolution. Ses échecs sont isolés par le mécanisme normal d’observation du dispatch.                                                                                                                                                                                                        |
| `options.logging`         | `Logging \| undefined`                             | Optionnel | Configuration du journal du dispatch dans la sandbox de résolution ; son omission utilise le journal local habituel, false le désactive.                                                                                                                                                                                                                      |

## Retour

`ConflictResolver`

## Signature

```ts
export declare function createAgentConflictResolver(
  agent: DispatchAgent,
  options: AgentConflictResolverOptions,
): ConflictResolver;
```

## Contrats associés

- [AgentConflictResolverOptions](../agentconflictresolveroptions/)
- [ConflictResolver](../conflictresolver/)
- [DispatchAgent](../dispatchagent/)
