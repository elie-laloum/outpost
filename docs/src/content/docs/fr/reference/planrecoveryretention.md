---
title: "planRecoveryRetention"
description: "planRecoveryRetention — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { planRecoveryRetention } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inventorie le .outpost du dépôt, ou les objets d’un transport, et marque chaque entrée éligible ou conservée avec un code de motif selon la politique. Ne supprime rien ; un inventaire incomplet rend toutes les entrées inéligibles et quota inconnu. Une politique invalide, ou clean-workspaces ou maxWorkspaces avec un transporter, rejette avec le code configuration.

[Exemple complet et règles détaillées](../../guide/retention/).

## Paramètres et propriétés

| Nom                   | Type                          | Présence  | Rôle                                                                                                                                                                                                             |
| --------------------- | ----------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryRetentionOptions`    | Requis    | Dépôt ou transporter à inspecter, politique de rétention et limite de parcours.                                                                                                                                  |
| `options.transporter` | `Transport \| undefined`      | Optionnel | Planifie sur les objets de ce transport au lieu du .outpost du dépôt. Seuls closed-logs et task-cache s’appliquent ; clean-workspaces ou maxWorkspaces rejettent avec le code configuration.                     |
| `options.repository`  | `string \| undefined`         | Optionnel | Checkout Git dont le .outpost est inspecté, process.cwd() par défaut, résolu vers son répertoire racine ; un dossier absent rejette avec le code workspace. Avec transporter, seulement enregistré dans le plan. |
| `options.policy`      | `RecoveryRetentionPolicy`     | Requis    | Périmètres, âge minimal et limites qui décident des entrées éligibles. Validée avant l’inspection ; un champ invalide ou inconnu rejette avec le code configuration.                                             |
| `options.maxEntries`  | `number \| undefined`         | Optionnel | Nombre maximal de fichiers et répertoires parcourus sous .outpost, ou d’objets listés depuis transporter, 100000 par défaut. Le dépasser rend le plan incomplet : aucune entrée n’est éligible.                  |
| `observation`         | `ObservationHub \| undefined` | Optionnel | Hub recevant l’événement d’opération retention.plan au démarrage, puis à la fin ou en échec avec sa durée.                                                                                                       |

## Retour

`Promise<RecoveryRetentionPlan>`

## Signature

```ts
export declare function planRecoveryRetention(
  options: RecoveryRetentionOptions,
  observation?: ObservationHub,
): Promise<RecoveryRetentionPlan>;
```

## Contrats associés

- [ObservationHub](../observationhub/)
- [RecoveryRetentionOptions](../recoveryretentionoptions/)
- [RecoveryRetentionPlan](../recoveryretentionplan/)
