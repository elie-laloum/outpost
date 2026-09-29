---
title: "Volumes de dépendances"
description: "Réutiliser les téléchargements de paquets entre conteneurs."
---

Les caches de dépendances des conteneurs réutilisent des volumes gérés par le moteur entre allocations de sandboxes. Ils conservent les données des caches de paquets indépendamment du home privé de l’agent.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  caches: [{ name: "npm", key: "application-node24" }],
  variables: { npm_config_cache: "/outpost/cache/npm" },
});
```

Choisissez une clé stable pour les projets et versions de runtime compatibles. Changez-la lorsque la compatibilité du cache évolue. Le nom identifie `/outpost/cache/<name>` ; `npm_config_cache` dirige npm vers ce cache monté. Les volumes dépendent du dépôt, de l’image, de l’utilisateur et de la clé.

## L’installation reste nécessaire

Un cache de téléchargement ne signifie pas que les dépendances du projet sont installées. Gardez `npm ci` ou la commande d’installation du gestionnaire dans `sandboxReady`. Le gestionnaire valide le lockfile et réutilise les téléchargements compatibles.

## Propriété

Fermer une sandbox ne supprime pas le volume de cache. Gérez sa rétention avec le moteur de conteneurs. Gardez les identifiants et conversations natives hors des caches partagés. Un cache commun à plusieurs projets partage aussi leur capacité à en affecter le contenu.

API : [ContainerOptions](../../reference/containeroptions/) · [DependencyCache](../../reference/dependencycache/).
