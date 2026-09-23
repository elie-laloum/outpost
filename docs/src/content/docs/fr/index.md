---
title: "Documentation Outpost"
description: "Documentation Outpost — Outpost"
sidebar:
  order: 0
---

Exécutez des agents de code dans des environnements contrôlés, séparez leur travail Git et reliez leurs opérations avec des workflows typés.

Outpost est une bibliothèque TypeScript accompagnée d’un petit CLI de configuration. Elle prend en charge **Claude Code et Codex**, avec **Docker, Podman, Vercel, Daytona ou une exécution explicite sur l’hôte**. Les adapters d’agents déterminent ce qui s’exécute ; les providers de sandbox déterminent où.

## Choisir un parcours

| Vous voulez…                                             | Commencez ici                                   |
| -------------------------------------------------------- | ----------------------------------------------- |
| Exécuter votre première tâche avec un agent              | [Démarrage rapide](start/quickstart/)           |
| Comprendre la propriété des ressources et leur fermeture | [Concepts essentiels](start/concepts/)          |
| Conserver un environnement entre plusieurs tâches        | [Sandboxes réutilisables](sandboxes/lifecycle/) |
| Coordonner des tâches et des agents                      | [Premier workflow](workflows/graph/)            |
| Traiter les issues d’un outil de suivi                   | [Campagnes d’issues](workflows/campaigns/)      |
| Retrouver une option ou un type de retour                | [Index de l’API](reference/)                    |
| Diagnostiquer un échec                                   | [Dépannage](operations/troubleshooting/)        |

## Utiliser cette documentation

Les guides présentent une opération à la fois. La référence API recense chaque export public et son contrat TypeScript. Les exemples utilisent ESM et Node.js 24 ou ultérieur. Sauf indication contraire, les chemins comme `.outpost/run.mts` sont relatifs à votre projet.

Recherchez un nom d’API, une option du CLI ou une erreur dans la barre de recherche. Le sélecteur de langue relie les pages françaises et anglaises correspondantes. Le site publié suit la dernière release ; la CI vérifie les changements non publiés avant la release suivante.

[Historique des versions](project/changelog/) · [Roadmap](project/roadmap/) · [Sources sur GitLab](https://gitlab.elielaloum.com/elielaloum/outpost)
