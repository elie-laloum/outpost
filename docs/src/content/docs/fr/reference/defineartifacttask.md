---
title: "defineArtifactTask"
description: "defineArtifactTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineArtifactTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit une tâche de workflow dont la sortie est une ArtifactReference : elle exécute produce(context) et publie la valeur, avec un producteur tiré de l’id d’exécution, de la clé de tâche et de la tentative. Une tentative relancée publie une nouvelle référence. Les dépendants lisent la valeur avec readArtifact().

[Exemple complet et règles détaillées](../../guide/artifacts/).

## Paramètres et propriétés

| Nom                   | Type                                                                    | Présence  | Rôle                                                                                                                                                                                                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `ArtifactTaskOptions<T>`                                                | Requis    | Options de tâche (key, after, retry, cache…) plus store, contract, produce et parents ; la tâche d’artefact fournit perform.                                                                                                                                                                                     |
| `options.retry`       | `Retry \| undefined`                                                    | Optionnel | Politique de relance des tentatives échouées ; sans elle, la tâche s’exécute une fois. Une tentative relancée répète ses effets de bord.                                                                                                                                                                         |
| `options.cache`       | `TaskCacheOptions \| undefined`                                         | Optionnel | Cache de résultat : une entrée trouvée restaure la valeur JSON sans perte enregistrée, sans tentative, usage ni effet de bord. En cas d’absence, un résultat qui n’est pas du JSON sans perte fait échouer la tâche. Refusé sur les gates, les interactions et les tâches qui renvoient un résultat de dispatch. |
| `options.gate`        | `WorkflowGate \| undefined`                                             | Optionnel | Définition persistée d’approbation ou pause ; son exécution exige un checkpoint et une décision de confiance correspondante.                                                                                                                                                                                     |
| `options.key`         | `string`                                                                | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                                                                                                                                                                |
| `options.after`       | `readonly Task<unknown>[] \| undefined`                                 | Optionnel | Tâches qui doivent être done avant que celle-ci démarre, aucune par défaut ; seules celles-ci se lisent avec context.value().                                                                                                                                                                                    |
| `options.interaction` | `TaskInteraction \| undefined`                                          | Optionnel | Contrat optionnel de saisie humaine durable ; exige un checkpoint et ne peut pas être combiné avec une gate.                                                                                                                                                                                                     |
| `options.condition`   | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`  | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes.                                                                                                                                  |
| `options.timeoutMs`   | `number \| undefined`                                                   | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.                                                                                                                                         |
| `options.store`       | `ArtifactStore`                                                         | Requis    | Store qui reçoit l’artefact publié.                                                                                                                                                                                                                                                                              |
| `options.contract`    | `ArtifactContract<T>`                                                   | Requis    | Contrat qui valide et encode la valeur produite.                                                                                                                                                                                                                                                                 |
| `options.produce`     | `(context: TaskContext) => T \| Promise<T>`                             | Requis    | Calcule la valeur à publier depuis le contexte de tâche, par exemple avec context.value() d’une dépendance.                                                                                                                                                                                                      |
| `options.parents`     | `((context: TaskContext) => readonly ArtifactReference[]) \| undefined` | Optionnel | Renvoie les références parentes à enregistrer, en général context.value() de tâches d’artefact listées dans after. S’exécute avant produce().                                                                                                                                                                    |

## Retour

`Task<ArtifactReference>`

## Signature

```ts
export declare function defineArtifactTask<T>(
  options: ArtifactTaskOptions<T>,
): Task<ArtifactReference>;
```

## Contrats associés

- [ArtifactReference](../artifactreference/)
- [ArtifactTaskOptions](../artifacttaskoptions/)
- [Task](../type-task/)
