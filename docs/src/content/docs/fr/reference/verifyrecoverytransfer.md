---
title: "verifyRecoveryTransfer"
description: "verifyRecoveryTransfer — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { verifyRecoveryTransfer } from "@elie-laloum/outpost";
```

## Rôle et comportement

Vérifie la structure d’un transfert conservé, avec calcul optionnel des empreintes et contrôle de restauration Git dans la limite maxBytes. Renvoie contrôles détaillés et état d’intégrité sans appliquer les changements entrants ni authentifier leur auteur.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom                     | Type                                       | Présence  | Rôle                                                                                               |
| ----------------------- | ------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------- |
| `path`                  | `string`                                   | Requis    | Dossier de transfert conservé à vérifier.                                                          |
| `options`               | `RecoveryVerificationOptions \| undefined` | Optionnel | Active les contrôles d’empreintes et de restauration Git et définit leur dépôt et limite d’octets. |
| `options.restorability` | `boolean \| undefined`                     | Optionnel | Vérifie aussi que les bundles et patches Git conservés peuvent reconstruire l’état enregistré.     |
| `options.repository`    | `string \| undefined`                      | Optionnel | Checkout Git hôte ciblé.                                                                           |
| `options.checksums`     | `boolean \| undefined`                     | Optionnel | Calcule et compare les empreintes enregistrées des données pendant la vérification du transfert.   |
| `options.maxBytes`      | `number \| undefined`                      | Optionnel | Nombre maximal d’octets de données autorisé pour la vérification des empreintes.                   |

## Retour

`Promise<RecoveryVerification>`

## Signature

```ts
export declare function verifyRecoveryTransfer(
  path: string,
  options?: RecoveryVerificationOptions,
): Promise<RecoveryVerification>;
```

## Contrats associés

- [RecoveryVerification](../recoveryverification/)
- [RecoveryVerificationOptions](../recoveryverificationoptions/)
