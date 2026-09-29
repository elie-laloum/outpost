---
title: "Approbations et pauses — Vue d’ensemble"
description: "Les gates suspendent un workflow persisté jusqu’à l’approbation, la reprise ou le rejet d’un acteur autorisé, avec signature facultative."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Comment une gate décide

Une gate n’exécute aucun code : elle enregistre une demande et attend une décision soumise à un `start()` ultérieur sur le même checkpoint.

| Étape                                      | Ce qui se passe                                                                                                                                                                                          |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dépendances à l’état `done`                | La gate enregistre une `WorkflowPauseRequest` (`id`, `prompt`, `actors`) dans son record ; l’exécution renvoie `paused`                                                                                  |
| `start({ checkpoint, decisions })`         | Chaque décision doit correspondre à l’`executionId`, à la `key` de la gate et au `requestId` en attente, nommer un acteur autorisé et donner un motif ; sinon l’appel lève et n’applique aucune décision |
| `approve` (approbation) / `resume` (pause) | La gate passe à `done` ; les tâches dépendantes lisent le `WorkflowDecisionRecord` comme sa valeur                                                                                                       |
| `reject`                                   | La gate passe à `rejected`, les dépendantes sont ignorées et l’exécution se termine `failed`, y compris à chaque démarrage suivant                                                                       |

Les attentes de saisie sont distinctes : une tâche interactive termine l’exécution en `waiting-input` et reprend avec `answers`, pas `decisions`.

## Décisions de confiance ou signées

|                       | Acteur de confiance (défaut)                 | Signée (`authentication: "signed"`)                                                                        |
| --------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Outpost vérifie       | `actor` figure dans les `actors` de la gate  | La même chose, plus une preuve Ed25519 d’une clé liée à cet acteur                                         |
| Qui prouve l’identité | Votre application, avant d’appeler `start()` | Votre service de signature, avec `signWorkflowDecision()`                                                  |
| `start()` exige       | `decisions`                                  | `decisions` avec `proof`, et un `decisionVerifier`                                                         |
| Le record conserve    | La décision et `decidedAt`                   | Aussi `verification` : le `keyId` et `verifiedAt`                                                          |
| Refuse aussi          | —                                            | Vérificateur absent, clé inconnue, dupliquée ou liée à un autre acteur, signature invalide, preuve expirée |

:::caution
Le `kind`, le `prompt`, les `actors` et l’`authentication` d’une gate font partie de l’identité du checkpoint. En modifier un rend un checkpoint sauvegardé incompatible.
:::

## Points d’entrée

Guide : [Approbations](../../../guide/approvals/) · [Tâches interactives](../../../guide/interactive-tasks/) · [Exécutions durables](../../../guide/durable-runs/)

- [defineApprovalTask](../../defineapprovaltask/)
- [definePauseTask](../../definepausetask/)
- [signWorkflowDecision](../../signworkflowdecision/)
- [createEd25519DecisionVerifier](../../createed25519decisionverifier/)
- [WorkflowGateOptions](../../workflowgateoptions/)
- [WorkflowPauseRequest](../../workflowpauserequest/)
- [WorkflowDecision](../../workflowdecision/)
- [WorkflowDecisionRecord](../../workflowdecisionrecord/)
- [WorkflowDecisionVerifier](../../workflowdecisionverifier/)
- [WorkflowApproverKey](../../workflowapproverkey/)
