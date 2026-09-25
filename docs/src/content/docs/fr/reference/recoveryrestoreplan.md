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

| Nom              | Type                           | Présence  | Rôle                                                                                                                     |
| ---------------- | ------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| `fingerprint`    | `string`                       | Requis    | Empreinte liant le plan à la source conservée inspectée pour revalidation avant restauration.                            |
| `manifestSha256` | `string`                       | Requis    | SHA-256 du manifeste de transfert conservé, capturé lors de la planification de restauration.                            |
| `commit`         | `string`                       | Requis    | Commit Git utilisé pour reconstruire l’état conservé choisi.                                                             |
| `payloads`       | `readonly string[]`            | Requis    | Chemins des bundles et patches conservés nécessaires pour restaurer le côté choisi.                                      |
| `staging`        | `"unavailable" \| "preserved"` | Requis    | Indique si l’index Git d’origine est préservé ; l’état distant entrant ne fournit pas d’information d’index récupérable. |
| `directory`      | `string`                       | Requis    | Dossier hôte contenant les artefacts de transfert conservés à vérifier ou restaurer.                                     |
| `repository`     | `string`                       | Requis    | Checkout Git hôte ciblé.                                                                                                 |
| `destination`    | `string`                       | Requis    | Nouveau dossier de destination absent, hors du dépôt source, de ses métadonnées Git et du transfert conservé.            |
| `side`           | `"previous" \| "incoming"`     | Requis    | État conservé à restaurer : previous pour l’état hôte antérieur ou incoming pour l’état distant entrant.                 |
| `maxBytes`       | `number \| undefined`          | Optionnel | Nombre maximal d’octets de données conservées autorisé pour copier et vérifier les sources de restauration.              |

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
