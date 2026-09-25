---
title: "Diagnostics — Vue d’ensemble"
description: "Les diagnostics indiquent si un environnement fournit les capacités nécessaires à une opération."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Les diagnostics indiquent si un environnement fournit les capacités nécessaires à une opération. Ils distinguent outils manquants, fonctions non prises en charge et problèmes de protocole des échecs de la tâche de code elle-même. Un rapport fournit des éléments à examiner avant de relancer du travail.

## Fonctionnement et philosophie

`diagnoseSandbox` sonde une sandbox existante en respectant ses règles de propriété des opérations. `diagnoseAgentProtocol` exerce le protocole d’agent choisi et rapporte ses observations. Contrôles de capacités, versions d’outils et exécution du protocole répondent à des questions différentes ; choisissez le diagnostic adapté au symptôme.

## Limites et responsabilités

Un diagnostic ne prend pas la responsabilité de fermer une sandbox fournie. Un contrôle de binaire ou de version ne prouve ni l’accès au compte ni la réussite d’un appel modèle. Les sondes de protocole peuvent exécuter un agent et nécessiter ses identifiants déclarés ; examinez leurs options avant de les lancer.

## Points d’entrée

- [diagnoseSandbox](../../diagnosesandbox/)
- [SandboxDiagnosticReport](../../sandboxdiagnosticreport/)
- [DiagnosticCheck](../../diagnosticcheck/)
- [diagnoseAgentProtocol](../../diagnoseagentprotocol/)
- [AgentProtocolReport](../../agentprotocolreport/)

[Passer à la pratique avec le Guide](../../../guide/operations/doctor/).
