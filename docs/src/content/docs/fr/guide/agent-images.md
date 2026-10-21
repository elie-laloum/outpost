---
title: "Images d’agent"
description: "Utilisez, personnalisez et vérifiez les images Docker et Podman officielles de chaque agent."
---

## Choisir une image

Outpost fournit une image par CLI d’agent, plus une image `harness` pour la [boucle d’agent intégrée](../harness/). Chaque image ne contient que ce dont son agent a besoin : vous construisez ou téléchargez une image par agent utilisé.

<!-- features -->

- **`harness`** : Node.js, Git, le client OpenSSH et les outils de processus, sans CLI d’agent.
- **`codex`, `claude`, `copilot`, `kimi`** : Les outils du harness plus une CLI npm, installée depuis un lockfile versionné.
- **`antigravity`** : Les outils du harness plus [Antigravity](../antigravity/), téléchargé depuis une archive vérifiée en SHA-512.
- **Base** : `node:24-bookworm-slim`, épinglée par digest.
- **Utilisateur et répertoire personnel** : L’utilisateur `node`, renuméroté avec votre UID et votre GID, avec un `/home/agent` privé (mode 700) comme `HOME` ; les commandes démarrent dans `/workspace`.

Listez les images et les références épinglées par votre version d’Outpost :

```sh
npx outpost image list
```

## Construire une image sur votre machine

Écrivez la recette officielle dans un dossier, puis construisez-la pour votre utilisateur. `image eject` écrit le `Dockerfile` (`Containerfile` avec `--engine podman`), le lockfile de la CLI et un `.dockerignore`. Il écrit dans le dossier courant sauf avec `--directory`, et n’écrase jamais de fichier sans `--force`.

```sh
npx outpost image eject --image codex --directory images/codex
npx outpost image build --directory images/codex --tag outpost-codex:dev
```

La première construction télécharge la CLI de l’agent et peut prendre plusieurs minutes. Utilisez le tag dans votre fournisseur de sandbox :

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost-codex:dev",
});
```

Pour Podman, ajoutez `--engine podman` aux deux commandes et utilisez `createPodmanSandboxProvider`.

## Ajouter les outils du projet

La recette éjectée vous appartient. Ajoutez les paquets système et binaires en root, à la ligne indiquée avant le `USER` final, puis reconstruisez.

```dockerfile title="images/codex/Dockerfile"
# Add project tools here, as root, before the USER line.
RUN apt-get update && apt-get install -y --no-install-recommends make \
  && rm -rf /var/lib/apt/lists/*
USER $AGENT_UID:$AGENT_GID
```

:::caution
Installez les outils hors de `/home/agent`. Chaque conteneur y monte un répertoire personnel privé neuf, qui masque ce que l’image y a placé.
:::

Les conteneurs s’exécutent par défaut avec votre UID, et le fournisseur refuse une image construite pour un autre UID. `image build` utilise vos identifiants ; passez `--uid` et `--gid` pour construire pour un autre utilisateur ([`user`](../containers/) sur le fournisseur désactive la vérification).

## Télécharger une image publiée

Les images publiées sont construites et testées par le workflow `Images` du dépôt pour Linux amd64 et arm64, puis signées par une attestation de provenance GitHub. Elles utilisent l’UID et le GID `1000`, qui correspondent à l’utilisateur par défaut de la plupart des machines Linux.

```sh
npx outpost image pull --image codex
npx outpost image verify --image codex
```

`image pull` utilise le digest enregistré par votre version d’Outpost, ou le tag correspondant à sa version si aucun digest n’est enregistré. `image verify` nécessite la [CLI GitHub](https://cli.github.com/) et vérifie que le digest a été construit par le workflow officiel de ce dépôt. Si votre UID n’est pas `1000`, éjectez et construisez l’image.

:::note
La publication des images est implémentée mais attend sa première exécution vérifiée. Tant que `outpost image list` n’affiche pas de digest, construisez l’image localement comme ci-dessus.
:::

## Garder les identifiants hors de l’image

L’image contient des outils, jamais de connexions. À chaque exécution, Outpost copie la connexion du harness présente sur l’hôte ou transmet sa clé d’API dans le répertoire personnel privé ([Authentification](../authentication/)).

:::caution
Ne copiez pas `~/.codex`, `~/.claude`, `.env` ou des clés dans la recette avec `COPY`, et ne transmettez aucun secret par `ARG` ou `ENV`. Les couches de l’image les conservent pour quiconque peut la télécharger.
:::

## Mettre à jour les CLI épinglées

Chaque version d’Outpost épingle une version par CLI, exposée par `agentVersions`. Les recettes et lockfiles officiels installent exactement ces versions.

```ts
import { agentVersions } from "@elie-laloum/outpost/integrations";

console.log(agentVersions.codex);
// Exemple de sortie : 0.156.1
```

<!-- check:run -->

Le script affiche la version de Codex épinglée par votre Outpost. Après une mise à jour d’Outpost, éjectez de nouveau l’image avec `--force` dans un dossier neuf, reportez vos lignes de projet et reconstruisez.

## Vérifier l’image

`doctor` démarre un conteneur temporaire sans réseau. Il vérifie `node`, `git`, le répertoire personnel accessible en écriture et la CLI de l’agent, et avertit lorsque la version de la CLI diffère de la version épinglée. Un nom d’image officielle sélectionne sa référence publiée et son agent ; seules les images locales sont utilisées et la connexion n’est pas testée ([Diagnostic](../diagnostics/)).

```sh
npx outpost doctor --agent codex --image outpost-codex:dev
```

## Supprimer une image

Supprimez une image locale lorsque vous n’en avez plus besoin. Les volumes de cache de dépendances sont distincts et restent en place ([Préparer l’environnement](../environment-setup/)).

```sh
npx outpost image remove --image outpost-codex:dev
```

## Images des sandboxes distantes

Les [sandboxes cloud](../cloud-sandboxes/), [Firecracker](../firecracker/) et les conteneurs à [Git privé](../private-git/) installent une CLI manquante à la première utilisation. Lorsque l’exécutable de l’agent n’est pas dans le `PATH`, Outpost installe sa version épinglée dans le répertoire personnel de la sandbox. Définissez `bootstrap: false` dans les options de sandbox pour exiger que l’image la fournisse.

Docker et Podman avec un dépôt monté n’installent jamais de CLI : l’image doit la contenir.

## Limites

- La base est épinglée par digest, mais les paquets Debian sont résolus à la construction : deux constructions locales peuvent différer. Les images publiées sont les octets testés.
- L’installation d’une CLI npm nécessite `npm` dans l’image distante.
- `outpost image` ne pousse pas d’image vers un registre.

API : [agentVersions](../../reference/agentversions/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [SandboxOptions](../../reference/sandboxoptions/).

Les UID/GID zéro sont acceptés pour des images root choisies explicitement. Root dispose de plus de privilèges dans le conteneur ; choisissez un UID non nul pour le travail normal des agents. Cette option ne fait pas des métadonnées Git montées une frontière de sécurité.

## Remplacer l’ancienne image commune

Outpost 12 retire `outpost init` et l’image commune `agents`. Conservez vos workflows TypeScript, installez `@elie-laloum/outpost` dans leur projet et générez puis construisez l’image de chaque CLI utilisée. Remplacez le champ `image` de chaque fournisseur de sandbox par le tag obtenu. Pour démarrer une recette YAML, utilisez `outpost recipe init`.
