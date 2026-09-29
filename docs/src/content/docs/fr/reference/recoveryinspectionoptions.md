---
title: "RecoveryInspectionOptions"
description: "RecoveryInspectionOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryInspectionOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                     | Présence  | Rôle                                                                                                                                                                                                                                     |
| ------------- | ------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport \| undefined` | Optionnel | Inventorie les objets de ce transport au lieu d’un dépôt local. Passez le transport donné comme activityTransport pour lire ses enregistrements d’activité ; git ou locks rejettent alors avec le code configuration.                    |
| `repository`  | `string \| undefined`    | Optionnel | Checkout Git à inspecter, par défaut le répertoire courant, résolu à sa racine. En mode transport, seulement renvoyé comme libellé.                                                                                                      |
| `maxEntries`  | `number \| undefined`    | Optionnel | Nombre maximal d’entrées parcourues avant de déclarer l’inventaire incomplet, 100000 par défaut. L’inspection locale des ressources s’arrête aussi à 10000 enregistrements ; une valeur non positive rejette avec le code configuration. |
| `git`         | `boolean \| undefined`   | Optionnel | Ajoute l’état Git de chaque workspace sous .outpost : enregistrement, HEAD, branche, modifications et verrouillage. Mode local uniquement.                                                                                               |
| `locks`       | `boolean \| undefined`   | Optionnel | Ajoute les fichiers de verrou d’opération avec le statut de leur propriétaire. Mode local uniquement.                                                                                                                                    |
| `resources`   | `boolean \| undefined`   | Optionnel | Ajoute les enregistrements d’activité des sandboxes avec leur verdict de possession, lus dans .outpost/storage ou, avec transporter, dans ce transport.                                                                                  |

## Signature

```ts
export interface RecoveryInspectionOptions {
  readonly transporter?: Transport;
  readonly repository?: string;
  readonly maxEntries?: number;
  readonly git?: boolean;
  readonly locks?: boolean;
  readonly resources?: boolean;
}
```

## Contrats associés

- [Transport](../transport/)
