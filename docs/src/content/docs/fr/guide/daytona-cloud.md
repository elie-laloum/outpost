---
title: "Daytona Sandbox"
description: "Allouer un environnement distant avec Daytona Sandbox."
---

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

## Configurer l’allocation

Fournissez les identifiants d’allocation Daytona via `connection` sur l’hôte. Sélectionnez une image ou un snapshot avec `create` ; vérifiez qu’il contient le runtime du projet et un shell fonctionnel.

Daytona prend en charge l’attachement interactif via son API PTY native. Les identifiants de compte de l’agent restent installés séparément. `variables` contrôle les valeurs transmises à l’exécution.

## Synchronisation du dépôt

Outpost téléverse l’historique Git et les entrées sélectionnées, exécute le travail à distance, puis valide et synchronise les changements en retour. `includeUncommitted` inclut explicitement les modifications hôte. Des changements concurrents sur l’hôte peuvent arrêter la synchronisation et laisser du matériel de récupération.

Une CLI prise en charge absente peut être installée à distance. Définissez `bootstrap: false` dans les options de sandbox si votre image doit fournir tous les outils. Utilisez `sandboxReady` pour installer les dépendances du projet.

Fermez les sandboxes possédées dans `finally` ; l’allocation cloud peut être facturée jusqu’à leur libération. Voir [Échange de fichiers](../file-exchange/) et [Récupération après échec](../failure-recovery/).

API : [createDaytonaSandboxProvider](../../reference/createdaytonasandboxprovider/).
