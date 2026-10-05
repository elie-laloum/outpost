---
title: "Utiliser Docker ou Podman"
description: "Configurez les conteneurs locaux, les montages du dépôt et l’utilisateur qui exécute les commandes."
---

## Prérequis

<!-- features -->

- **Docker ou Podman** : Installé et démarré. Sur macOS, démarrez une machine Podman avec `podman machine start`.
- [Une image d’agent](../agent-images/) : Contient les outils des agents que vous comptez utiliser.
- **Un dépôt Git** : Le checkout que le conteneur monte.

Avant de lancer une tâche, vérifiez que le moteur de conteneurs répond et que l’image des agents est disponible :

```sh
npx outpost doctor --sandbox-provider docker --image outpost:dev
```

## Configurer

Les deux fournisseurs acceptent les mêmes options. Passez le fournisseur à `dispatch()`, `createSandbox()` ou à n’importe quelle tâche de workflow.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  cpus: 2,
  memoryMb: 4096,
});
```

```ts
import { createPodmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";

export const sandboxProvider = createPodmanSandboxProvider({
  image: "outpost:dev",
  cpus: 2,
  memoryMb: 4096,
});
```

Chaque allocation démarre un nouveau conteneur à partir de l’image. Fermer la sandbox le supprime.

Référence API : [ContainerOptions](../../reference/containeroptions/), [Volume](../../reference/volume/) et [DependencyCache](../../reference/dependencycache/).

## Accès au dépôt

Le conteneur monte le checkout de la tâche sur `/workspace` et les métadonnées Git du dépôt sous `/outpost/git`. Les modifications et commits de l’agent arrivent directement sur l’hôte, dans le worktree préparé par Outpost.

<!-- features -->

- **Répertoire personnel privé** : `/home/agent` est un tmpfs, supprimé avec le conteneur. Le harness y copie les [identifiants](../authentication/) de l’agent.
- **Privilèges réduits** : Les capacités Linux sont retirées (`CHOWN` reste quand les caches, les montages de fichiers ou le Git privé en ont besoin) et `no-new-privileges` est activé.
- **Aucun accès au moteur** : Le socket Docker ou Podman n’est jamais monté.

Pour exposer d’autres chemins hôte, ajoutez des `volumes`. Une `source` relative part du dépôt ; une `target` qui commence par `~/` arrive dans le répertoire personnel de l’agent, toute autre `target` relative sous `/workspace`.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  volumes: [{ source: "~/datasets", target: "/data", readOnly: true }],
});
```

Chaque montage, périphérique ou réseau ajouté élargit ce que l’agent peut atteindre. Pour garder les métadonnées Git de l’hôte hors du conteneur, utilisez le [Git privé](../private-git/).

## Podman

Podman rootless associe votre utilisateur hôte au conteneur avec `--userns keep-id` : les fichiers écrits par l’agent restent à vous. Définissez `userns: false` pour laisser la correspondance à votre configuration Podman. Quand Podman tourne en root, définissez `userns: "keep-id"` pour la demander.

Choisissez le marquage SELinux adapté à votre hôte plutôt que de réduire les protections du dépôt.

Référence API : [ContainerOptions](../../reference/containeroptions/).

`outpost init --sandbox-provider podman` écrit un `Containerfile` au lieu d’un `Dockerfile`.

## Limites

- Le fournisseur ne bascule jamais vers une exécution sur l’hôte. Si le moteur ou l’image manque, l’allocation échoue ; lancez les [Diagnostics](../diagnostics/).
- L’image doit fournir `sh`, `setsid`, `kill`, `tar` et `cp`. Les images générées les fournissent.
- Si l’image déclare un utilisateur numérique différent de l’UID demandé, l’allocation échoue. Reconstruisez l’image avec votre UID ou définissez `user`.
- `egress` n’accepte que `deny-all`. Une liste de domaines autorisés demande une [sandbox cloud](../cloud-sandboxes/) ou un pare-feu externe.
- Un fichier isolé ne peut être monté que dans le répertoire personnel de l’agent ; montez son dossier pour les autres destinations.
- Le checkout et les métadonnées Git montés sont accessibles en écriture : ce n’est pas une frontière contre un agent hostile ([Sécurité](../security/)).

API : [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [ContainerOptions](../../reference/containeroptions/) · [Volume](../../reference/volume/) · [DependencyCache](../../reference/dependencycache/).
