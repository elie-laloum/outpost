---
title: "FromSecretsOptions"
description: "FromSecretsOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FromSecretsOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                       | Présence  | Rôle                                                                                                                                                                                                             |
| ----------- | -------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `timeoutMs` | `number \| undefined`      | Optionnel | Délai entier sûr strictement positif pour toute la résolution, 30000 ms par défaut ; au plus 2147483647. Son expiration rejette avec timeout et signale la source.                                               |
| `signal`    | `AbortSignal \| undefined` | Optionnel | Signal transmis à la source pour cette résolution. HTTP Vault, AWS et Azure annulent les requêtes ; les autres adapters SDK le vérifient entre lectures tandis que fromSecrets termine l’attente indépendamment. |

## Signature

```ts
export interface FromSecretsOptions extends SecretResolveOptions {
  readonly timeoutMs?: number;
}
```

## Contrats associés

- [SecretResolveOptions](../secretresolveoptions/)
