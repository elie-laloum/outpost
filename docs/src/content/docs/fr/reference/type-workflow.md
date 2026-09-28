---
title: "Workflow"
description: "Workflow — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Workflow } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                     | Présence | Rôle                                                                                                                                                          |
| --------- | -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                                 | Requis   | Nom de la définition de workflow, inclus dans ses rapports d’exécution.                                                                                       |
| `tasks`   | `readonly Task<unknown>[]`                               | Requis   | Définitions de tâches composant le graphe, comprenant toutes les dépendances déclarées.                                                                       |
| `start`   | `(options?: WorkflowOptions) => Promise<WorkflowResult>` | Requis   | Exécute le graphe validé avec concurrence, annulation et délai coopératifs, budgets et checkpoints. Chaque appel reçoit un nouveau délai timeoutMs optionnel. |
| `diagram` | `() => string`                                           | Requis   | Renvoie un diagramme Mermaid des clés de tâches et dépendances sans exécuter les tâches.                                                                      |

## Signature

```ts
export interface Workflow {
  readonly name: string;
  readonly tasks: readonly Task[];
  start(options?: WorkflowOptions): Promise<WorkflowResult>;
  diagram(): string;
}
```

## Contrats associés

- [Task](../type-task/)
- [WorkflowOptions](../workflowoptions/)
- [WorkflowResult](../workflowresult/)
