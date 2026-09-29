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

Vérifie un transfert conservé par rapport à son dépôt et renvoie un plan pour restaurer un côté dans un nouveau dossier. Les contrôles portent sur une copie temporaire vérifiée par empreintes, et rien n’est créé. Les options invalides et les contrôles en échec rejettent avec le code configuration ; un transfert, un dépôt ou un parent de destination introuvable rejette avec le code workspace.

[Exemple complet et règles détaillées](../../guide/recovery/).

## Paramètres et propriétés

| Nom                   | Type                          | Présence  | Rôle                                                                                                                                                                                                |
| --------------------- | ----------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryRestoreOptions`      | Requis    | Source du transfert conservé, dépôt, nouvelle destination, côté choisi et limite d’octets de vérification.                                                                                          |
| `options.directory`   | `string`                      | Requis    | Dossier du transfert conservé, tel que l’indique details.recovery de l’erreur de synchronisation. Il doit contenir state.json et checksums.json.                                                    |
| `options.repository`  | `string`                      | Requis    | Dépôt Git hôte cloné dans la destination ; il est seulement lu. Un dépôt partiel, superficiel (shallow) ou à objets alternates échoue au contrôle Git.                                              |
| `options.destination` | `string`                      | Requis    | Nouveau dossier à créer. Son parent doit exister ; le chemin ne doit pas exister et doit se trouver hors du dépôt, de ses métadonnées Git et du transfert.                                          |
| `options.side`        | `"previous" \| "incoming"`    | Requis    | previous restaure le worktree hôte tel qu’il était sauvegardé avant le transfert, index Git compris ; incoming restaure les commits, changements non commités et fichiers non suivis de la sandbox. |
| `options.maxBytes`    | `number \| undefined`         | Optionnel | Nombre maximal d’octets du transfert copiés et hachés, 1073741824 (1 Gio) par défaut. Un dépassement rejette avec le code configuration.                                                            |
| `observation`         | `ObservationHub \| undefined` | Optionnel | Hub qui reçoit l’opération recovery restore.plan à son début, à sa fin ou en cas d’échec.                                                                                                           |

## Retour

`Promise<RecoveryRestorePlan>`

## Signature

```ts
export declare function planRecoveryRestore(
  options: RecoveryRestoreOptions,
  observation?: ObservationHub,
): Promise<RecoveryRestorePlan>;
```

## Contrats associés

- [ObservationHub](../observationhub/)
- [RecoveryRestoreOptions](../recoveryrestoreoptions/)
- [RecoveryRestorePlan](../recoveryrestoreplan/)
