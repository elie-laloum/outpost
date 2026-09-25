---
title: "SandboxDiagnosticOptions"
description: "SandboxDiagnosticOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxDiagnosticOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                                        | Présence  | Rôle                                                                                      |
| ------------ | ----------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `agent`      | `DoctorAgent \| undefined`                                  | Optionnel | Identifiant du CLI d’agent à rapporter ou diagnostiquer : claude, codex ou gemini.        |
| `deadlineMs` | `number \| undefined`                                       | Optionnel | Durée maximale de chaque sonde de diagnostic en millisecondes.                            |
| `signal`     | `AbortSignal \| undefined`                                  | Optionnel | Annulation coopérative de cette opération.                                                |
| `transfers`  | `boolean \| undefined`                                      | Optionnel | Active des sondes temporaires d’envoi et téléchargement pendant le diagnostic de sandbox. |
| `provider`   | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optionnel | Nom et placement du provider utilisés pour interpréter le rapport de diagnostic.          |

## Signature

```ts
export interface SandboxDiagnosticOptions {
  readonly agent?: DoctorAgent;
  readonly deadlineMs?: number;
  readonly signal?: AbortSignal;
  readonly transfers?: boolean;
  readonly provider?: Pick<SandboxProvider, "name" | "placement">;
}
```

## Contrats associés

- [DoctorAgent](../doctoragent/)
- [SandboxProvider](../sandboxprovider/)
