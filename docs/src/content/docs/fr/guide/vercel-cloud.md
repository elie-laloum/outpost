---
title: "Vercel Sandbox"
description: "Allouer un environnement distant avec Vercel Sandbox."
---

Installez le SDK optionnel à côté d’Outpost. Un moteur de conteneurs local n’est pas nécessaire.

```sh
npm install @vercel/sandbox
```

```ts
import { vercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

const sandboxProvider = vercelSandboxProvider({
  create: { runtime: "node24" },
});
```

## Configurer l’allocation

Configurez les identifiants d’allocation du SDK Vercel dans l’environnement hôte. Vous pouvez utiliser un jeton OIDC Vercel ou les réglages de jeton, équipe et projet du SDK. Ils sont distincts du compte ou de la clé API de l’agent.

Vercel rejette l’attachement d’un terminal interactif. Utilisez `sandbox.command()` et les requêtes sans interface. `create` transmet les réglages de création pris en charge au SDK ; `root` sélectionne l’emplacement distant du workspace.

## Synchronisation du dépôt

Outpost téléverse l’historique Git et les entrées sélectionnées, exécute le travail à distance, puis valide et synchronise les changements en retour. `includeUncommitted` inclut explicitement les modifications hôte. Des changements concurrents sur l’hôte peuvent arrêter la synchronisation et laisser du matériel de récupération.

Une CLI prise en charge absente peut être installée à distance. Définissez `bootstrap: false` dans les options de sandbox si votre image doit fournir tous les outils. Utilisez `sandboxReady` pour installer les dépendances du projet.

Fermez les sandboxes possédées dans `finally` ; l’allocation cloud peut être facturée jusqu’à leur libération. Voir [Échange de fichiers](../file-exchange/) et [Récupération après échec](../failure-recovery/).

API : [vercelSandboxProvider](../../reference/vercelsandboxprovider/).
