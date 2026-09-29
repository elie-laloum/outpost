---
title: "Préparer l’environnement"
description: "Installer les dépendances avant le travail de l’agent et réutiliser les téléchargements de paquets."
---

Passez `hooks` dans les options du workspace ou de la sandbox pour lancer des commandes de préparation. Elles s’exécutent dans l’ordre déclaré ; une commande échouée arrête la préparation.

```ts
import type { LifecycleHooks } from "@elie-laloum/outpost";

const hooks: LifecycleHooks = {
  workspaceReady: [{ executable: "git", arguments: ["status", "--short"] }],
  sandboxReady: [{ executable: "npm", arguments: ["ci"] }],
};
```

## Choisir le lieu d’exécution

| Hook             | Exécution                                            |
| ---------------- | ---------------------------------------------------- |
| `workspaceReady` | Sur l’hôte après préparation du workspace Git.       |
| `hostReady`      | Sur l’hôte pendant la préparation de la sandbox.     |
| `sandboxReady`   | Dans la sandbox allouée avant le travail de l’agent. |

Installez les dépendances du projet dans `sandboxReady` pour correspondre à l’environnement d’exécution. Utilisez `workspaceReady` pour une préparation sur l’hôte liée à la durée de vie du workspace.

Une sandbox chaude ne rejoue pas la préparation avant chaque tour. Une allocation à froid la rejoue. Mettez en cache les téléchargements de paquets avec les [volumes de dépendances](../environment-setup/) lorsque les installations répétées coûtent cher.

Ces hooks exécutent des commandes. Ceux de la boucle de modèle interceptent les appels d’outils et les événements du modèle : voir [Politiques des outils](../harness-permissions/).

API : [LifecycleHooks](../../reference/lifecyclehooks/).

## Volumes de dépendances

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

### L’installation reste nécessaire

Un cache de téléchargement ne signifie pas que les dépendances du projet sont installées. Gardez `npm ci` ou la commande d’installation du gestionnaire dans `sandboxReady`. Le gestionnaire valide le lockfile et réutilise les téléchargements compatibles.

### Propriété

Fermer une sandbox ne supprime pas le volume de cache. Gérez sa rétention avec le moteur de conteneurs. Gardez les identifiants et conversations natives hors des caches partagés. Un cache commun à plusieurs projets partage aussi leur capacité à en affecter le contenu.

API : [ContainerOptions](../../reference/containeroptions/) · [DependencyCache](../../reference/dependencycache/).
