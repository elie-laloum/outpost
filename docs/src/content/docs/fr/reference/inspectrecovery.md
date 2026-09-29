---
title: "inspectRecovery"
description: "inspectRecovery — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { inspectRecovery } from "@elie-laloum/outpost";
```

## Rôle et comportement

Dresse l’inventaire de l’état de récupération sans rien supprimer. Le mode local parcourt le répertoire .outpost du checkout Git et, sur demande, les worktrees, les verrous et les enregistrements d’activité des sandboxes ; avec transporter, elle liste les objets de ce transport et peut lire les enregistrements d’activité, dont la possession reste inconnue. git ou locks avec un transporter, ou un maxEntries invalide, rejettent avec le code configuration.

[Exemple complet et règles détaillées](../../guide/recovery/).

## Paramètres et propriétés

| Nom                   | Type                                     | Présence  | Rôle                                                                                                                                                                                                                                     |
| --------------------- | ---------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryInspectionOptions \| undefined` | Optionnel | Choix d’inventaire du dépôt local ou d’un transport, limite d’entrées et inspection optionnelle des ressources. Git et les verrous de processus exigent le mode local.                                                                   |
| `options.transporter` | `Transport \| undefined`                 | Optionnel | Inventorie les objets de ce transport au lieu d’un dépôt local. Passez le transport donné comme activityTransport pour lire ses enregistrements d’activité ; git ou locks rejettent alors avec le code configuration.                    |
| `options.repository`  | `string \| undefined`                    | Optionnel | Checkout Git à inspecter, par défaut le répertoire courant, résolu à sa racine. En mode transport, seulement renvoyé comme libellé.                                                                                                      |
| `options.maxEntries`  | `number \| undefined`                    | Optionnel | Nombre maximal d’entrées parcourues avant de déclarer l’inventaire incomplet, 100000 par défaut. L’inspection locale des ressources s’arrête aussi à 10000 enregistrements ; une valeur non positive rejette avec le code configuration. |
| `options.git`         | `boolean \| undefined`                   | Optionnel | Ajoute l’état Git de chaque workspace sous .outpost : enregistrement, HEAD, branche, modifications et verrouillage. Mode local uniquement.                                                                                               |
| `options.locks`       | `boolean \| undefined`                   | Optionnel | Ajoute les fichiers de verrou d’opération avec le statut de leur propriétaire. Mode local uniquement.                                                                                                                                    |
| `options.resources`   | `boolean \| undefined`                   | Optionnel | Ajoute les enregistrements d’activité des sandboxes avec leur verdict de possession, lus dans .outpost/storage ou, avec transporter, dans ce transport.                                                                                  |

## Retour

`Promise<RecoveryInspection>`

## Signature

```ts
export declare function inspectRecovery(
  options?: RecoveryInspectionOptions,
): Promise<RecoveryInspection>;
```

## Contrats associés

- [RecoveryInspection](../recoveryinspection/)
- [RecoveryInspectionOptions](../recoveryinspectionoptions/)
