---
title: "DiagnosticCheck"
description: "DiagnosticCheck — Outpost API"
sidebar:
  order: 10
---

Contrat public de **DiagnosticCheck**. Consultez le [guide diagnostics](../../guide/operations/doctor/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { DiagnosticCheck } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter les prérequis hôtes, une sandbox possédée ou les fixtures de protocole. Les diagnostics sont des observations ; ils ne prouvent pas l’accès au compte ou au modèle.

Les contrôles distinguent capacités absentes, en échec et non prises en charge. Le diagnostic de sandbox utilise son verrou d’opération et ne devient pas propriétaire de sa fermeture.

[Exemple complet et règles détaillées](../../guide/operations/doctor/).

## Paramètres et propriétés

| Nom                | Type                  | Présence  | Rôle                                                                             |
| ------------------ | --------------------- | --------- | -------------------------------------------------------------------------------- |
| `id`               | `string`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `status`           | `DiagnosticStatus`    | Requis    | Résultat enregistré du processus ou cycle de vie ; voir son type.                |
| `message`          | `string`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `version`          | `string \| undefined` | Optionnel | Version de contrat ou graphe contrôlée par l’appelant.                           |
| `referenceVersion` | `string \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
