---
title: "Configuration et chemins"
description: "Localiser chaque entrée et comprendre la priorité des variables."
---

| Entrée                                | Résolution                                                                    |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `repository`                          | Checkout explicite ; par défaut, la bibliothèque utilise le dossier courant.  |
| `.env` du starter                     | À côté de `run.ts`, lu explicitement et transmis aux variables du provider.   |
| `.outpost/.env` de la bibliothèque    | Dans le dépôt ciblé ; le `.env` racine du dépôt n’est pas lu automatiquement. |
| Déclaration d’environnement vide      | Hérite de cette variable exacte du processus hôte.                            |
| Variables explicites provider/adapter | Remplacent les valeurs du dépôt ; le même nom sur les deux est rejeté.        |
| Fichier de brief                      | Relatif au dossier courant de l’appelant, sauf chemin absolu explicite.       |
| Logs, worktrees et verrous            | Sous le `.outpost` du dépôt ciblé.                                            |

Commencez par une [préparation exécutable](../../../guide/start/quickstart/). Règles détaillées : [environnement et connexion](../../behavior/agents/environment/), [chemins de dépôt](../../behavior/sandboxes/repositories/), [options CLI](../cli/).

Les valeurs `OUTPOST_AGENT` et `OUTPOST_AUTH` des exemples `runtime.mts` configurent ce script pédagogique. Ce ne sont pas des variables intégrées à la bibliothèque.
