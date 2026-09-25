---
title: "Commandes et terminal — Vue d’ensemble"
description: "Les commandes et terminaux interactifs donnent un accès direct à l’environnement d’exécution."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Les commandes et terminaux interactifs donnent un accès direct à l’environnement d’exécution. Une commande lance un programme nommé avec des arguments explicites et renvoie son résultat de processus. Un terminal connecte un humain à une session interactive native d’agent.

## Fonctionnement et philosophie

Utilisez `sandbox.command` pour les contrôles reproductibles et l’automatisation. L’analyse shell n’est pas implicite : choisissez explicitement un shell si sa syntaxe est nécessaire. `attach` ouvre une session interactive et gère ses ressources propres ; la prise en charge du terminal dépend du provider.

## Limites et responsabilités

La fin du processus et la fermeture des flux de sortie sont deux événements différents. Examinez le statut de sortie en plus du texte. Annulation et délais ciblent l’opération ; ils ne doivent pas transformer silencieusement une sandbox réutilisable en environnement fermé. L’attachement interactif ne renvoie pas de réponse d’agent typée et validée.

## Points d’entrée

- [Command](../../command/)
- [CommandResult](../../commandresult/)
- [attach](../../attach/)
- [AttachOptions](../../attachoptions/)
- [AttachResult](../../attachresult/)
- [Channel](../../channel/)

[Passer à la pratique avec le Guide](../../../guide/environment/commands/).
