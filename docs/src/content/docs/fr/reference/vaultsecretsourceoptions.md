---
title: "VaultSecretSourceOptions"
description: "VaultSecretSourceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { VaultSecretSourceOptions } from "@elie-laloum/outpost/secrets/vault";
```

## Paramètres et propriétés

| Nom         | Type                  | Présence  | Rôle                                                                                                                                                                                |
| ----------- | --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`   | `string`              | Requis    | URL HTTP(S) absolue explicite du serveur Vault ou OpenBao, éventuellement avec un chemin de proxy ; identifiants, paramètres et fragments sont refusés.                             |
| `token`     | `string`              | Requis    | Jeton de lecture déclaré sur l’hôte, transmis uniquement dans X-Vault-Token. Doit être non vide sans saut de ligne ; cet adapter ne le transmet jamais comme variable à la sandbox. |
| `mount`     | `string`              | Requis    | Nom du point de montage KV v2, comme kv ou secret ; les segments encodés doivent être non vides sans traversée.                                                                     |
| `path`      | `string`              | Requis    | Chemin du document relatif au montage, comme outpost/prod. Un document est récupéré puis ses champs demandés sont sélectionnés ; n’incluez pas le segment API data.                 |
| `version`   | `number \| undefined` | Optionnel | Version entière strictement positive du document KV v2 ; omise, sélectionne la dernière version du service.                                                                         |
| `namespace` | `string \| undefined` | Optionnel | En-tête optionnel d’espace de noms pour le serveur Vault/OpenBao choisi, sans saut de ligne.                                                                                        |

## Signature

```ts
export interface VaultSecretSourceOptions {
  readonly address: string;
  readonly token: string;
  readonly mount: string;
  readonly path: string;
  readonly version?: number;
  readonly namespace?: string;
}
```
