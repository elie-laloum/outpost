---
title: "Initialiser un projet"
description: "Initialiser un projet — Outpost"
sidebar:
  order: 4
---

`outpost init` génère des fichiers modifiables dans votre dépôt cible. Le mode interactif demande les choix ; en automatisation, passez `--yes` ou tous les choix requis.

```sh
npx outpost init --yes --agent claude --provider podman --template plan-review --tracker github --label outpost-ready --install --build
```

| Option         | Valeurs / comportement                                                             |
| -------------- | ---------------------------------------------------------------------------------- |
| `--yes`, `-y`  | Accepter les défauts sans question.                                                |
| `--agent`      | `codex` (défaut) ou `claude`.                                                      |
| `--provider`   | `docker` (défaut), `podman`, `local`, `vercel`, `daytona`.                         |
| `--template`   | `blank` (défaut), `iterate`, `review`, `plan`, `plan-review`.                      |
| `--tracker`    | `github`, `beads`, `custom` ; sans choix en mode automatique, objectif en mémoire. |
| `--manager`    | `npm`, `pnpm`, `yarn`, `bun` ; sinon détection via métadonnées/lockfiles.          |
| `--model`      | Nom du modèle inscrit dans l’adapter généré.                                       |
| `--install`    | Installer Outpost et le SDK optionnel sélectionné.                                 |
| `--build`      | Construire l’image de container choisie.                                           |
| `--image`      | Remplacer le nom d’image généré.                                                   |
| `--label`      | Label/filtre du tracker ; créé ou mis à jour pour GitHub.                          |
| `--directory`  | Répertoire du projet cible.                                                        |
| `--help`, `-h` | Afficher l’aide.                                                                   |

L’initialisation refuse les fichiers existants au lieu de les écraser. Elle crée `.outpost/run.ts` pour les projets ESM, `.outpost/run.mts` sinon, ainsi que configuration, prompts/standards et fichiers spécifiques au provider/tracker. La sortie finale affiche la commande exacte.

## Modèles de départ

`blank` lance un dispatch. `iterate` traite les issues séquentiellement. `review` ajoute une revue dans la même sandbox. `plan` planifie des branches indépendantes avec concurrence bornée et intégration. `plan-review` combine planification et revue. Sans tracker, les campagnes utilisent l’objectif de la ligne de commande comme une issue en mémoire.

Modifiez l’appel généré pour régler limites et adapters de rôles. Les standards résident dans `.outpost/STANDARDS.md`. Le CLI fournit un point de départ ; les appels de bibliothèque définissent le comportement d’exécution.
