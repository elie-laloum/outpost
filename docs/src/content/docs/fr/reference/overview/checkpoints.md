---
title: "Checkpoints de workflow — Vue d’ensemble"
description: "Un checkpoint stocke l’état durable d’une exécution de workflow : résultats des tâches, valeurs JSON et usage cumulé."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Un checkpoint stocke l’état durable d’une exécution de workflow : résultats des tâches, valeurs JSON et usage cumulé. Il permet à un processus ultérieur de rouvrir une exécution sauvegardée sans dépendre de handles mémoire disparus avec le processus initial.

## Fonctionnement et philosophie

L’identité d’exécution et la version du graphe relient l’état persisté à la définition du workflow. `fileWorkflowCheckpointStore` fournit la persistance sur fichiers ; les contrats de store et de bail définissent la propriété lors de l’accès à cet état. Les valeurs terminées peuvent être réutilisées selon les règles de checkpoint et de rejeu.

## Limites et responsabilités

Les sorties stockées doivent être du JSON sans perte. Rejouer un travail ayant des effets externes demande une autorisation explicite ; la persistance ne garantit pas des effets exactement une fois. Un checkpoint n’est pas un instantané de toutes les sandboxes, de tous les fichiers ou des conversations natives.

## Points d’entrée

- [fileWorkflowCheckpointStore](../../fileworkflowcheckpointstore/)
- [WorkflowCheckpointOptions](../../workflowcheckpointoptions/)
- [WorkflowCheckpointStore](../../workflowcheckpointstore/)
- [WorkflowCheckpoint](../../workflowcheckpoint/)
- [WorkflowJson](../../workflowjson/)

[Passer à la pratique avec le Guide](../../../guide/advanced/checkpoints/).
