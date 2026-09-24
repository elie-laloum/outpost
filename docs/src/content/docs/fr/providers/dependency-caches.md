---
title: Caches de dépendances
description: Réutiliser les téléchargements de paquets entre sandboxes Docker et Podman.
sidebar:
  order: 3
---

Docker et Podman acceptent l'option explicite `caches` dans leur configuration. Chaque cache est un volume persistant du moteur, monté dans `/outpost/cache/<name>`. Sans cette option, Outpost ne crée aucun cache persistant de dépendances. Vercel, Daytona et `local()` n'implémentent pas cette option ; utilisez séparément leurs capacités explicites de système de fichiers.

## Mettre en cache les téléchargements

Choisissez une clé à partir du lockfile, de la version du gestionnaire de paquets, de l'architecture cible et des autres entrées modifiant le format du cache. Outpost n'inspecte pas les lockfiles et n'invalide pas automatiquement les clés. Cet exemple calcule explicitement l'empreinte du lockfile, résolu depuis le dépôt cible indépendamment du répertoire du workflow.

```ts
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createSandbox, codex } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

const repository = "/path/to/repository";
const lock = await readFile(join(repository, "package-lock.json"));
const key = `npm-v11-linux-amd64-${createHash("sha256").update(lock).digest("hex")}`;
const box = await createSandbox({
  repository,
  agent: codex(),
  provider: docker({
    image: "outpost:project",
    caches: [{ name: "npm", key }],
    variables: { NPM_CONFIG_CACHE: "/outpost/cache/npm" },
  }),
});
try {
  const result = await box.command({ executable: "npm", arguments: ["ci"] });
  if (result.status !== 0) throw new Error(result.stderr);
} finally {
  await box.close();
}
```

Pour Podman, remplacez la fabrique et l'import par `podman` depuis `@elie-laloum/outpost/providers/podman`. Le même contrat s'applique à Podman rootless avec sa correspondance d'utilisateurs du conteneur.

| Outil | Déclaration du cache    | Configuration dans la sandbox                  |
| ----- | ----------------------- | ---------------------------------------------- |
| npm   | `{ name: "npm", key }`  | `NPM_CONFIG_CACHE=/outpost/cache/npm`          |
| pnpm  | `{ name: "pnpm", key }` | `pnpm install --store-dir /outpost/cache/pnpm` |
| pip   | `{ name: "pip", key }`  | `PIP_CACHE_DIR=/outpost/cache/pip`             |
| uv    | `{ name: "uv", key }`   | `UV_CACHE_DIR=/outpost/cache/uv`               |

Installez d'abord l'outil choisi dans votre image. Mettez en cache les paquets téléchargés, les wheels ou les stores ; conservez les installations du projet comme `node_modules` dans le workspace. Ne redirigez pas `HOME`, `CODEX_HOME`, la configuration des agents ou leurs fichiers d'authentification vers un cache de dépendances.

## Propriétaire, isolation et invalidation

Les noms comportent au plus 48 lettres minuscules, chiffres ou tirets et commencent par une lettre. Les clés sont des chaînes non vides de 1024 caractères maximum. Les noms dupliqués et les montages explicites recouvrant `/outpost/cache` sont rejetés.

L'identité du volume est l'empreinte du chemin canonique du dépôt, de la référence d'image, de l'UID/GID du conteneur, du nom et de la clé du cache, avec une version de format. Les branches d'un même dépôt réutilisent donc un cache ; les autres dépôts, utilisateurs, images ou clés obtiennent d'autres volumes. Docker et Podman conservent leurs volumes dans des stockages distincts. Un tag d'image mutable garde la même identité après reconstruction : utilisez une image référencée par digest ou changez la clé lorsque les outils changent.

Activer les caches ajoute la capacité `CHOWN` à l'ensemble de capacités autrement supprimées, comme pour les montages de fichiers imbriqués existants. Outpost initialise uniquement la racine du volume avec l'UID/GID demandé et le mode `0700`, sans modifier récursivement les fichiers. Changer l'UID/GID crée un volume neuf. Le home privé de l'agent reste un tmpfs éphémère distinct. Aucun identifiant ni fichier du home n'est copié dans le volume lors de son initialisation. Les fichiers explicitement écrits par vos commandes dans un cache y restent : leur contenu doit convenir à toutes les tâches partageant cette clé.

Les leases simultanés ayant la même identité partagent un cache accessible en écriture. Outpost ne sérialise pas les écritures des gestionnaires de paquets : utilisez un outil dont le cache accepte les écritures concurrentes ou des clés distinctes par job. Le cache optimise les performances ; il ne protège pas l'intégrité contre une autre tâche utilisant la même clé.

Changer la clé sélectionne un cache vide et conserve l'ancien volume. Fermer la sandbox, échouer pendant l'allocation ou annuler une commande ne supprime pas les données persistantes. Aucune éviction automatique n'est prévue. Le propriétaire du moteur gère l'espace disque et supprime les volumes après fermeture des leases actifs.

```sh
docker volume ls --filter label=io.outpost.cache=true
docker volume inspect EXACT_VOLUME_NAME
docker volume rm EXACT_VOLUME_NAME
```

Utilisez les commandes `podman volume` équivalentes pour Podman. Inspectez et supprimez les volumes individuellement, sans nettoyer les ressources étrangères. Les [images d'agents préconstruites](../agent-images/) réduisent aussi le temps de préparation.
