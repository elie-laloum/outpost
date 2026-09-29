---
title: "Persistance"
description: "Choisir où stocker les objets persistants d’exécution."
---

Outpost persiste artefacts, checkpoints, journaux, réservations et activité des ressources via `Transport`. Les stores définissent le sens des objets ; les transports fournissent des E/S binaires bornées et des mutations conditionnelles.

```ts
import {
  createLocalTransport,
  createArtifactStore,
  createWorkflowCheckpointStore,
} from "@elie-laloum/outpost";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const artifacts = createArtifactStore({ transporter });
const checkpoints = createWorkflowCheckpointStore({ transporter });
```

## Stockage local

`createLocalTransport({ directory })` crée un format versionné dans un dossier local privé. Le stockage d’exécution par défaut vit sous `.outpost/storage` dans le dépôt. Les verrous locaux coordonnent les processus de cette machine ; ce n’est pas une propriété distribuée sur NFS.

## Stockage distant

Utilisez le [stockage objet](../object-storage/) pour persister les mêmes contrats à distance. L’application possède le client et son cycle de vie. Fermer une sandbox ou un workflow ne ferme pas un client de transport fourni extérieurement.

## Écritures conditionnelles

Une écriture fournit `ifRevision: null` pour créer, ou la révision observée pour remplacer. La suppression exige aussi la révision observée. `TransportConflict` signifie qu’un autre écrivain a modifié l’objet ; relisez-le avant de décider. Une liste de métadonnées n’est pas une transaction sur tous les objets listés.

Les workspaces Git natifs, le staging d’exécution et la restauration des transcriptions nécessitent toujours un système de fichiers. Un transport distant ne déplace pas tout le runtime hors du disque.

API : [Transport](../../reference/transport/) · [createLocalTransport](../../reference/createlocaltransport/) · [TransportConflict](../../reference/transportconflict/).
