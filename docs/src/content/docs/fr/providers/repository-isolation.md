---
title: Isolation du dépôt
description: Métadonnées Git privées sur activation pour Docker et Podman.
sidebar:
  order: 4
---

`repositoryMode: "isolated"` est un prototype sur activation pour Docker et Podman. Chaque conteneur reçoit son checkout et son répertoire Git privés dans `/outpost/workspace`. Le checkout hôte et les métadonnées Git partagées ne sont pas montés. Le mode `"mounted"` par défaut conserve son comportement.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

await using sandbox = await createSandbox({
  repository: "/path/to/repository",
  provider: docker({
    image: "outpost:project",
    repositoryMode: "isolated",
    networks: "none",
  }),
  branch: { mode: "named", name: "isolated-work" },
});
const result = await sandbox.command({
  executable: "git",
  arguments: ["status", "--short"],
});
console.log(result.stdout);
```

Construisez d’abord [l’image du conteneur](../agent-images/). Omettez `networks: "none"` si la tâche nécessite le réseau, notamment les API de modèles. Configurez l’authentification avec les [guides des agents](../../agents/connect-codex/) ; le home reste privé et éphémère. L’image, le moteur et les identifiants explicites restent des entrées de confiance.

## Synchronisation et propriété

Le provider annonce `placement: "remote"` pour utiliser le pipeline existant de transfert de bundles, vérification de l’historique reçu, sauvegarde hôte et synchronisation. L’exécution reste sur votre moteur de conteneurs local. Utilisez un workspace nommé ou d’intégration ; `branch: { mode: "current" }` est refusé. Une branche omise utilise l’intégration par défaut, comme les providers distants. Aucun push distant n’est automatique.

Commandes, dispatch et attachement synchronisent via le cycle de vie applicatif. Les commits invités et modifications prises en charge reviennent dans le workspace hôte ; les hooks, la configuration Git et les refs indépendantes de l’invité ne sont pas importés. L’invité démarre avec l’historique commité sauf si `includeUncommitted` est activé. Les fichiers déjà modifiés sont protégés ; des modifications hôte concurrentes arrêtent la synchronisation et conservent les [artefacts de récupération](../../operations/recovery/). Un lease brut alloue seulement l’environnement ; utilisez `createSandbox` ou une sandbox de workspace pour initialiser et synchroniser le dépôt.

Le workspace et le conteneur ont des durées de vie distinctes. Les commandes à chaud réutilisent le checkout privé. Fermer la sandbox supprime le stockage du conteneur ; les workspaces récupérables et artefacts d’échec suivent les règles existantes de libération. Une sandbox possède un dépôt, sans transaction Git entre dépôts.

## Montages et limites

Les sources de montages explicites ne doivent pas recouvrir les chemins canoniques du dépôt hôte, du workspace ou des répertoires Git, même en lecture seule. Les alias symboliques et répertoires parents sont contrôlés. Les cibles explicites ne doivent pas recouvrir `/outpost` ou `/tmp`, parents et descendants inclus. Montez les entrées externes ailleurs, par exemple dans `/inputs` ; les fichiers montés dans le home restent possibles. Les [caches de dépendances](../dependency-caches/) utilisent des volumes distincts générés par le moteur sous `/outpost/cache`, jamais des répertoires Git hôte.

Ce prototype réduit l’exposition des métadonnées Git hôte en écriture. Ce n’est pas une frontière certifiée contre les agents hostiles ou les évasions de conteneurs. Faites confiance à l’image et au moteur, évitez de remplacer les chemins hôte pendant l’allocation et examinez chaque montage, périphérique, identifiant et cache partagé explicite. Le réseau peut exposer services et identifiants indépendamment de l’isolation des fichiers. Le code synchronisé sur l’hôte peut rester dangereux lorsqu’il y est exécuté. Limites de ressources, annulation, sessions TTY et transferts binaires conservent leur comportement habituel.
