---
title: "Images d’agent"
description: "Construire l’image Docker ou Podman dont partent vos sandboxes : chaque CLI d’agent intégré à une version épinglée, plus les outils de votre projet."
---

## Contenu de l’image

`outpost init` écrit un `Dockerfile` (`Containerfile` pour Podman) qui vous appartient et que vous pouvez modifier.

<!-- features -->

- **Base** : `node:24-bookworm-slim` avec Git, le client OpenSSH, curl, Python 3 et les outils de processus.
- **CLI d’agent** : Claude Code, Codex, Copilot CLI et Kimi Code depuis npm, [Antigravity](../antigravity/) depuis une archive vérifiée.
  - `agentVersions`
- **Utilisateur de l’agent** : L’utilisateur `node` de l’image, renuméroté avec votre UID et votre GID.
- **Home privé** : `/home/agent`, appartenant à l’utilisateur de l’agent en mode 700, défini comme `HOME`.
- **Environnement** : Mises à jour automatiques d’Antigravity désactivées, cache de Copilot sous `/tmp/.cache`.
- **Répertoire de travail** : `/workspace`, où démarrent les commandes.

## Générer la recette

```sh
npx @elie-laloum/outpost init --yes --image outpost:dev
```

`init` écrit la recette avec le reste du projet, puis construit l’image. `--no-build` écrit seulement la recette. Sans `--image`, le nom est `outpost:<nom du répertoire>` ; le `run.ts` généré passe ce même nom au provider.

Pour ajouter Outpost à une application existante, générez la recette dans un répertoire séparé ([Installation](../setup/)).

## Ajouter des outils de projet et reconstruire

Ajoutez paquets système et binaires en root, avant la ligne `USER` finale de la recette.

```dockerfile title="Dockerfile"
RUN apt-get update && apt-get install -y --no-install-recommends make \
  && rm -rf /var/lib/apt/lists/*
USER $AGENT_UID:$AGENT_GID
```

```sh
npx outpost image build --image outpost:dev
```

| Option           | Défaut                                    | Effet                                              |
| ---------------- | ----------------------------------------- | -------------------------------------------------- |
| `--engine`       | `docker`                                  | Construire avec `docker` ou `podman`.              |
| `--image`        | `outpost:<nom du répertoire>`             | Tag de l’image construite.                         |
| `--file`         | `Dockerfile`, `Containerfile` pour Podman | Chemin de la recette, relatif au répertoire.       |
| `--directory`    | Répertoire courant                        | Contexte de build et emplacement de la recette.    |
| `--uid`, `--gid` | Les identifiants de votre utilisateur     | Identifiants attribués à l’utilisateur de l’agent. |

:::caution
Installez les outils hors de `/home/agent`. Chaque conteneur y monte un home privé vierge, qui masque tout ce que l’image y avait placé.
:::

Par défaut, les conteneurs tournent avec votre UID, et le provider refuse une image construite pour un autre UID. Construisez sur la machine qui exécute les workflows, ou passez `--uid` et `--gid` pour l’utilisateur cible ([`user`](../containers/) sur le provider lève ce contrôle).

## Garder les identifiants hors de l’image

L’image contient des outils, jamais de connexions. À chaque exécution, Outpost copie la connexion hôte du harness ou transmet sa clé API dans le home privé ([Authentification](../authentication/)).

:::caution
Ne copiez pas `~/.codex`, `~/.claude`, `.env` ni des clés avec `COPY`, et ne passez aucun secret par `ARG` ou `ENV`. Les couches d’image les conservent pour quiconque peut récupérer l’image.
:::

## Mettre à jour les CLI épinglés

Chaque version d’Outpost épingle une version par CLI, exposée par `agentVersions`. `init` inscrit ces versions dans la recette.

```ts
import { agentVersions } from "@elie-laloum/outpost";

console.log(agentVersions.codex);
```

<!-- check:run -->

Le script affiche la version de Codex épinglée par l’Outpost installé. Après une mise à jour d’Outpost, générez une recette neuve avec `--no-build` dans un répertoire vide, reportez ses lignes d’installation dans la vôtre et reconstruisez.

## Vérifier l’image

```sh
npx outpost doctor --sandbox-provider docker --agent claude --image outpost:dev
```

`doctor` démarre un conteneur temporaire sans réseau. Il vérifie `node`, `git`, l’accès en écriture au home et le CLI de l’agent, et avertit si la version du CLI diffère de la version épinglée. Il n’utilise que l’image locale et ne teste pas la connexion ([Diagnostic](../diagnostics/)).

## Supprimer l’image

```sh
npx outpost image remove --image outpost:dev
```

Ajoutez `--engine podman` pour Podman. Les volumes de cache de dépendances sont distincts et restent en place ([Préparer l’environnement](../environment-setup/)).

## Images des sandboxes distantes

Les [sandboxes cloud](../cloud-sandboxes/), [Firecracker](../firecracker/) et les conteneurs en [Git privé](../private-git/) installent un CLI manquant à la première utilisation. Si l’exécutable de l’agent n’est pas dans le `PATH`, Outpost installe sa version épinglée dans le home de la sandbox. Passez `bootstrap: false` dans les options de la sandbox pour exiger que l’image le fournisse.

Docker et Podman avec un checkout monté n’installent jamais de CLI : l’image doit le contenir.

## Limites

- Les versions épinglées ne couvrent que les CLI d’agent. Le tag de l’image de base et les paquets Debian sont résolus au build : deux builds peuvent différer.
- L’installation d’un CLI npm exige `npm` dans l’image distante.
- `outpost image` construit et supprime des images locales ; il ne les pousse pas vers un registre.

API : [agentVersions](../../reference/agentversions/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [SandboxOptions](../../reference/sandboxoptions/).
