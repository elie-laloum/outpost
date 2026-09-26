---
title: "Git privé"
description: "Exécuter avec un checkout et un dossier Git privés dans le conteneur."
---

:::note[Expérimental]
Le mode Git privé est un prototype d’isolation de conteneur activé explicitement.
:::

Définissez `repositoryMode: "isolated"` sur Docker ou Podman pour éviter le montage du checkout et des métadonnées Git hôte.

```ts
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = dockerSandboxProvider({
  image: "outpost:dev",
  repositoryMode: "isolated",
});
```

Outpost transfère l’historique dans un checkout privé et valide la synchronisation en retour. Les hooks, configuration et références sans rapport de l’hôte ne sont pas recopiés. Des modifications concurrentes de l’hôte peuvent toujours arrêter la synchronisation.

## Contraintes de montage

Les montages explicites chevauchant dépôt canonique, worktree, dossiers Git ou chemins de contrôle du conteneur sont rejetés, même en lecture seule. Les volumes de cache de dépendances restent séparés.

Ce mode ne certifie pas une isolation face à un agent hostile ni une protection contre les évasions de conteneur. Faites confiance à l’image, au moteur, au noyau et aux montages externes explicites. Il ne rend pas non plus le code du projet sûr à exécuter ensuite sur l’hôte.

Voir [Récupérer les changements](../failure-recovery/) pour une synchronisation interrompue et la [roadmap](../../project/roadmap/) pour les prérequis de validation réelle restants.

API : [ContainerOptions](../../reference/containeroptions/).
