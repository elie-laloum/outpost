---
title: "Construire une image d’agent"
description: "Construisez et personnalisez l’image Docker ou Podman utilisée par vos agents."
---

## Contenu de l’image

L’image contient les outils en ligne de commande utilisés par vos agents. Générez un Dockerfile ou un Containerfile, ajoutez les outils nécessaires à votre projet et construisez l’image sous un nom comme `outpost:dev`.

<!-- features -->

- **Base** : `node:24-bookworm-slim` avec Git, le client OpenSSH, curl, Python 3 et les outils de processus.
- **CLI d’agent** : Claude Code, Codex, Copilot CLI et Kimi Code depuis npm, [Antigravity](../antigravity/) depuis une archive vérifiée.
- **Utilisateur de l’agent** : L’utilisateur `node` de l’image, renuméroté avec votre UID et votre GID.
- **Répertoire personnel privé** : `/home/agent`, appartenant à l’utilisateur de l’agent en mode 700, défini comme `HOME`.
- **Environnement** : Mises à jour automatiques d’Antigravity désactivées, cache de Copilot sous `/tmp/.cache`.
- **Répertoire de travail** : `/workspace`, où démarrent les commandes.

## Générer la recette

La commande construit l’image et écrit son `Dockerfile` dans `.outpost-image` (`Containerfile` avec Podman). Ce dossier reçoit aussi des fichiers d’exemple que vous pouvez laisser de côté : vos tâches seront écrites dans vos propres scripts TypeScript. Ajoutez `--no-build` pour générer les fichiers sans lancer la construction.

```sh
npx outpost init --yes --directory .outpost-image --image outpost:dev
```

Les commandes de cette page supposent que le paquet Outpost est déjà installé, comme indiqué dans [Installation](../setup/). Pour Podman, ajoutez `--sandbox-provider podman` à la génération et `--engine podman` à la construction.

## Ajouter des outils de projet et reconstruire

Ajoutez paquets système et binaires en root, avant la ligne `USER` finale de la recette.

```dockerfile title=".outpost-image/Dockerfile"
RUN apt-get update && apt-get install -y --no-install-recommends make \
  && rm -rf /var/lib/apt/lists/*
USER $AGENT_UID:$AGENT_GID
```

```sh
npx outpost image build --directory .outpost-image --image outpost:dev
```

| Option           | Défaut                                    | Effet                                              |
| ---------------- | ----------------------------------------- | -------------------------------------------------- |
| `--engine`       | `docker`                                  | Construire avec `docker` ou `podman`.              |
| `--image`        | `outpost:<nom du répertoire>`             | Tag de l’image construite.                         |
| `--file`         | `Dockerfile`, `Containerfile` pour Podman | Chemin de la recette, relatif au répertoire.       |
| `--directory`    | Répertoire courant                        | Contexte de build et emplacement de la recette.    |
| `--uid`, `--gid` | Les identifiants de votre utilisateur     | Identifiants attribués à l’utilisateur de l’agent. |

:::caution
Installez les outils hors de `/home/agent`. Chaque conteneur y monte un répertoire personnel privé vierge, qui masque tout ce que l’image y avait placé.
:::

Par défaut, les conteneurs tournent avec votre UID, et le fournisseur refuse une image construite pour un autre UID. Construisez sur la machine qui exécute les workflows, ou passez `--uid` et `--gid` pour l’utilisateur cible ([`user`](../containers/) sur le fournisseur lève ce contrôle).

## Garder les identifiants hors de l’image

L’image contient des outils, jamais de connexions. À chaque exécution, Outpost copie la connexion hôte du harness ou transmet sa clé API dans le répertoire personnel privé ([Authentification](../authentication/)).

:::caution
Ne copiez pas `~/.codex`, `~/.claude`, `.env` ni des clés avec `COPY`, et ne passez aucun secret par `ARG` ou `ENV`. Les couches d’image les conservent pour quiconque peut récupérer l’image.
:::

## Mettre à jour les CLI épinglés

Chaque version d’Outpost épingle une version par CLI, exposée par `agentVersions`. `init` inscrit ces versions dans la recette.

```ts
import { agentVersions } from "@elie-laloum/outpost";

console.log(agentVersions.codex);
// Example output: 0.156.1
```

<!-- check:run -->

Le script affiche la version de Codex épinglée par l’Outpost installé. Après une mise à jour d’Outpost, générez une recette neuve avec `--no-build` dans un répertoire vide, reportez ses lignes d’installation dans la vôtre et reconstruisez.

## Vérifier l’image

`doctor` démarre un conteneur temporaire sans réseau. Il vérifie `node`, `git`, l’accès en écriture au répertoire personnel et la CLI de l’agent, et avertit si la version du CLI diffère de la version épinglée. Il n’utilise que l’image locale et ne teste pas la connexion ([Diagnostic](../diagnostics/)).

```sh
npx outpost doctor --sandbox-provider docker --agent claude --image outpost:dev
```

## Supprimer l’image

Supprimez `outpost:dev` lorsque vous n’avez plus besoin de cette image. La commande la retire du moteur de conteneurs local, indépendamment des branches Git conservées.

```sh
npx outpost image remove --image outpost:dev
```

Ajoutez `--engine podman` pour Podman. Les volumes de cache de dépendances sont distincts et restent en place ([Préparer l’environnement](../environment-setup/)).

## Images des sandboxes distantes

Les [sandboxes cloud](../cloud-sandboxes/), [Firecracker](../firecracker/) et les conteneurs en [Git privé](../private-git/) installent un CLI manquant à la première utilisation. Si l’exécutable de l’agent n’est pas dans le `PATH`, Outpost installe sa version épinglée dans le répertoire personnel de la sandbox. Passez `bootstrap: false` dans les options de la sandbox pour exiger que l’image le fournisse.

Docker et Podman avec un checkout monté n’installent jamais de CLI : l’image doit le contenir.

## Limites

- Les versions épinglées ne couvrent que les CLI d’agent. Le tag de l’image de base et les paquets Debian sont résolus au build : deux builds peuvent différer.
- L’installation d’un CLI npm exige `npm` dans l’image distante.
- `outpost image` construit et supprime des images locales ; il ne les pousse pas vers un registre.

API : [agentVersions](../../reference/agentversions/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [SandboxOptions](../../reference/sandboxoptions/).
