---
title: "Stores de conversation personnalisés"
description: "Stores de conversation personnalisés — Outpost"
sidebar:
  order: 3
---

`ConversationStore` sépare le traitement des transcripts de la construction des commandes et des événements. Implémentez-le pour un autre format natif ou un autre backend de stockage.

| Méthode                         | Responsabilité                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `locate(id, repository, home?)` | Trouver un transcript hôte et retourner `{ id, file, format }`.                 |
| `capture(id, context)`          | Transférer le transcript principal vers l’hôte et retourner son enregistrement. |
| `restore(record, context)`      | Rendre le transcript disponible dans l’environnement cible pour une reprise.    |

`ConversationContext` contient `repository`, le lease de sandbox, `staging`, le `home` hôte facultatif, l’indication `local` et un callback d’avertissement. Utilisez le lease pour les fichiers distants, sans supposer que les chemins hôtes existent dans l’environnement.

Affectez le store à `AgentAdapter.storage`. Les formats intégrés sont disponibles avec `conversations.native("claude")` et `conversations.native("codex")`. L’utilitaire public expose aussi découverte, capture, restauration et réécriture ; consultez [ses signatures exactes](../../../../reference/conversations/).

Réécrivez uniquement les métadonnées structurelles de répertoire, pas le texte utilisateur contenant un chemin. Préservez l’identité lors d’une reprise et laissez l’agent créer celle du fork. Validez les identifiants avant de les utiliser comme fragments de chemin.

Testez les allers-retours hôte/sandbox, homes personnalisés, transcripts enfants, fichiers absents et transferts interrompus. L’impossibilité de capturer le transcript principal doit échouer clairement ; un avertissement convient seulement aux éléments auxiliaires facultatifs.
