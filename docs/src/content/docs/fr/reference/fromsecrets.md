---
title: "fromSecrets"
description: "fromSecrets — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { fromSecrets } from "@elie-laloum/outpost";
```

## Rôle et comportement

Résout une sélection explicite au démarrage en un objet gelé de chaînes. Refuse les déclarations invalides avant lecture, les valeurs absentes ou invalides après lecture et filtre les erreurs sans leurs causes. Borne l’appel entier par un délai et une annulation optionnelle, sans modifier process.env, écrire les valeurs sur disque, fermer les clients ou mettre les valeurs en cache.

[Exemple complet et règles détaillées](../../guide/secret-sources/).

## Paramètres et propriétés

| Nom                 | Type                              | Présence  | Rôle                                                                                                                                                                                                             |
| ------------------- | --------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`            | `SecretSource`                    | Requis    | Implémentation nommée du port résolvant uniquement les noms demandés sur l’hôte ; ses erreurs sont filtrées et son client reste à l’appelant.                                                                    |
| `names`             | `readonly string[]`               | Requis    | Identifiants uniques de variables à résoudre. L’appel copie le tableau ; un tableau vide renvoie un objet vide gelé sans invoquer la source.                                                                     |
| `options`           | `FromSecretsOptions \| undefined` | Optionnel | Délai et annulation pour toute la résolution au démarrage, y compris tous les noms sélectionnés.                                                                                                                 |
| `options.timeoutMs` | `number \| undefined`             | Optionnel | Délai entier sûr strictement positif pour toute la résolution, 30000 ms par défaut ; au plus 2147483647. Son expiration rejette avec timeout et signale la source.                                               |
| `options.signal`    | `AbortSignal \| undefined`        | Optionnel | Signal transmis à la source pour cette résolution. HTTP Vault, AWS et Azure annulent les requêtes ; les autres adapters SDK le vérifient entre lectures tandis que fromSecrets termine l’attente indépendamment. |

## Retour

`Promise<Readonly<Record<string, string>>>`

## Signature

```ts
export declare function fromSecrets(
  source: SecretSource,
  names: readonly string[],
  options?: FromSecretsOptions,
): Promise<Readonly<Record<string, string>>>;
```

## Contrats associés

- [FromSecretsOptions](../fromsecretsoptions/)
- [SecretSource](../secretsource/)
