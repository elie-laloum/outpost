---
title: "Podman"
description: "Exécuter des agents dans des conteneurs Podman."
---

Démarrez Podman et construisez l’image avec `outpost init --yes --sandbox-provider podman --image outpost:dev`. Passez le fournisseur à `dispatch()` ou `createSandbox()`.

```ts
import { podmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";

const sandboxProvider = podmanSandboxProvider({
  image: "outpost:dev",
  cpus: 2,
  memoryMb: 4096,
});
```

## Accès au dépôt

Le mode par défaut monte le checkout et les métadonnées Git nécessaires. Les modifications sont visibles via ces montages. Un home privé éphémère contient la configuration de l’agent et la copie des identifiants.

Pour une exécution rootless, vérifiez la correspondance UID/GID et les permissions des montages hôte. `userns` choisit le comportement keep-id ; `label` contrôle le réétiquetage SELinux (`z`, `Z` ou false). Adaptez-les à l’hôte plutôt que de modifier largement les permissions du dépôt.

## Personnaliser l’environnement

`volumes` ajoute des chemins hôte explicites, éventuellement en lecture seule. `user` sélectionne UID/GID ; `groups` ajoute des groupes. `networks` connecte des réseaux du moteur ; ce n’est pas une liste de domaines autorisés. Utilisez les [règles de sortie](../outbound-rules/) pour les restrictions prises en charge.

Utilisez les [volumes de dépendances](../persistent-caches/) pour les caches de paquets et [Git privé](../private-git/) pour éviter le montage des métadonnées Git hôte. Ces options ont des durées de vie et règles de propriété distinctes.

Le fournisseur ne bascule jamais vers une exécution hôte si le moteur ou l’image manque. Lancez les [contrôles préalables](../preflight-checks/) pour diagnostiquer la configuration.

API : [podmanSandboxProvider](../../reference/podmansandboxprovider/) · [ContainerOptions](../../reference/containeroptions/).
