---
title: "Sandboxes cloud"
description: "Exécuter les agents dans des sandboxes Vercel ou Daytona et synchroniser leurs modifications."
---

Les fournisseurs montés voient le workspace via le montage hôte actif. Les fournisseurs distants téléversent un snapshot puis synchronisent les changements en retour. Votre application utilise les mêmes opérations de sandbox, mais la propriété des fichiers diffère.

## Vercel Sandbox

Installez le SDK optionnel à côté d’Outpost. Un moteur de conteneurs local n’est pas nécessaire.

```sh
npm install @vercel/sandbox
```

```ts
import { createVercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

const sandboxProvider = createVercelSandboxProvider({
  create: { runtime: "node24" },
});
```

### Configurer l’allocation

Configurez les identifiants d’allocation du SDK Vercel dans l’environnement hôte. Vous pouvez utiliser un jeton OIDC Vercel ou les réglages de jeton, équipe et projet du SDK. Ils sont distincts du compte ou de la clé API de l’agent.

Vercel rejette l’attachement d’un terminal interactif. Utilisez `sandbox.command()` et les requêtes sans interface. `create` transmet les réglages de création pris en charge au SDK ; `root` sélectionne l’emplacement distant du workspace.

### Synchronisation du dépôt

Outpost téléverse l’historique Git et les entrées sélectionnées, exécute le travail à distance, puis valide et synchronise les changements en retour. `includeUncommitted` inclut explicitement les modifications hôte. Des changements concurrents sur l’hôte peuvent arrêter la synchronisation et laisser du matériel de récupération.

Une CLI prise en charge absente peut être installée à distance. Définissez `bootstrap: false` dans les options de sandbox si votre image doit fournir tous les outils. Utilisez `sandboxReady` pour installer les dépendances du projet.

Fermez les sandboxes possédées dans `finally` ; l’allocation cloud peut être facturée jusqu’à leur libération. Voir [Échange de fichiers](../cloud-sandboxes/) et [Récupération après échec](../recovery/).

API : [createVercelSandboxProvider](../../reference/createvercelsandboxprovider/).

## Daytona Sandbox

Installez le SDK optionnel à côté d’Outpost. Un moteur de conteneurs local n’est pas nécessaire.

```sh
npm install @daytona/sdk
```

```ts
import { createDaytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";

const sandboxProvider = createDaytonaSandboxProvider({
  connection: { apiKey: process.env.DAYTONA_API_KEY ?? "" },
});
```

### Configurer l’allocation

Fournissez les identifiants d’allocation Daytona via `connection` sur l’hôte. Sélectionnez une image ou un snapshot avec `create` ; vérifiez qu’il contient le runtime du projet et un shell fonctionnel.

Daytona prend en charge l’attachement interactif via son API PTY native. Les identifiants de compte de l’agent restent installés séparément. `variables` contrôle les valeurs transmises à l’exécution.

### Synchronisation du dépôt

Outpost téléverse l’historique Git et les entrées sélectionnées, exécute le travail à distance, puis valide et synchronise les changements en retour. `includeUncommitted` inclut explicitement les modifications hôte. Des changements concurrents sur l’hôte peuvent arrêter la synchronisation et laisser du matériel de récupération.

Une CLI prise en charge absente peut être installée à distance. Définissez `bootstrap: false` dans les options de sandbox si votre image doit fournir tous les outils. Utilisez `sandboxReady` pour installer les dépendances du projet.

Fermez les sandboxes possédées dans `finally` ; l’allocation cloud peut être facturée jusqu’à leur libération. Voir [Échange de fichiers](../cloud-sandboxes/) et [Récupération après échec](../recovery/).

API : [createDaytonaSandboxProvider](../../reference/createdaytonasandboxprovider/).

## Entrées distantes

`copies` sélectionne des fichiers supplémentaires relatifs au dépôt. `includeUncommitted` inclut les modifications hôte dans le snapshot distant. Envoyez uniquement les entrées nécessaires ; l’allocation distante les téléverse dans votre compte cloud.

## Synchronisation

Avant d’appliquer les changements entrants, Outpost valide le transfert et sauvegarde l’état hôte. Si l’hôte a changé entre-temps, la synchronisation échoue au lieu de l’écraser silencieusement. Conservez le dossier de transfert indiqué et utilisez la [récupération après échec](../recovery/) pour inspecter les deux versions.
