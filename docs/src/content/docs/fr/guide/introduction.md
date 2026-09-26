---
title: "Introduction"
description: "Des agents de code intégrés à votre application."
---

Outpost est une bibliothèque TypeScript pour exécuter des agents de code sur des dépôts Git. Confiez une tâche à un agent, choisissez son environnement, puis récupérez sa réponse, sa consommation et ses commits.

Utilisez-la pour automatiser une correction, examiner un changement ou relier plusieurs étapes dans un workflow. Votre application garde le contrôle des branches, des identifiants et de l’intégration des modifications.

## Commencer

[Configurez Outpost](../setup/) pour choisir un agent et sa sandbox. Puis [envoyez votre première requête](../first-request/).

```sh
npm install @elie-laloum/outpost
```

## Ce que vous pouvez construire

| Besoin                                                      | À utiliser                                      |
| ----------------------------------------------------------- | ----------------------------------------------- |
| Exécuter une tâche de code                                  | [Requêtes](../first-request/)                   |
| Tester ou inspecter le code entre deux tours                | [Sessions de sandbox](../sandbox-sessions/)     |
| Relier les résultats et paralléliser le travail indépendant | [Dépendances des tâches](../task-dependencies/) |
| Attendre une décision humaine                               | [Étapes de validation](../review-gates/)        |
| Redémarrer un workflow interrompu                           | [Exécutions persistantes](../durable-runs/)     |
| Conserver des rapports entre processus                      | [Artefacts partagés](../shared-artifacts/)      |

## Choisir chaque composant indépendamment

Un **agent** sélectionne un harness et éventuellement un modèle. Un **fournisseur de sandbox** sélectionne Docker, Podman, un environnement cloud ou l’hôte. Un **workspace** sélectionne le checkout Git. Changer l’un n’impose pas de remplacer les deux autres.

Les harness CLI prennent en charge Codex, Claude Code, Antigravity, GitHub Copilot CLI et Kimi Code. Vous pouvez aussi [configurer la boucle de modèle d’Outpost](../model-loop/).

Outpost gère l’exécution et l’état. Vos tests établissent si le changement fonctionne, et votre code décide de son intégration. Consultez la [stratégie de branches](../branch-strategy/) avant d’automatiser la livraison.
