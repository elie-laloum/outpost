---
title: "createVaultSecretSource"
description: "createVaultSecretSource — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createVaultSecretSource } from "@elie-laloum/outpost/secrets/vault";
```

## Rôle et comportement

Crée un lecteur KV v2 Vault/OpenBao sur l’hôte pour un point de montage et un document déclarés. Récupère le document une fois par sélection non vide et ne restitue que les champs demandés, avec version et espace de noms optionnels. Transmet le jeton dans les en-têtes HTTP, refuse les redirections et borne la réponse ; KV v1 et les identifiants dynamiques ne sont pas pris en charge.

[Exemple complet et règles détaillées](../../guide/secret-sources/).

## Paramètres et propriétés

| Nom                 | Type                       | Présence  | Rôle                                                                                                                                                                                |
| ------------------- | -------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `VaultSecretSourceOptions` | Requis    | Client ou configuration de connexion sur l’hôte et sélection explicite des secrets pour l’adapter Vault.                                                                            |
| `options.address`   | `string`                   | Requis    | URL HTTP(S) absolue explicite du serveur Vault ou OpenBao, éventuellement avec un chemin de proxy ; identifiants, paramètres et fragments sont refusés.                             |
| `options.token`     | `string`                   | Requis    | Jeton de lecture déclaré sur l’hôte, transmis uniquement dans X-Vault-Token. Doit être non vide sans saut de ligne ; cet adapter ne le transmet jamais comme variable à la sandbox. |
| `options.mount`     | `string`                   | Requis    | Nom du point de montage KV v2, comme kv ou secret ; les segments encodés doivent être non vides sans traversée.                                                                     |
| `options.path`      | `string`                   | Requis    | Chemin du document relatif au montage, comme outpost/prod. Un document est récupéré puis ses champs demandés sont sélectionnés ; n’incluez pas le segment API data.                 |
| `options.version`   | `number \| undefined`      | Optionnel | Version entière strictement positive du document KV v2 ; omise, sélectionne la dernière version du service.                                                                         |
| `options.namespace` | `string \| undefined`      | Optionnel | En-tête optionnel d’espace de noms pour le serveur Vault/OpenBao choisi, sans saut de ligne.                                                                                        |

## Retour

`SecretSource`

## Signature

```ts
export declare function createVaultSecretSource(
  options: VaultSecretSourceOptions,
): SecretSource;
```

## Contrats associés

- [SecretSource](../secretsource/)
- [VaultSecretSourceOptions](../vaultsecretsourceoptions/)
