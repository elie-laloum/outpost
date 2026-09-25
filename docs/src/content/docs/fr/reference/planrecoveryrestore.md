---
title: "planRecoveryRestore"
description: "planRecoveryRestore — Outpost API"
sidebar:
  order: 10
---

Contrat public de **planRecoveryRestore**. Consultez le [guide restauration de récupération](../../guide/operations/recovery-restoration/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { planRecoveryRestore } from "@elie-laloum/outpost";
```

## Rôle et comportement

Planifier puis appliquer un transfert conservé vers une nouvelle destination à relire.

Restaurez dans un nouveau dossier et examinez avant intégration. La vérification contrôle structure et intégrité enregistrées ; elle n’authentifie pas l’auteur.

[Exemple complet et règles détaillées](../../guide/operations/recovery-restoration/).

## Paramètres et propriétés

| Nom                   | Type                       | Présence  | Rôle                                                                                          |
| --------------------- | -------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryRestoreOptions`   | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.directory`   | `string`                   | Requis    | Dossier utilisé par l’opération ; voir les règles de résolution.                              |
| `options.repository`  | `string`                   | Requis    | Checkout Git hôte ciblé.                                                                      |
| `options.destination` | `string`                   | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.side`        | `"previous" \| "incoming"` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.maxBytes`    | `number \| undefined`      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

## Retour

`Promise<RecoveryRestorePlan>`

## Signature

```ts
export declare function planRecoveryRestore(
  options: RecoveryRestoreOptions,
): Promise<RecoveryRestorePlan>;
```

## Contrats associés

- [RecoveryRestoreOptions](../recoveryrestoreoptions/)
- [RecoveryRestorePlan](../recoveryrestoreplan/)
