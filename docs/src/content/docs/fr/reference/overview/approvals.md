---
title: "Approbations et pauses — Vue d’ensemble"
description: "Une approbation ou une pause est un point de décision durable du workflow."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Une approbation ou une pause est un point de décision durable du workflow. Elle représente un travail devant attendre une décision externe explicite avant de laisser avancer ses dépendants, plutôt que de garder un processus bloqué sur une saisie interactive.

## Fonctionnement et philosophie

`approvalTask` et `pauseTask` créent des tâches de décision. Le workflow persiste la demande en attente et peut rendre le contrôle à l’appelant. Un démarrage ultérieur soumet des décisions contre cet état sauvegardé ; les dépendances imposent l’ordre autour de cette étape.

## Limites et responsabilités

Les identifiants d’acteurs sont des métadonnées de confiance, pas une authentification. L’application doit établir qui peut soumettre une décision. Le rejet est définitif pour cette exécution ; un lot invalide est refusé avant application partielle. Une pause persistée ne nécessite ni timer ni worker permanent.

## Points d’entrée

- [approvalTask](../../approvaltask/)
- [pauseTask](../../pausetask/)
- [WorkflowGate](../../workflowgate/)
- [WorkflowGateOptions](../../workflowgateoptions/)
- [WorkflowDecision](../../workflowdecision/)
- [WorkflowDecisionRecord](../../workflowdecisionrecord/)

[Passer à la pratique avec le Guide](../../../guide/advanced/approvals/).
