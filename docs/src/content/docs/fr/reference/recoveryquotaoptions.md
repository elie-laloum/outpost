---
title: "RecoveryQuotaOptions"
description: "RecoveryQuotaOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryQuotaOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                     | Présence  | Rôle                                                                                                                                                                                                         |
| -------------- | ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `transporter`  | `Transport \| undefined` | Optionnel | Mesure la taille des objets de ce transport au lieu des fichiers du .outpost du dépôt. Un objet hors des catégories connues rend l’inventaire incomplet.                                                     |
| `repository`   | `string \| undefined`    | Optionnel | Checkout Git dont le .outpost est mesuré, process.cwd() par défaut, résolu vers son répertoire racine ; un dossier absent rejette avec le code workspace. Ignoré avec transporter.                           |
| `maxBytes`     | `number`                 | Requis    | Limite de l’usage observé plus reserveBytes, en octets ; au-delà, l’appel rejette avec le code workspace. Les réservations actives ne sont pas comptées. Doit être un entier sûr positif ou nul.             |
| `reserveBytes` | `number \| undefined`    | Optionnel | Octets ajoutés à l’usage observé pour ce contrôle, 0 par défaut. Rien n’est réservé.                                                                                                                         |
| `maxEntries`   | `number \| undefined`    | Optionnel | Nombre maximal de fichiers et répertoires parcourus sous .outpost, ou d’objets listés depuis transporter, 100000 par défaut. Le dépasser rend l’inventaire incomplet, ce qui rejette avec le code workspace. |

## Signature

```ts
export interface RecoveryQuotaOptions {
  readonly transporter?: Transport;
  readonly repository?: string;
  readonly maxBytes: number;
  readonly reserveBytes?: number;
  readonly maxEntries?: number;
}
```

## Contrats associés

- [Transport](../transport/)
