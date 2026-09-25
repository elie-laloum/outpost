---
title: "assertRecoveryQuota"
description: "assertRecoveryQuota — Outpost API"
sidebar:
  order: 10
---

Contrat public de **assertRecoveryQuota**. Consultez le [guide récupération et rétention](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { assertRecoveryQuota } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom                    | Type                   | Présence  | Rôle                                                                                          |
| ---------------------- | ---------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`              | `RecoveryQuotaOptions` | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.repository`   | `string \| undefined`  | Optionnel | Checkout Git hôte ciblé.                                                                      |
| `options.maxBytes`     | `number`               | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.reserveBytes` | `number \| undefined`  | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.maxEntries`   | `number \| undefined`  | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

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
