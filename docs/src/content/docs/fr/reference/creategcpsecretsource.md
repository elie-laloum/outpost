---
title: "createGcpSecretSource"
description: "createGcpSecretSource — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createGcpSecretSource } from "@elie-laloum/outpost/secrets/gcp";
```

## Rôle et comportement

Crée un lecteur Google Cloud Secret Manager avec un client SDK appartenant à l’appelant. Accède uniquement aux ressources de version sélectionnées, y compris régionales, et décode les octets ou le base64 REST en UTF-8 strict. Refuse un contenu absent ou invalide ; l’annulation par fromSecrets termine l’attente, tandis qu’un appel SDK en cours peut terminer.

[Exemple complet et règles détaillées](../../guide/secret-sources/).

## Paramètres et propriétés

| Nom               | Type                                                      | Présence | Rôle                                                                                                                                                                                                                                                         |
| ----------------- | --------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`         | `GcpSecretSourceOptions`                                  | Requis   | Client ou configuration de connexion sur l’hôte et sélection explicite des secrets pour l’adapter Gcp.                                                                                                                                                       |
| `options.client`  | `Pick<SecretManagerServiceClient, "accessSecretVersion">` | Requis   | SecretManagerServiceClient appartenant à l’appelant et authentifié sur l’hôte ; seul accessSecretVersion est utilisé. fromSecrets borne l’attente sans annuler un appel SDK déjà lancé ; l’appelant ferme le client.                                         |
| `options.secrets` | `Readonly<Record<string, string>>`                        | Requis   | Correspondances entre variables et projects/&lt;project>/secrets/&lt;secret>/versions/&lt;version>, avec éventuellement locations/&lt;location> après le projet. La version est latest ou un entier positif ; seules les ressources sélectionnées sont lues. |

## Retour

`SecretSource`

## Signature

```ts
export declare function createGcpSecretSource(
  options: GcpSecretSourceOptions,
): SecretSource;
```

## Contrats associés

- [GcpSecretSourceOptions](../gcpsecretsourceoptions/)
- [SecretSource](../secretsource/)
