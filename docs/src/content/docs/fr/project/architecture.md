---
title: Architecture
description: Ports, adapters and domain boundaries in Outpost.
sidebar:
  order: 1
---

Outpost utilise des ports et des adapters. Le domaine décrit les capacités ; les services applicatifs coordonnent leur utilisation. Les agents et les providers de sandbox implémentent des contrats indépendants.

| Couche              | Responsabilité                                                          |
| ------------------- | ----------------------------------------------------------------------- |
| `domain`            | Contrats, règles, prompts, réponses, graphes et exécution des workflows |
| `adapters/agents`   | Commandes et protocoles propres à Claude et Codex                       |
| `adapters/backlogs` | Accès aux issues GitHub et Beads                                        |
| `providers`         | Allocation, commandes, transferts et libération des sandboxes           |
| `infrastructure`    | Git, processus, fichiers, conversations et journaux                     |
| `application`       | Cycle de vie, dispatch, campagnes et synchronisation distante           |
| `cli`               | Commandes, initialisation et images                                     |

Les contrats nommés et les types objets sont placés dans des fichiers `*.types.ts`, sans initialisation à l’exécution. Les paramètres par défaut, options reconnues, recettes et limites partagées sont placés dans des fichiers `*.constants.ts`. Les variables locales et valeurs calculées restent dans leur opération.

Les points d’entrée publics sont conservés. Les façades `providers/agents.ts`, `application/outpost.ts` et `domain/ports.ts` réexportent les implémentations et contrats ; les services internes importent directement leurs dépendances.

## Responsabilités

- Chaque agent possède un adapter, un constructeur de commande et un décodeur d’événements. Des registres de handlers remplacent le dispatch conditionnel des protocoles. Un événement inconnu reste une observation brute.
- Les conversations constituent un port distinct. Les stratégies Claude et Codex portent leurs conventions de stockage ; capture, restauration, recherche et réécriture sont séparées.
- Le workspace possède son état Git. La préparation du sandbox, les opérations exclusives, le dispatch, le terminal et la fermeture ont chacun un service dédié.
- L’exécution d’un tour, l’accumulation des événements et la surveillance des délais sont séparées. L’agrégation de consommation est une règle commune du domaine.
- Les providers composent leurs services de préparation, commandes et transferts. Docker et Podman partagent la mécanique du moteur de conteneurs.
- La synchronisation distante suit quatre étapes : téléchargement, validation, sauvegarde puis application. Le coordinateur conserve la révision synchronisée et les informations de récupération.
- Les workflows séparent validation du graphe, état d’exécution, tentatives d’une tâche et ordonnancement. Les campagnes composent planification, traitement d’une issue et intégration vérifiée avant clôture.

## Extension et vérification

Un nouvel agent implémente `AgentAdapter` dans son propre module. Un nouveau backend implémente `SandboxProvider` et `SandboxLease`, avec annulation, délais de transfert et libération idempotente. Les contrats existants restent compatibles.

`npm run check` vérifie l’architecture, les types, les tests unitaires et fonctionnels et la compilation. `npm run coverage` impose 80 % sur les lignes, branches et fonctions. Les modules de types, effacés à l’exécution, sont contrôlés par TypeScript et le test consommateur du package. Les handlers CLI entrent dans la couverture ; seul le point d’entrée du processus est exclu.

La CI refuse les dépendances entre couches dans le mauvais sens, les contrats déclarés hors des fichiers de types, l’initialisation à l’exécution dans ces fichiers, les chaînes de branches alternatives et les déclarations inutilisées. Elle vérifie aussi les trois systèmes, Docker, Podman et le package installé. Le respect du SRP reste également un travail de revue.
