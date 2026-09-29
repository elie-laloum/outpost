---
title: "Dispatch — Vue d’ensemble"
description: "Confiez un brief à un agent, laissez-le travailler dans une sandbox, puis récupérez son texte, sa valeur typée, son usage, ses commits et sa conversation."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Choisir un appel

| Appel                                       | Sandbox                                              | À utiliser pour                                     |
| ------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------- |
| `dispatch(options)`                         | Allouée pour l’appel, fermée ensuite                 | Une tâche dans un environnement neuf                |
| `sandbox.dispatch(options)`                 | Votre sandbox ouverte, laissée ouverte               | Plusieurs tâches qui partagent un état installé     |
| `result.resume(options)` / `result.fork(…)` | Nouvelle sandbox (résultat froid) ou la même (chaud) | Continuer ou bifurquer la conversation capturée     |
| `createSteering()` passé comme `steering`   | Inchangée                                            | Envoyer des consignes pendant que l’agent travaille |

En cas de succès, un `dispatch` froid intègre la branche et ferme la sandbox. En cas d’échec, il ferme la sandbox, conserve le worktree et enregistre la branche et le répertoire dans le `recovery` de l’erreur.

## Fin d’un dispatch

| Événement                                     | Défaut                    | Résultat                                                                     |
| --------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------- |
| Marqueur de fin dans le texte du dernier tour | `<outpost>done</outpost>` | `completed: true` ; un agent encore actif s’arrête après `settleMs`          |
| Réponse typée analysée et validée             | —                         | `value` est renseignée ; une réponse invalide reçoit des tours de correction |
| Toutes les `passes` exécutées sans marqueur   | 1 passe                   | Se résout avec `completed: false`                                            |
| Aucune sortie de l’agent pendant `idleMs`     | 10 minutes                | Rejette avec le code `timeout`                                               |
| Processus de l’agent au-delà de `deadlineMs`  | 1 heure                   | Rejette avec le code `timeout`                                               |
| Sortie de l’agent avec un statut non nul      | —                         | Rejette avec le code `process`, ou `quota` pour une limite d’usage           |
| `signal` annulé                               | —                         | Rejette avec la raison de l’annulation                                       |

:::note
Un marqueur, une réponse typée ou un commit ne prouvent pas que le travail est correct. Imposez les vérifications avec une commande ou une gate de workflow.
:::

## Points d’entrée

Guide : [Votre première tâche](../../../guide/first-request/) · [Réorienter un agent en cours](../../../guide/steering/)

- [dispatch](../../dispatch/)
- [DispatchOptions](../../dispatchoptions/)
- [DispatchResult](../../dispatchresult/)
- [WarmDispatchResult](../../warmdispatchresult/)
- [Execution](../../execution/)
- [ContinuationOptions](../../continuationoptions/)
- [createSteering](../../createsteering/)
- [Steering](../../steering/)
