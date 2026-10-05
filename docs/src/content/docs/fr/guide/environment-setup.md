---
title: "Préparer l’environnement de l’agent"
description: "Installez les dépendances du projet avant de lancer l’agent et réutilisez les caches de téléchargement."
---

## Installer les dépendances avant le travail de l’agent

Utilisez le hook `sandboxReady` pour installer les dépendances du projet avant de lancer l’agent. La commande s’exécute dans la sandbox préparée : l’agent dispose donc des paquets installés pendant sa tâche.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/fix-tests" },
  hooks: {
    sandboxReady: [{ executable: "npm", arguments: ["ci"] }],
  },
  brief: { text: "Run the tests and fix the first failure." },
});
console.log(result.text);
```

`npm ci` s’exécute dans la sandbox, à la racine du dépôt. L’agent démarre avec `node_modules` déjà installé. `createSandbox()` et `openWorkspace()` acceptent les mêmes `hooks` ; `speculate()` les reçoit sous `sandbox`.

## Choisir où s’exécute chaque hook

Référence API : [LifecycleHooks](../../reference/lifecyclehooks/).

`hostReady` et `sandboxReady` s’exécutent en même temps. Installez les dépendances dans `sandboxReady` : elles correspondent alors au système et à l’architecture de la sandbox.

:::caution
Les commandes de `sandboxReady` démarrent ensemble. Enchaînez les étapes dépendantes dans une seule commande : `{ executable: "sh", arguments: ["-c", "npm ci && npm run build"] }`.
:::

Chaque entrée est une [commande](../sandbox-sessions/) : `executable`, `arguments` et, au besoin, `directory`, `variables` et `deadlineMs`. Ces hooks préparent l’environnement ; pour intercepter les appels d’outils de l’agent, voir [Permissions et hooks](../harness-permissions/).

## Préparer une fois pour plusieurs tours

Une sandbox exécute ses hooks une seule fois, à son allocation. `sandbox.dispatch()`, `sandbox.resume()` et `sandbox.command()` réutilisent l’environnement préparé. Chaque `dispatch()` de premier niveau alloue une sandbox neuve et les rejoue.

Un workspace ouvert par `openWorkspace()` exécute `workspaceReady` une fois, à l’ouverture. Il exécute `hostReady` et `sandboxReady` pour chaque sandbox qu’il crée, sauf si cette sandbox passe ses propres `hooks`, qui remplacent ceux du workspace.

## Réutiliser les téléchargements entre conteneurs

Les fournisseurs Docker et Podman acceptent `caches` : des volumes nommés qui survivent au conteneur. Dirigez votre gestionnaire de paquets vers le répertoire monté.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  caches: [{ name: "npm", key: "node24" }],
  variables: { npm_config_cache: "/outpost/cache/npm" },
});
```

Chaque cache est monté sur `/outpost/cache/<name>` et appartient à l’utilisateur du conteneur. La sandbox suivante qui utilise la même clé y retrouve les téléchargements. Changez `key` quand le contenu en cache n’est plus compatible, par exemple après une mise à jour du moteur d’exécution.

| Gestionnaire de paquets | Variable            |
| ----------------------- | ------------------- |
| npm                     | `npm_config_cache`  |
| Yarn                    | `YARN_CACHE_FOLDER` |
| pip                     | `PIP_CACHE_DIR`     |
| Modules Go              | `GOMODCACHE`        |

Gardez la commande d’installation dans `sandboxReady`. Le cache conserve les téléchargements, pas le projet installé : le gestionnaire vérifie toujours le lockfile et remplit `node_modules`.

## Gérer les volumes de cache

Un volume est partagé par les sandboxes qui ont le même dépôt, la même image, le même utilisateur de conteneur, le même nom de cache et la même clé. La fermeture d’une sandbox et `outpost image remove` le conservent. Outpost pose le label `io.outpost.cache=true` sur ses volumes :

```sh
docker volume ls --filter label=io.outpost.cache=true
docker volume rm $(docker volume ls -q --filter label=io.outpost.cache=true)
```

Podman accepte les mêmes commandes avec `podman`.

## Limites

- Les autres fournisseurs n’ont pas de `caches` : `sandboxReady` retélécharge tout à chaque allocation.
- Chaque commande de hook s’arrête après 10 minutes, sauf si vous fixez `deadlineMs`.
- Une commande qui se termine avec un statut non nul rejette avec une `OutpostError` de code `process`, arrête les autres commandes de préparation et libère la sandbox. Voir [Erreurs](../error-handling/).
- Les commandes s’exécutent sans shell. Appelez `sh -c` pour les pipes et `&&`.
- Un nom de cache commence par une lettre minuscule et compte au plus 48 lettres minuscules, chiffres ou tirets. Les `volumes` explicites ne peuvent pas chevaucher `/outpost/cache`.
- Toute sandbox qui monte un cache peut en modifier le contenu, et les sandboxes suivantes le lisent. Gardez les identifiants hors des caches ([Sécurité](../security/)).

API : [dispatch](../../reference/dispatch/) · [createSandbox](../../reference/createsandbox/) · [openWorkspace](../../reference/openworkspace/) · [LifecycleHooks](../../reference/lifecyclehooks/) · [Command](../../reference/command/) · [ContainerOptions](../../reference/containeroptions/) · [DependencyCache](../../reference/dependencycache/).
