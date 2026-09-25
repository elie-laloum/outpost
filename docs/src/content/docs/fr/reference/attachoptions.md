---
title: "AttachOptions"
description: "AttachOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **AttachOptions**. Consultez le [guide commandes et terminal](../../guide/environment/commands/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { AttachOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Exécuter un processus ou attacher une session interactive native avec possession explicite des flux.

Command renvoie les statuts non nuls ; l’appelant doit les vérifier. Attach exige un provider interactif compatible. Vercel rejette l’attachement.

[Exemple complet et règles détaillées](../../guide/environment/commands/).

## Paramètres et propriétés

| Nom            | Type                                                                                                 | Présence  | Rôle                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `ask`          | `VariableQuestion \| undefined`                                                                      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `agent`        | `AgentAdapter \| undefined`                                                                          | Optionnel | Adapter natif de l’agent de code.                                                |
| `brief`        | `Brief \| undefined`                                                                                 | Optionnel | Entrée de tâche textuelle littérale ou provenant d’un fichier.                   |
| `continuation` | `{ readonly id: string; readonly fork?: boolean; } \| undefined`                                     | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `signal`       | `AbortSignal \| undefined`                                                                           | Optionnel | Annulation coopérative de cette opération.                                       |
| `terminal`     | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface AttachOptions {
  readonly ask?: VariableQuestion;
  readonly agent?: AgentAdapter;
  readonly brief?: Brief;
  readonly continuation?: {
    readonly id: string;
    readonly fork?: boolean;
  };
  readonly signal?: AbortSignal;
  readonly terminal?: Command["terminal"];
}
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [Brief](../brief/)
- [Command](../command/)
- [VariableQuestion](../variablequestion/)
