---
title: "RecoveryRestorePlan"
description: "RecoveryRestorePlan — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRestorePlan } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                           | Présence  | Rôle                                                                                                                                                                                                |
| ---------------- | ------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fingerprint`    | `string`                       | Requis    | SHA-256 de tous les autres champs du plan. restoreRecoveryTransfer() rejette un plan qui ne lui correspond plus.                                                                                    |
| `manifestSha256` | `string`                       | Requis    | SHA-256 du checksums.json du transfert lors de la planification. La restauration rejette avec le code configuration si le manifeste a changé.                                                       |
| `commit`         | `string`                       | Requis    | Commit sur lequel la destination sera détachée : le dernier commit synchronisé pour previous, le HEAD de la sandbox pour incoming.                                                                  |
| `payloads`       | `readonly string[]`            | Requis    | Chemins des fichiers non suivis, relatifs au checkout, copiés depuis previous-files/ ou incoming/ dans la destination après les patches.                                                            |
| `staging`        | `"unavailable" \| "preserved"` | Requis    | preserved pour previous : les changements indexés sont restaurés dans l’index Git. unavailable pour incoming : l’index de la sandbox n’est pas capturé.                                             |
| `directory`      | `string`                       | Requis    | Dossier du transfert conservé, tel que l’indique details.recovery de l’erreur de synchronisation. Il doit contenir state.json et checksums.json.                                                    |
| `repository`     | `string`                       | Requis    | Dépôt Git hôte cloné dans la destination ; il est seulement lu. Un dépôt partiel, superficiel (shallow) ou à objets alternates échoue au contrôle Git.                                              |
| `destination`    | `string`                       | Requis    | Nouveau dossier à créer. Son parent doit exister ; le chemin ne doit pas exister et doit se trouver hors du dépôt, de ses métadonnées Git et du transfert.                                          |
| `side`           | `"previous" \| "incoming"`     | Requis    | previous restaure le worktree hôte tel qu’il était sauvegardé avant le transfert, index Git compris ; incoming restaure les commits, changements non commités et fichiers non suivis de la sandbox. |
| `maxBytes`       | `number \| undefined`          | Optionnel | Nombre maximal d’octets du transfert copiés et hachés, 1073741824 (1 Gio) par défaut. Un dépassement rejette avec le code configuration.                                                            |

## Signature

```ts
export interface RecoveryRestorePlan extends RecoveryRestoreOptions {
  readonly fingerprint: string;
  readonly manifestSha256: string;
  readonly commit: string;
  readonly payloads: readonly string[];
  readonly staging: "preserved" | "unavailable";
}
```

## Contrats associés

- [RecoveryRestoreOptions](../recoveryrestoreoptions/)
