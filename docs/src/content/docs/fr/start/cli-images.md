---
title: "Construire et gérer les images"
description: "Construire et gérer les images — Outpost"
sidebar:
  order: 5
---

Les providers de containers nécessitent une image contenant Git, Node, les outils shell et les CLI d’agents. L’initialisation écrit un Dockerfile ou Containerfile et peut le construire avec `--build`.

```sh
npx outpost image build --engine docker
npx outpost image build --engine podman --file Containerfile --image outpost:custom --uid 1000 --gid 1000
npx outpost image remove --engine podman --image outpost:custom
```

| Option           | Rôle                                                               |
| ---------------- | ------------------------------------------------------------------ |
| `--engine`       | `docker` ou `podman`.                                              |
| `--file`         | Autre recette de construction.                                     |
| `--image`        | Nom/tag ; utilisez la même valeur dans le provider.                |
| `--uid`, `--gid` | Identité numérique de construction adaptée aux droits d’exécution. |
| `--directory`    | Répertoire du projet cible ; répertoire courant par défaut.        |

L’image générée utilise Node 24 et inclut Git, Python et les deux CLI d’agents. Installez les outils supplémentaires du projet dans la recette puis reconstruisez.

La suppression cible l’image sélectionnée ; ce n’est pas un nettoyage global. Outpost ne reconstruit pas automatiquement une image obsolète au lancement. Reconstruisez après un changement de recette, de versions des agents ou d’UID/GID.

Si vous omettez `--build` à l’initialisation, construisez avant le premier dispatch en container. Les providers cloud et locaux n’utilisent pas ces commandes d’images locales.

Les recettes par défaut sont `Dockerfile` et `Containerfile` à la racine du dossier du workflow. Pour une ancienne installation, utilisez `--file .outpost/Dockerfile`. Le script généré conserve explicitement le nom de l’image du workflow, même lorsque `repository` cible un autre dossier.
