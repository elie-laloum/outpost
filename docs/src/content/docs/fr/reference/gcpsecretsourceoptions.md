---
title: "GcpSecretSourceOptions"
description: "GcpSecretSourceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { GcpSecretSourceOptions } from "@elie-laloum/outpost/secrets/gcp";
```

## Paramètres et propriétés

| Nom       | Type                                                      | Présence | Rôle                                                                                                                                                                                                                                                         |
| --------- | --------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `client`  | `Pick<SecretManagerServiceClient, "accessSecretVersion">` | Requis   | SecretManagerServiceClient appartenant à l’appelant et authentifié sur l’hôte ; seul accessSecretVersion est utilisé. fromSecrets borne l’attente sans annuler un appel SDK déjà lancé ; l’appelant ferme le client.                                         |
| `secrets` | `Readonly<Record<string, string>>`                        | Requis   | Correspondances entre variables et projects/&lt;project>/secrets/&lt;secret>/versions/&lt;version>, avec éventuellement locations/&lt;location> après le projet. La version est latest ou un entier positif ; seules les ressources sélectionnées sont lues. |

## Signature

```ts
import type { SecretManagerServiceClient } from "@google-cloud/secret-manager";

export interface GcpSecretSourceOptions {
  readonly client: Pick<SecretManagerServiceClient, "accessSecretVersion">;
  readonly secrets: Readonly<Record<string, string>>;
}
```
