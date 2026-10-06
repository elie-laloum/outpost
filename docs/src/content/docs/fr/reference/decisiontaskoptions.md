---
title: "DecisionTaskOptions"
description: "DecisionTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { DecisionTaskOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                                                                                   | Présence  | Rôle                                                                                                                                                                                                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retry`          | `Retry \| undefined`                                                                   | Optionnel | Politique de relance des tentatives échouées ; sans elle, la tâche s’exécute une fois. Une tentative relancée répète ses effets de bord.                                                                                                                                                                         |
| `cache`          | `TaskCacheOptions \| undefined`                                                        | Optionnel | Cache de résultat : une entrée trouvée restaure la valeur JSON sans perte enregistrée, sans tentative, usage ni effet de bord. En cas d’absence, un résultat qui n’est pas du JSON sans perte fait échouer la tâche. Refusé sur les gates, les interactions et les tâches qui renvoient un résultat de dispatch. |
| `key`            | `string`                                                                               | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                                                                                                                                                                |
| `after`          | `readonly Task<unknown>[] \| undefined`                                                | Optionnel | Tâches qui doivent être done avant que celle-ci démarre, aucune par défaut ; seules celles-ci se lisent avec context.value().                                                                                                                                                                                    |
| `condition`      | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                 | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes.                                                                                                                                  |
| `timeoutMs`      | `number \| undefined`                                                                  | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.                                                                                                                                         |
| `decision`       | `Decision<Q>`                                                                          | Requis    | Déclaration typée et figée de questions créée avec defineDecision.                                                                                                                                                                                                                                               |
| `model`          | `string`                                                                               | Requis    | Nom non vide du modèle de décision, sans réglages de génération ni de raisonnement.                                                                                                                                                                                                                              |
| `provider`       | `DecisionProvider`                                                                     | Requis    | Provider de décision qui réalise cette évaluation.                                                                                                                                                                                                                                                               |
| `allowTruncated` | `boolean \| undefined`                                                                 | Optionnel | False par défaut ; true accepte une troncature signalée en conservant son indicateur dans le résultat.                                                                                                                                                                                                           |
| `state`          | `DecisionState \| ((context: TaskContext) => DecisionState \| Promise<DecisionState>)` | Requis    | État JSON sans perte statique ou fonction synchrone/asynchrone de TaskContext, résolue à chaque tentative exécutée.                                                                                                                                                                                              |

## Signature

```ts
export type DecisionTaskOptions<
  Q extends DecisionQuestions = DecisionQuestions,
> = Omit<TaskOptions<DecisionResult<Q>>, "perform" | "gate" | "interaction"> &
  Omit<DecideOptions<Q>, "state" | "signal" | "observation"> & {
    readonly state:
      | DecisionState
      | ((context: TaskContext) => DecisionState | Promise<DecisionState>);
  };
```

## Contrats associés

- [DecideOptions](../decideoptions/)
- [DecisionQuestions](../decisionquestions/)
- [DecisionResult](../decisionresult/)
- [DecisionState](../decisionstate/)
- [TaskContext](../taskcontext/)
- [TaskOptions](../taskoptions/)
