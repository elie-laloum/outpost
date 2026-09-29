---
title: "Git privé"
description: "Donner à un agent Docker ou Podman sa propre copie du dépôt au lieu de votre checkout monté, et ne récupérer ses commits qu’après validation."
---

## L’activer

:::caution[Expérimental]
Git privé est un prototype à activer explicitement : son comportement peut encore changer.
:::

Définissez `repositoryMode: "isolated"` sur le provider Docker ou Podman. Le reste de votre code ne change pas.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { coder, repository } from "./outpost.config.mts";

const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  repositoryMode: "isolated",
});

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/private-fix" },
  brief: { text: "Fix the failing unit test and commit the fix." },
});
console.log(result.branch, result.commits.length);
```

Outpost copie l’historique de la branche dans le conteneur, et l’agent travaille sur cette copie. À la fin de la tâche, ses commits arrivent sur `outpost/private-fix` côté hôte.

## Ce qui change par rapport au mode monté

| Aspect                                 | Monté (par défaut)                                                   | Isolé                                                                                     |
| -------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Ce que voit le conteneur               | Votre worktree dans `/workspace` et les dossiers Git de l’hôte       | Un checkout privé dans `/tmp/outpost/workspace`, avec son propre `.git`                   |
| Retour des changements                 | Immédiat : l’agent écrit dans votre worktree                         | Après chaque dispatch, `sandbox.command()` ou session interactive, validés puis appliqués |
| Hooks, config et refs de l’hôte        | Partagés et modifiables : ce que l’agent écrit s’applique sur l’hôte | Ni copiés à l’aller ni au retour : seuls les commits et fichiers de la branche reviennent |
| Politique de branche par défaut        | `current`                                                            | `integrate` ; `current` est refusé                                                        |
| CLI de l’agent                         | Doit être dans l’image                                               | Installée dans la sandbox si elle manque ; `bootstrap: false` désactive l’installation    |
| [Spéculation durable](../speculation/) | Prise en charge                                                      | Refusée : le provider ne sait pas récupérer un conteneur abandonné                        |
| Terminal interactif                    | Pris en charge                                                       | Pris en charge ; les changements reviennent quand vous quittez                            |

`copies` et `includeUncommitted` ajoutent des entrées comme sur les [sandboxes cloud](../cloud-sandboxes/). Politiques de branche : [Dépôt et branche](../repository-and-branch/).

## Récupérer les changements sans risque

Les conteneurs isolés utilisent la même synchronisation que les sandboxes cloud. Avant d’appliquer quoi que ce soit, Outpost valide les commits et fichiers entrants et sauvegarde le worktree de l’hôte.

Si le worktree de l’hôte a changé pendant que la sandbox était active, ou si des fichiers entrants recouvrent des fichiers non commités ou ignorés de l’hôte, la synchronisation s’arrête. Vos fichiers restent intacts, et `details.recovery` dans l’erreur indique un dossier de transfert sous `.outpost/recovery/`. Inspectez-le et restaurez-le avec [Récupérer du travail](../recovery/).

## Monter des dossiers supplémentaires

`volumes` fonctionne toujours, avec trois règles :

<!-- features -->

- **Côté hôte** : Une source ne peut ni contenir ni se trouver dans le dépôt, le worktree ou les dossiers Git, même en lecture seule.
- **Côté conteneur** : Une cible ne peut pas recouvrir `/tmp` ni `/outpost` ; une cible relative se résout dans le checkout et est refusée.
- **Caches de dépendances** : Les volumes `caches` fonctionnent toujours ; Outpost les monte sous `/outpost/cache`.

```ts
import { createPodmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";

const sandboxProvider = createPodmanSandboxProvider({
  image: "outpost:dev",
  repositoryMode: "isolated",
  volumes: [{ source: "~/datasets", target: "/data", readOnly: true }],
  caches: [{ name: "npm", key: "node24" }],
});
```

## Limites

- L’isolation protège les métadonnées Git de l’hôte, pas l’hôte face à un agent hostile. Vous faites toujours confiance à l’image, au moteur de conteneurs, au noyau et à chaque montage explicite. Voir [Sécurité](../security/).
- Le code écrit par l’agent revient sur votre hôte. Relisez-le avant de l’y exécuter.
- Seuls Docker et Podman ont ce mode. Les sandboxes cloud et Firecracker travaillent toujours sur une copie ; l’exécution sur l’hôte, jamais.

API : [ContainerOptions](../../reference/containeroptions/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [Volume](../../reference/volume/).
