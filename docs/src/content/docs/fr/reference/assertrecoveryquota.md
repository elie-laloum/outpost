---
title: "assertRecoveryQuota"
description: "assertRecoveryQuota — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { assertRecoveryQuota } from "@elie-laloum/outpost";
```

## Rôle et comportement

Se résout quand le stockage observé plus reserveBytes reste inférieur ou égal à maxBytes. Sinon, ou si l’inventaire est incomplet, rejette avec le code workspace et usageBytes, reserveBytes, maxBytes et complete dans details. Rien n’est réservé et les réservations actives ne sont pas comptées ; reserveRecoveryStorage() coordonne les écrivains.

[Exemple complet et règles détaillées](../../guide/retention/).

## Paramètres et propriétés

| Nom                    | Type                     | Présence  | Rôle                                                                                                                                                                                                         |
| ---------------------- | ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`              | `RecoveryQuotaOptions`   | Requis    | Dépôt ou transporter à mesurer, limite en octets, octets supplémentaires et limite de parcours.                                                                                                              |
| `options.transporter`  | `Transport \| undefined` | Optionnel | Mesure la taille des objets de ce transport au lieu des fichiers du .outpost du dépôt. Un objet hors des catégories connues rend l’inventaire incomplet.                                                     |
| `options.repository`   | `string \| undefined`    | Optionnel | Checkout Git dont le .outpost est mesuré, process.cwd() par défaut, résolu vers son répertoire racine ; un dossier absent rejette avec le code workspace. Ignoré avec transporter.                           |
| `options.maxBytes`     | `number`                 | Requis    | Limite de l’usage observé plus reserveBytes, en octets ; au-delà, l’appel rejette avec le code workspace. Les réservations actives ne sont pas comptées. Doit être un entier sûr positif ou nul.             |
| `options.reserveBytes` | `number \| undefined`    | Optionnel | Octets ajoutés à l’usage observé pour ce contrôle, 0 par défaut. Rien n’est réservé.                                                                                                                         |
| `options.maxEntries`   | `number \| undefined`    | Optionnel | Nombre maximal de fichiers et répertoires parcourus sous .outpost, ou d’objets listés depuis transporter, 100000 par défaut. Le dépasser rend l’inventaire incomplet, ce qui rejette avec le code workspace. |

## Retour

`Promise<void>`

## Signature

```ts
export declare function assertRecoveryQuota(
  options: RecoveryQuotaOptions,
): Promise<void>;
```

## Contrats associés

- [RecoveryQuotaOptions](../recoveryquotaoptions/)
