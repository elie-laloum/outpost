---
title: "planRecoveryRestore"
description: "planRecoveryRestore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { planRecoveryRestore } from "@elie-laloum/outpost";
```

## Rôle et comportement

Valide un transfert conservé et prépare la restauration de son état previous ou incoming dans une nouvelle destination. Le plan enregistre données, commit et empreintes pour une revalidation ultérieure ; il ne remplit pas la destination.

[Exemple complet et règles détaillées](../../guide/operations/recovery-restoration/).

## Paramètres et propriétés

| Nom                   | Type                       | Présence  | Rôle                                                                                                          |
| --------------------- | -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryRestoreOptions`   | Requis    | Source du transfert conservé, dépôt, nouvelle destination, côté choisi et limite d’octets de vérification.    |
| `options.directory`   | `string`                   | Requis    | Dossier hôte contenant les artefacts de transfert conservés à vérifier ou restaurer.                          |
| `options.repository`  | `string`                   | Requis    | Checkout Git hôte ciblé.                                                                                      |
| `options.destination` | `string`                   | Requis    | Nouveau dossier de destination absent, hors du dépôt source, de ses métadonnées Git et du transfert conservé. |
| `options.side`        | `"previous" \| "incoming"` | Requis    | État conservé à restaurer : previous pour l’état hôte antérieur ou incoming pour l’état distant entrant.      |
| `options.maxBytes`    | `number \| undefined`      | Optionnel | Nombre maximal d’octets de données conservées autorisé pour copier et vérifier les sources de restauration.   |

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
