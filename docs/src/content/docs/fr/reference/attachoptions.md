---
title: "AttachOptions"
description: "AttachOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AttachOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                                                                                                                                    | Présence  | Rôle                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| `ask`          | `VariableQuestion \| undefined`                                                                                                                         | Optionnel | Callback fournissant les variables manquantes du brief lors de l’attachement interactif.                       |
| `agent`        | `AgentAdapter \| undefined`                                                                                                                             | Optionnel | Adapter natif de l’agent de code.                                                                              |
| `brief`        | `Brief \| undefined`                                                                                                                                    | Optionnel | Entrée de tâche textuelle littérale ou provenant d’un fichier.                                                 |
| `continuation` | `{ readonly id: string; readonly fork?: boolean; } \| undefined`                                                                                        | Optionnel | Identifiant de conversation native à poursuivre ; fork demande une conversation distincte dérivée de celle-ci. |
| `signal`       | `AbortSignal \| undefined`                                                                                                                              | Optionnel | Annulation coopérative de cette opération.                                                                     |
| `terminal`     | `{ readonly input?: import("stream").Readable; readonly output?: import("stream").Writable; readonly error?: import("stream").Writable; } \| undefined` | Optionnel | Flux d’entrée, de sortie et d’erreur pour l’attachement à un terminal interactif réel.                         |

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
