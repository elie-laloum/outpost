---
title: "defineDecisionTask"
description: "defineDecisionTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineDecisionTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Déclarer une tâche de décision sans sandbox utilisant dépendances, nouvelles tentatives, délais, caches et checkpoints existants. Chaque tentative exécutée calcule son état et rapporte l’usage de façon synchrone, y compris les reçus valides de troncatures refusées.

[Exemple complet et règles détaillées](../../guide/decisions/).

## Paramètres et propriétés

| Nom                      | Type                                                                                   | Présence  | Rôle                                                                                                                                                                                                                                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                | `DecisionTaskOptions<Q>`                                                               | Requis    | Configuration fixe de décision et contrôles du workflow ; l’état peut être calculé à partir des dépendances.                                                                                                                                                                                                     |
| `options.retry`          | `Retry \| undefined`                                                                   | Optionnel | Politique de relance des tentatives échouées ; sans elle, la tâche s’exécute une fois. Une tentative relancée répète ses effets de bord.                                                                                                                                                                         |
| `options.cache`          | `TaskCacheOptions \| undefined`                                                        | Optionnel | Cache de résultat : une entrée trouvée restaure la valeur JSON sans perte enregistrée, sans tentative, usage ni effet de bord. En cas d’absence, un résultat qui n’est pas du JSON sans perte fait échouer la tâche. Refusé sur les gates, les interactions et les tâches qui renvoient un résultat de dispatch. |
| `options.key`            | `string`                                                                               | Requis    | Clé unique dans le workflow, conforme à [A-Za-z0-9][A-Za-z0-9._-]*. Les enregistrements, événements et checkpoints identifient la tâche par elle.                                                                                                                                                                |
| `options.after`          | `readonly Task<unknown>[] \| undefined`                                                | Optionnel | Tâches qui doivent être done avant que celle-ci démarre, aucune par défaut ; seules celles-ci se lisent avec context.value().                                                                                                                                                                                    |
| `options.condition`      | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined`                 | Optionnel | Évaluée avec attempt 0 avant l’exécution de la tâche, y compris quand un start() ultérieur la reprend ; false termine la tâche en skipped, ce qui ignore aussi ses dépendantes.                                                                                                                                  |
| `options.timeoutMs`      | `number \| undefined`                                                                  | Optionnel | Délai en millisecondes de chaque tentative, entier positif jusqu’à 2147483647. À l’expiration, context.signal est annulé et la tentative échoue ; retry peut la répéter.                                                                                                                                         |
| `options.decision`       | `Decision<Q>`                                                                          | Requis    | Déclaration typée et figée de questions créée avec defineDecision.                                                                                                                                                                                                                                               |
| `options.model`          | `string`                                                                               | Requis    | Nom non vide du modèle de décision, sans réglages de génération ni de raisonnement.                                                                                                                                                                                                                              |
| `options.provider`       | `DecisionProvider`                                                                     | Requis    | Provider de décision qui réalise cette évaluation.                                                                                                                                                                                                                                                               |
| `options.allowTruncated` | `boolean \| undefined`                                                                 | Optionnel | False par défaut ; true accepte une troncature signalée en conservant son indicateur dans le résultat.                                                                                                                                                                                                           |
| `options.state`          | `DecisionState \| ((context: TaskContext) => DecisionState \| Promise<DecisionState>)` | Requis    | État JSON sans perte statique ou fonction synchrone/asynchrone de TaskContext, résolue à chaque tentative exécutée.                                                                                                                                                                                              |

## Retour

`Task<DecisionResult<Q>>`

## Signature

```ts
export declare function defineDecisionTask<const Q extends DecisionQuestions>(
  options: DecisionTaskOptions<Q>,
): Task<DecisionResult<Q>>;
```

## Contrats associés

- [DecisionQuestions](../decisionquestions/)
- [DecisionResult](../decisionresult/)
- [DecisionTaskOptions](../decisiontaskoptions/)
- [Task](../type-task/)
