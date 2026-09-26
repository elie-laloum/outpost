---
title: "DiagnosticCheck"
description: "DiagnosticCheck — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DiagnosticCheck } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                  | Présence  | Rôle                                                                                                                               |
| ------------------ | --------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | `string`              | Requis    | Identifiant stable du contrôle de diagnostic dans le rapport.                                                                      |
| `status`           | `DiagnosticStatus`    | Requis    | Résultat du diagnostic : pass, warn, fail ou skipped.                                                                              |
| `message`          | `string`              | Requis    | Explication lisible de l’observation de diagnostic.                                                                                |
| `version`          | `string \| undefined` | Optionnel | Version détectée par la sonde de diagnostic lorsqu’elle est disponible.                                                            |
| `referenceVersion` | `string \| undefined` | Optionnel | Version épinglée du CLI visée par les fixtures de protocole intégrées ; absente pour Antigravity, qui n’a pas de version épinglée. |

## Signature

```ts
export interface DiagnosticCheck {
  readonly id: string;
  readonly status: DiagnosticStatus;
  readonly message: string;
  readonly version?: string;
  readonly referenceVersion?: string;
}
```

## Contrats associés

- [DiagnosticStatus](../diagnosticstatus/)
