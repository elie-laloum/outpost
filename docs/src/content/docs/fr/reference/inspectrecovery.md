---
title: "inspectRecovery"
description: "inspectRecovery — Outpost API"
sidebar:
  order: 10
---

Contrat public de **inspectRecovery**. Consultez le [guide activité des ressources](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { inspectRecovery } from "@elie-laloum/outpost";
```

## Rôle et comportement

Lire l’activité enregistrée localement des baux et opérations.

Les observations locales n’énumèrent pas les comptes distants et ne constituent pas un inventaire cloud faisant autorité.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom                  | Type                                     | Présence  | Rôle                                                                                          |
| -------------------- | ---------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`            | `RecoveryInspectionOptions \| undefined` | Optionnel | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.repository` | `string \| undefined`                    | Optionnel | Checkout Git hôte ciblé.                                                                      |
| `options.maxEntries` | `number \| undefined`                    | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.git`        | `boolean \| undefined`                   | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.locks`      | `boolean \| undefined`                   | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.resources`  | `boolean \| undefined`                   | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

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
