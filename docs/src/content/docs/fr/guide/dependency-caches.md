---
title: "Réutiliser les téléchargements de dépendances"
description: "Accélérez les exécutions répétées en gardant une installation explicite."
---

Partez de [Préparer l’environnement de l’agent](../environment-setup/) et de sa configuration. Accélérez les exécutions répétées en gardant une installation explicite.

Gardez les secrets hors des caches : une sandbox peut modifier ce que les suivantes reliront. Le cache conserve des téléchargements ; `npm ci` doit toujours installer les dépendances. Local et Firecracker n’exposent pas `caches`.

## Réinstaller seulement quand les fichiers changent

Ajoutez `when: changed(["package-lock.json"])` pour vérifier le contenu avant chaque `sandbox.command()`, `dispatch()` (y compris resume et fork) ou `attach()`. La première préparation exécute toujours le hook ; les opérations suivantes le sautent tant qu’aucun fichier surveillé ne change.

```ts
import { changed, createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  hooks: {
    sandboxReady: [
      {
        executable: "npm",
        arguments: ["ci"],
        when: changed(["package-lock.json"]),
      },
    ],
  },
});
await sandbox.command({ executable: "npm", arguments: ["test"] });
```

Outpost calcule l’empreinte dans l’environnement du hook, avec des chemins relatifs à son `directory` ou à la racine du workspace. Indiquez des chemins exacts, sans glob, chemin absolu ou `..`. Les changements de contenu, créations et suppressions comptent ; les horodatages ne comptent pas. Un fichier absent a une empreinte stable ; un fichier illisible fait échouer la préparation. Node.js doit être disponible dans cet environnement.

Chaque hook garde sa propre empreinte en mémoire pour cette sandbox, uniquement après réussite. Une préparation échouée, expirée ou annulée bloque l’opération demandée et sera réessayée au prochain appel ; la sandbox reste ouverte. Toute nouvelle sandbox prépare à nouveau. Seuls les fichiers déclarés sont surveillés : supprimer `node_modules` seul ne déclenche pas l’installation. Un hook qui modifie un fichier surveillé s’exécute à nouveau à l’opération suivante.

`hostReady` accepte la même condition sur les fichiers hôte. `workspaceReady` est évalué une seule fois à l’ouverture du workspace. L’ordre reste identique : commandes hôte séquentielles, commandes de sandbox concurrentes et deux groupes en parallèle. Aucun hook ne s’exécute entre les passes d’un même dispatch ; les changements produits pendant une opération sont vérifiés à l’opération suivante.

API : [changed](../../reference/changed/) · [LifecycleCommand](../../reference/lifecyclecommand/) · [ChangedCondition](../../reference/changedcondition/). Le fichier `examples/60-incremental-preparation/index.ts` du dépôt démontre `npm ci` sans identifiants de compte ni accès réseau.

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

## Réutiliser les téléchargements dans le cloud

Vercel et Daytona acceptent le même nom de cache et la même clé de compatibilité, avec un `transport` par cache. Cet exemple utilise un préfixe S3 privé ; installez `@aws-sdk/client-s3` avec Outpost. Le client S3 appartient à l’appelant, qui doit le détruire après avoir fermé tous les sandboxes.

```ts
import { S3Client } from "@aws-sdk/client-s3";
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";
import { createVercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

export const client = new S3Client({});
const s3 = createS3Transport({
  client,
  bucket: "my-private-bucket",
  prefix: "outpost-downloads",
});
export const sandboxProvider = createVercelSandboxProvider({
  create: { runtime: "node24" },
  caches: [{ name: "npm", key: "app-node24", transport: s3 }],
  variables: { npm_config_cache: "/outpost/cache/npm" },
});
```

La restauration finit avant `sandboxReady` ; gardez `npm ci` ou `pip install` dans ce hook. Les téléchargements sont archivés à la fermeture du sandbox, après toutes les commandes et tous les tours réutilisant ce sandbox, y compris lors du nettoyage normal après un échec ou une annulation. Les identifiants de stockage restent sur l’hôte. `createLocalTransport()` fonctionne aussi lorsque plusieurs runs cloud partagent un hôte.

L’identité utilise la même recette de hachage que les caches de conteneurs : dépôt hôte canonique, image d’exécution, UID/GID, nom et clé. Dans le cloud, l’image inclut le fournisseur et son runtime/image/source configuré (Vercel), ou son image/snapshot (Daytona). Les fournisseurs et chemins de checkout hôtes différents ne partagent pas d’archives. Épinglez les images et changez `key` quand une image mutable ou une version du gestionnaire change la compatibilité.

Chaque sandbox cloud reçoit son propre snapshot. Le premier run qui publie avec la révision restaurée gagne ; un run concurrent devenu obsolète conserve le snapshot plus récent et abandonne sa mise à jour. Le cache ne fusionne pas les fichiers. Un cache absent commence vide. Les autres erreurs de transport, d’archive ou de transfert font échouer l’acquisition ou la fermeture ; la fermeture tente toujours de détruire le sandbox et rapporte les deux échecs si nécessaire.

Les archives préservent fichiers, octets binaires, permissions et liens symboliques ; le gestionnaire recrée les répertoires vides. Les limites d’archive existantes s’appliquent : 1 Gio de contenu, 100 000 fichiers et un manifeste de 16 Mio. La restauration et chaque sauvegarde ont un délai de 60 secondes. Des commandes créent `/outpost/cache/<name>` et l’attribuent à l’utilisateur du sandbox ; les images non root doivent permettre cette préparation privilégiée.

Les objets vivent sous `dependency-caches/` dans le transport. Les snapshots immuables, y compris remplacés ou non publiés, restent jusqu’à leur suppression explicite. Supprimez tout le préfixe d’un cache uniquement après avoir arrêté chaque lecteur et chaque écrivain ; supprimer les fragments d’une restauration active la fait échouer. Aucun élagage n’est automatique. Un runner tué ou un sandbox cloud expiré peut perdre les derniers téléchargements. Les fixtures SDK déterministes couvrent le comportement ; la validation réelle Vercel, Daytona et S3 reste à effectuer.

API : [CloudDependencyCache](../../reference/clouddependencycache/) · [VercelOptions](../../reference/verceloptions/) · [DaytonaOptions](../../reference/daytonaoptions/) · [Transport](../../reference/transport/).

## Gérer les volumes de cache

Un volume est partagé par les sandboxes qui ont le même dépôt, la même image, le même utilisateur de conteneur, le même nom de cache et la même clé. La fermeture d’une sandbox et `outpost image remove` le conservent. Outpost pose le label `io.outpost.cache=true` sur ses volumes :

```sh
docker volume ls --filter label=io.outpost.cache=true
docker volume rm $(docker volume ls -q --filter label=io.outpost.cache=true)
```

Podman accepte les mêmes commandes avec `podman`.
