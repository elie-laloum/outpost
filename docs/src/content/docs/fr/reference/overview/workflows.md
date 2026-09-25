---
title: "Workflows — Vue d’ensemble"
description: "Un workflow est un graphe de tâches typées et de dépendances déclarées."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Un workflow est un graphe de tâches typées et de dépendances déclarées. Il relie opérations TypeScript ordinaires, commandes de sandbox et tâches d’agent sans imposer un modèle à chaque étape. Les dépendances expriment à la fois l’ordre et les résultats qu’une tâche peut lire.

## Fonctionnement et philosophie

`task` définit une opération ; `workflow` valide et regroupe le graphe ; `start` l’exécute. Les tâches indépendantes peuvent être concurrentes dans la limite configurée. `agentTask` et `commandTask` utilisent une sandbox existante ; `isolatedTask` possède l’allocation de sa tentative d’agent.

## Limites et responsabilités

Les retries peuvent répéter des effets externes. Les budgets contrôlent l’admission selon les tentatives et l’usage observé, sans garantir un plafond monétaire. Les tâches parallèles nécessitent toujours une propriété indépendante des sandboxes et workspaces. Les checkpoints ajoutent la persistance ; ils ne rendent pas transactionnels les effets externes.

## Points d’entrée

- [task](../../task/)
- [workflow](../../workflow/)
- [TaskContext](../../taskcontext/)
- [WorkflowResult](../../workflowresult/)
- [agentTask](../../agenttask/)
- [commandTask](../../commandtask/)
- [isolatedTask](../../isolatedtask/)

[Passer à la pratique avec le Guide](../../../guide/workflows/graph/).
