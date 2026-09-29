---
title: "Docker et Podman"
description: "Exécuter les agents dans des conteneurs Docker ou Podman locaux."
---

Démarrez Docker et construisez une [image d’agent](../agent-images/). Passez le fournisseur à `dispatch()` ou `createSandbox()`.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  cpus: 2,
  memoryMb: 4096,
});
```

## Accès au dépôt

Le mode par défaut monte le checkout et les métadonnées Git nécessaires. Les modifications sont visibles via ces montages. Un home privé éphémère contient la configuration de l’agent et la copie des identifiants.

Docker abandonne les capacités, utilise no-new-privileges et crée un home privé. Le socket Docker n’est pas monté par défaut. Les montages, périphériques et réseaux supplémentaires étendent les accès.

## Personnaliser l’environnement

`volumes` ajoute des chemins hôte explicites, éventuellement en lecture seule. `user` sélectionne UID/GID ; `groups` ajoute des groupes. `networks` connecte des réseaux du moteur ; ce n’est pas une liste de domaines autorisés. Utilisez les [règles de sortie](../network-restrictions/) pour les restrictions prises en charge.

Utilisez les [volumes de dépendances](../environment-setup/) pour les caches de paquets et [Git privé](../private-git/) pour éviter le montage des métadonnées Git hôte. Ces options ont des durées de vie et règles de propriété distinctes.

Le fournisseur ne bascule jamais vers une exécution hôte si le moteur ou l’image manque. Lancez les [contrôles préalables](../diagnostics/) pour diagnostiquer la configuration.

API : [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [ContainerOptions](../../reference/containeroptions/).

## Podman

Démarrez Podman et construisez l’image avec `outpost init --yes --sandbox-provider podman --image outpost:dev`. Passez le fournisseur à `dispatch()` ou `createSandbox()`.

```ts
import { createPodmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";

const sandboxProvider = createPodmanSandboxProvider({
  image: "outpost:dev",
  cpus: 2,
  memoryMb: 4096,
});
```

### Accès au dépôt

Le mode par défaut monte le checkout et les métadonnées Git nécessaires. Les modifications sont visibles via ces montages. Un home privé éphémère contient la configuration de l’agent et la copie des identifiants.

Pour une exécution rootless, vérifiez la correspondance UID/GID et les permissions des montages hôte. `userns` choisit le comportement keep-id ; `label` contrôle le réétiquetage SELinux (`z`, `Z` ou false). Adaptez-les à l’hôte plutôt que de modifier largement les permissions du dépôt.

### Personnaliser l’environnement

`volumes` ajoute des chemins hôte explicites, éventuellement en lecture seule. `user` sélectionne UID/GID ; `groups` ajoute des groupes. `networks` connecte des réseaux du moteur ; ce n’est pas une liste de domaines autorisés. Utilisez les [règles de sortie](../network-restrictions/) pour les restrictions prises en charge.

Utilisez les [volumes de dépendances](../environment-setup/) pour les caches de paquets et [Git privé](../private-git/) pour éviter le montage des métadonnées Git hôte. Ces options ont des durées de vie et règles de propriété distinctes.

Le fournisseur ne bascule jamais vers une exécution hôte si le moteur ou l’image manque. Lancez les [contrôles préalables](../diagnostics/) pour diagnostiquer la configuration.

API : [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [ContainerOptions](../../reference/containeroptions/).
