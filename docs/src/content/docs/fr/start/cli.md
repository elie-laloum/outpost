---
title: "Initialiser un projet"
description: "Initialiser un projet — Outpost"
sidebar:
  order: 4
---

`outpost init` crée un projet de workflow dans le dossier courant ou celui indiqué par `--directory`. Ce dossier peut être indépendant des dépôts Git ciblés. Le mode interactif demande les choix ; en automatisation, passez `--yes` ou tous les choix requis.

```sh
npx @elie-laloum/outpost init --yes --agent claude --provider podman --repository /path1/repository --install --build
```

| Option         | Valeurs / comportement                                                            |
| -------------- | --------------------------------------------------------------------------------- |
| `--yes`, `-y`  | Accepter les défauts sans question.                                               |
| `--agent`      | `codex` (défaut) ou `claude`.                                                     |
| `--provider`   | `docker` (défaut), `podman`, `local`, `vercel`, `daytona`.                        |
| `--manager`    | `npm`, `pnpm`, `yarn`, `bun` ; sinon détection via métadonnées/lockfiles.         |
| `--model`      | Nom du modèle inscrit dans l’adapter généré.                                      |
| `--install`    | Installer Outpost et le SDK optionnel sélectionné.                                |
| `--build`      | Construire l’image de container choisie.                                          |
| `--image`      | Remplacer le nom d’image généré.                                                  |
| `--directory`  | Répertoire du workflow, courant par défaut.                                       |
| `--repository` | Dépôt Git ciblé ; chemin relatif au dossier du workflow, ou absolu. Défaut : `.`. |
| `--help`, `-h` | Afficher l’aide.                                                                  |

L’initialisation crée `run.ts`, `brief.md`, `.env.example`, `.gitignore`, un `package.json` et les fichiers spécifiques au provider directement dans ce dossier. Le manifeste contient un script `start`, Outpost et le SDK cloud éventuel ; `--install` installe ces dépendances. Un `package.json` existant est conservé et les règles manquantes sont ajoutées au `.gitignore`. Tout conflit avec les autres fichiers générés fait échouer l’initialisation avant écriture.

Le script est `run.ts` par défaut. Si un manifeste existant déclare `"type": "commonjs"`, `init` génère `run.mts` pour conserver la compatibilité ESM sans modifier ce manifeste. Node.js 24+ exécute directement ces fichiers TypeScript.

## Script généré

Le script lance un `dispatch` avec l’objectif fourni en ligne de commande. Modifiez `brief.md` pour adapter le prompt et `run.ts` pour configurer les options. Copiez `.env.example` vers `.env` dans le dossier du workflow : le script transmet les variables déclarées au provider. Une déclaration vide reprend la variable du processus.

Le dépôt, le brief et le `.env` sont résolus depuis le dossier du script, indépendamment du répertoire de lancement. Avec `--directory /path2/workflow1`, lancez `node /path2/workflow1/run.ts "Mon objectif"`, ou placez-vous dans ce dossier puis lancez `npm start -- "Mon objectif"` après installation.

Le dossier du workflow n’a pas besoin d’être un dépôt Git. Le dépôt ciblé doit contenir un commit. Les worktrees, verrous et logs restent dans `.outpost` du dépôt ciblé. Pour plusieurs dépôts, composez des tâches avec leurs propres `repository` : voir [les workflows multi-dépôts](../../workflows/sandbox-tasks/#plusieurs-dépôts).

Consultez [choisir un dépôt](../../sandboxes/repositories/) pour distinguer le dossier du workflow, le dépôt ciblé et les chemins relatifs.

Utilisez `outpost <commande> --help` pour les options de chaque commande. L’initialisation interactive propose des listes de choix ; Ctrl+C annule avant l’écriture des fichiers. Les rapports JSON et les commandes sans terminal conservent une sortie sans décoration.
