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

| Nom                | Type                  | Présence  | Rôle                                                                                                                                                                                 |
| ------------------ | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`               | `string`              | Requis    | Identifiant stable à points, par exemple sandbox.node, agent.cli.resume ou model.                                                                                                    |
| `status`           | `DiagnosticStatus`    | Requis    | pass, warn, fail ou skipped. Seul fail active hasFailures ; warn signale un résultat différent ou non confirmé, par exemple une version d’agent autre que celle épinglée.            |
| `message`          | `string`              | Requis    | Explication du résultat ; la plupart des échecs se terminent par un remède.                                                                                                          |
| `version`          | `string \| undefined` | Optionnel | Version lue dans la sortie d’une sonde --version ; présente sur les contrôles de version uniquement.                                                                                 |
| `referenceVersion` | `string \| undefined` | Optionnel | Version de la CLI d’agent épinglée par Outpost et comparée à la version détectée ; présente sur les contrôles de version d’agent uniquement. Une autre version donne le statut warn. |

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
