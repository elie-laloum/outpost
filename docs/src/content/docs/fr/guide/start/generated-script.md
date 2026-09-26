---
title: "Comprendre le script généré"
description: "Lire le résultat de la CLI comme un petit programme que vous maîtrisez."
---

La CLI crée un programme TypeScript ordinaire. Vous pouvez le lire et le modifier ; aucun service de workflow ne tourne en arrière-plan.

| Élément               | Son rôle                                                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repository`          | Résoudre le checkout Git ciblé par rapport au script, indépendamment du dossier du shell.                                                                       |
| `.env` et `variables` | Lire les variables explicitement déclarées, dont celle par défaut de l’identifiant choisi, et les transmettre au provider.                                      |
| `authentication`      | Choisir `account`, un jeton de compte ou `usage` ; Outpost le prépare dans le home privé de la sandbox. Le script ne lit lui-même aucun fichier d’identifiants. |
| `agent`               | Choisir le comportement Codex, Claude Code, Antigravity, GitHub Copilot ou Kimi Code.                                                                           |
| `provider`            | Choisir où l’agent s’exécute, indépendamment de son protocole.                                                                                                  |
| `brief`               | Lire le fichier de tâche et substituer l’objectif.                                                                                                              |
| `dispatch`            | Posséder une exécution et collecter réponse, changements, usage et conversation.                                                                                |

Le [manuel d’authentification](../../manual/authentication/) explique chaque forme d’`authentication` et ce qu’Outpost prépare. Le starter intègre les commits dans la branche ciblée. L’[exemple complet de dispatch](../../agents/dispatch/) utilise ensuite une branche nommée pour relire avant intégration ; cette page contient sa préparation et son code exécutable.

## Trois durées de vie différentes

Un **workspace** possède l’état Git. Une **sandbox** possède l’environnement d’exécution qui lui est attaché. Une **conversation** possède le contexte de l’agent et peut survivre à cet environnement. Fermer l’un ne signifie pas que les autres ont disparu.

Un **workflow** relie des tâches et leurs résultats typés. Il peut exécuter des fonctions TypeScript, commandes ou tâches d’agent. Il ne supprime pas les règles de possession des workspaces.

## Adapter le starter

Modifiez d’abord le brief. Choisissez ensuite une [politique de branche](../../environment/branches/), ajoutez un [contrat de réponse](../../agents/responses/) ou gardez une [sandbox chaude](../../environment/lifecycle/). La [référence de configuration](../../manual/configuration/) explique les chemins et priorités d’environnement.
