---
title: "Sandboxes — Vue d’ensemble"
description: "Une sandbox est l’environnement d’exécution attaché à un workspace."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Une sandbox est l’environnement d’exécution attaché à un workspace. Elle associe un bail de provider à des opérations comme les commandes, les transferts de fichiers et les dispatchs d’agents. Sa durée de vie détermine les outils installés et l’état d’environnement réutilisables entre les opérations.

## Fonctionnement et philosophie

`createSandbox` renvoie un handle appartenant à l’appelant. Utilisez-le pour enchaîner des opérations dans le même environnement, puis fermez-le explicitement ou avec `await using`. Une sandbox accepte une seule opération à la fois ; la concurrence d’un workflow n’autorise pas des opérations simultanées sur un même handle.

## Limites et responsabilités

La propriété du workspace et celle de l’environnement sont distinctes. Une sandbox ferme les ressources qu’elle possède ; un workspace fourni garde sa durée de vie indépendante. La libération de l’environnement n’implique pas la suppression du travail Git modifié ni des conversations persistées séparément.

## Points d’entrée

- [createSandbox](../../createsandbox/)
- [Sandbox](../../sandbox/)
- [SandboxOptions](../../sandboxoptions/)

[Passer à la pratique avec le Guide](../../../guide/environment/lifecycle/).
