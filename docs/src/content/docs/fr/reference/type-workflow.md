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

| Nom       | Type                                                     | Présence | Rôle                                                                                                                                                                                                                                                                       |
| --------- | -------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                                 | Requis   | Nom de la définition de workflow, inclus dans ses rapports d’exécution.                                                                                                                                                                                                    |
| `tasks`   | `readonly Task<unknown>[]`                               | Requis   | Définitions de tâches composant le graphe, comprenant toutes les dépendances déclarées.                                                                                                                                                                                    |
| `start`   | `(options?: WorkflowOptions) => Promise<WorkflowResult>` | Requis   | Exécute le graphe et se résout avec un WorkflowResult dès qu’aucune tâche ne peut plus s’exécuter, même si des tâches ont échoué. Rejette sur des options invalides, une réponse ou une décision périmée ou invalide, ou un checkpoint impossible à lire ou à enregistrer. |
| `diagram` | `() => string`                                           | Requis   | Renvoie un diagramme Mermaid des clés de tâches et dépendances sans exécuter les tâches.                                                                                                                                                                                   |

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
