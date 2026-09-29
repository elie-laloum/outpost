---
title: "Checkpoints de workflow — Vue d’ensemble"
description: "L’état durable d’une exécution de workflow : enregistrements des tâches, sorties JSON sans perte et usage cumulé, possédé par un seul runner à la fois."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Ce que stocke un checkpoint

`start({ checkpoint })` enregistre l’exécution sous `runId` au démarrage d’une tâche, avant chaque tentative, à chaque rapport d’usage et quand une tâche se termine. Un `start()` ultérieur avec le même `runId` la restaure.

| Enregistré                                                                    | Champ         | Au redémarrage                                                                                                                                           |
| ----------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Statut, tentatives, erreurs, état de gate, de question, de quota et de boucle | `records`     | Les tâches `done` le restent ; gates, questions et pauses de quota continuent ; les tâches en échec ou interrompues exigent `resume: "retry-incomplete"` |
| Sortie de chaque tâche `done`                                                 | `values`      | Restaurée pour `context.value()` ; la tâche ne s’exécute plus                                                                                            |
| Tentatives et tokens                                                          | `usage`       | Continuent de s’additionner, donc un `budget` couvre toutes les reprises                                                                                 |
| Identifiant d’exécution                                                       | `executionId` | Conservé, donc `context.idempotencyKey` reste le même pour chaque tâche                                                                                  |
| Empreinte du nom du workflow, de `version` et du graphe des tâches            | `identity`    | Doit correspondre, sinon `start()` rejette avant d’exécuter une tâche                                                                                    |

Les sorties doivent être du JSON sans perte ou `undefined` ; toute autre valeur fait échouer sa tâche. Un checkpoint contient au plus 16 Mio et n’enregistre ni les sandboxes, ni les fichiers, ni les conversations natives, ni le code des tâches.

## Possession et récupération

Une exécution possède son checkpoint de `start()` jusqu’à son retour. Chaque écriture est conditionnée à la dernière révision : un runner qui a perdu la possession échoue avec `TransportConflict`.

| Situation                                                  | Résultat                                                   | Que faire                                                                                                                                                       |
| ---------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Un autre `start()` détient le `runId`                      | `start()` rejette : déjà utilisé                           | Attendre son retour, ou utiliser un autre `runId`                                                                                                               |
| Le processus du runner est mort                            | La possession reste enregistrée ; chaque `start()` rejette | Arrêter l’ancien runner, lire la révision de l’objet du checkpoint, la passer à `recoverWorkflowCheckpoint()`, puis reprendre avec `resume: "retry-incomplete"` |
| Une tâche a échoué, a été annulée ou interrompue           | `start()` rejette sans `resume`                            | Passer `resume: "retry-incomplete"` ; ces tâches s’exécutent de nouveau, avec leurs effets de bord                                                              |
| L’identité a changé (nouvelle `version` ou nouveau graphe) | `start()` rejette : checkpoint incompatible                | Démarrer sous un nouveau `runId`                                                                                                                                |
| Une écriture du checkpoint échoue ou dépasse 16 Mio        | Les tâches actives sont annulées ; `start()` rejette       | Corriger le store ou déplacer les gros contenus vers des artefacts, puis reprendre avec `resume: "retry-incomplete"`                                            |

:::caution
Arrêtez l’ancien runner avant la récupération. Le verrouillage par révision rejette ses écritures de checkpoint ultérieures, pas les effets de bord qu’il produit encore.
:::

## Points d’entrée

Guide : [Exécutions durables](../../../guide/durable-runs/) · [Files de jobs et workers](../../../guide/job-queues/) · [Où vivent les données](../../../guide/storage/)

- [createWorkflowCheckpointStore](../../createworkflowcheckpointstore/)
- [recoverWorkflowCheckpoint](../../recoverworkflowcheckpoint/)
- [WorkflowCheckpointOptions](../../workflowcheckpointoptions/)
- [WorkflowCheckpoint](../../workflowcheckpoint/)
- [WorkflowCheckpointValue](../../workflowcheckpointvalue/)
- [WorkflowJson](../../workflowjson/)
- [WorkflowCheckpointStore](../../workflowcheckpointstore/)
- [WorkflowCheckpointLease](../../workflowcheckpointlease/)
