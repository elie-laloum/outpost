---
title: "RecipeResumeOptions"
description: "RecipeResumeOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeResumeOptions } from "@elie-laloum/outpost/recipes";
```

## Paramètres et propriétés

| Nom               | Type                                                  | Présence  | Rôle                                                                                                                                                                                   |
| ----------------- | ----------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `runId`           | `string`                                              | Requis    | Run ID du checkpoint existant ; une exécution absente est refusée sans allouer de workspace.                                                                                           |
| `retryIncomplete` | `boolean \| undefined`                                | Optionnel | Autorise explicitement l’ordonnanceur natif à rejouer les tâches incomplètes ; les tâches terminées et la consommation cumulée restent persistées.                                     |
| `answers`         | `readonly WorkflowAnswer[] \| undefined`              | Optionnel | Réponses natives aux demandes de dialogue en attente, avec exécution, tâche, demande et acteur autorisé.                                                                               |
| `decisions`       | `readonly WorkflowDecision[] \| undefined`            | Optionnel | Décisions natives de gates avec métadonnées d’acteur de confiance et preuve de signature exigée ; vérifiées par le moteur de workflow.                                                 |
| `recoverRevision` | `string \| undefined`                                 | Optionnel | Récupère explicitement la propriété du checkpoint à cette révision exacte après arrêt du coordinateur précédent ; ne récupère pas les verrous de workspace et n’autorise pas le rejeu. |
| `inputs`          | `Readonly<Record<string, WorkflowJson>> \| undefined` | Optionnel | Paramètres d’origine facultatifs ; leur absence recharge le checkpoint et toute modification refuse la reprise.                                                                        |
| `signal`          | `AbortSignal \| undefined`                            | Optionnel | Annule cette invocation en attendant le nettoyage des ressources possédées.                                                                                                            |
| `report`          | `"json" \| undefined`                                 | Optionnel | Remplace explicitement les rapports finaux configurés par un rapport JSON sur stdout ; n’active pas l’observation.                                                                     |

## Signature

```ts
export interface RecipeResumeOptions extends RecipeRunOptions {
  readonly runId: string;
  readonly retryIncomplete?: boolean;
  readonly answers?: readonly WorkflowAnswer[];
  readonly decisions?: readonly WorkflowDecision[];
  readonly recoverRevision?: string;
}
```

## Contrats associés

- [RecipeRunOptions](../reciperunoptions/)
- [WorkflowAnswer](../workflowanswer/)
- [WorkflowDecision](../workflowdecision/)
