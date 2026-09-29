---
title: "Stockage objet"
description: "Utiliser un transport S3 pour les objets persistants Outpost."
---

Installez le SDK AWS optionnel et configurez un bucket privé existant prenant en charge PUT et DELETE conditionnels.

```sh
npm install @aws-sdk/client-s3
```

```ts
import { S3Client } from "@aws-sdk/client-s3";
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";
import { createArtifactStore } from "@elie-laloum/outpost";

const client = new S3Client({ region: "eu-west-1" });
const transporter = createS3Transport({
  client,
  bucket: "my-private-outpost",
  prefix: "reviews/",
});
const store = createArtifactStore({ transporter });
```

Remplacez bucket et région par ceux de votre déploiement. Configurez les identifiants dans le client S3 côté hôte ; ils ne sont pas transmis aux agents. Détruisez le client seulement après la fin de tous les stores et opérations qui l’utilisent.

## Partager un transport

Passez le transport aux stores d’artefacts et checkpoints, à `logging.transporter`, `activityTransport`, `recoveryTransport` ou au stockage de conversations selon les objets à conserver. Utilisez un préfixe isolé et une politique de stockage dédiée.

## Compatibilité

Un endpoint compatible S3 doit implémenter les opérations conditionnelles requises et la pagination, pas seulement upload/download. Les révisions bloquent les écrivains périmés. Elles n’authentifient pas les acteurs, ne prouvent pas la vie d’un processus distant et ne sécurisent pas automatiquement le rejeu d’une tâche incomplète.

## Cloudflare R2

R2 prend en charge PUT conditionnel, mais la validation réelle a constaté que DELETE accepte les valeurs `If-Match` périmées. Sélectionnez explicitement la suppression logique :

```ts
import { S3Client } from "@aws-sdk/client-s3";
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";

const client = new S3Client({
  region: "auto",
  endpoint: "https://<account-id>.r2.cloudflarestorage.com",
});
const transporter = createS3Transport({
  client,
  bucket: "my-private-outpost",
  prefix: "reviews/",
  deleteMode: "tombstone",
});
```

Configurez les identifiants du client comme indiqué plus haut. Dans ce mode, `remove` écrit un nouveau marqueur de suppression par PUT conditionnel. Les anciennes révisions sont refusées ; `read` renvoie l’absence et `list` masque les clés supprimées. Une création avec `ifRevision: null` peut remplacer un marqueur sous condition, donc les recréations concurrentes conservent un seul gagnant. Un contenu vide reste un objet vivant ordinaire.

Tous les écrivains partageant un préfixe doivent utiliser `deleteMode: "tombstone"`. Arrêtez les écrivains existants avant de changer de mode. Le mode par défaut `"conditional"` reste réservé aux services assurant DELETE conditionnel atomique.

La suppression logique conserve un marqueur de 1 Kio par clé supprimée et ajoute des requêtes HEAD à la création et au listing. La liste observe les objets courants, sans instantané transactionnel. Les marqueurs restent des objets physiques facturables, bien que masqués des inventaires du transport et de son usage logique. Ne les expirez ou purgez pas automatiquement tant que des écrivains peuvent tourner : une suppression physique pourrait effacer une recréation concurrente. Seule une maintenance explicite après arrêt de tous les écrivains peut les retirer du bucket.

API : [createS3Transport](../../reference/creates3transport/).
