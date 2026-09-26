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
import { s3Transport } from "@elie-laloum/outpost/transports/s3";
import { artifactStore } from "@elie-laloum/outpost";

const client = new S3Client({ region: "eu-west-1" });
const transporter = s3Transport({
  client,
  bucket: "my-private-outpost",
  prefix: "reviews/",
});
const store = artifactStore({ transporter });
```

Remplacez bucket et région par ceux de votre déploiement. Configurez les identifiants dans le client S3 côté hôte ; ils ne sont pas transmis aux agents. Détruisez le client seulement après la fin de tous les stores et opérations qui l’utilisent.

## Partager un transport

Passez le transport aux stores d’artefacts et checkpoints, à `logging.transporter`, `activityTransport`, `recoveryTransport` ou au stockage de conversations selon les objets à conserver. Utilisez un préfixe isolé et une politique de stockage dédiée.

## Compatibilité

Un endpoint compatible S3 doit implémenter les opérations conditionnelles requises et la pagination, pas seulement upload/download. Les révisions bloquent les écrivains périmés. Elles n’authentifient pas les acteurs, ne prouvent pas la vie d’un processus distant et ne sécurisent pas automatiquement le rejeu d’une tâche incomplète.

API : [s3Transport](../../reference/s3transport/).
