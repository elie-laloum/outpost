---
title: "KimiHookDecisions"
description: "KimiHookDecisions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { KimiHookDecisions } from "@elie-laloum/outpost/core";
```

## Paramètres et propriétés

| Nom                  | Type                                                                                                                                | Présence | Rôle                                                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UserPromptSubmit`   | `string \| { readonly hookSpecificOutput?: { readonly permissionDecision: "deny"; readonly permissionDecisionReason?: string; }; }` | Requis   | Sortie native acceptée pour UserPromptSubmit ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.   |
| `UserPromptQueued`   | `never`                                                                                                                             | Requis   | Sortie native acceptée pour UserPromptQueued ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.   |
| `PreToolUse`         | `string \| { readonly hookSpecificOutput?: { readonly permissionDecision: "deny"; readonly permissionDecisionReason?: string; }; }` | Requis   | Sortie native acceptée pour PreToolUse ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.         |
| `Stop`               | `string \| { readonly hookSpecificOutput?: { readonly permissionDecision: "deny"; readonly permissionDecisionReason?: string; }; }` | Requis   | Sortie native acceptée pour Stop ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.               |
| `TurnStarted`        | `never`                                                                                                                             | Requis   | Sortie native acceptée pour TurnStarted ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.        |
| `PostToolUse`        | `never`                                                                                                                             | Requis   | Sortie native acceptée pour PostToolUse ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.        |
| `PostToolUseFailure` | `never`                                                                                                                             | Requis   | Sortie native acceptée pour PostToolUseFailure ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif. |
| `PermissionRequest`  | `never`                                                                                                                             | Requis   | Sortie native acceptée pour PermissionRequest ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.  |
| `PermissionResult`   | `never`                                                                                                                             | Requis   | Sortie native acceptée pour PermissionResult ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.   |
| `SessionStart`       | `never`                                                                                                                             | Requis   | Sortie native acceptée pour SessionStart ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.       |
| `SessionEnd`         | `never`                                                                                                                             | Requis   | Sortie native acceptée pour SessionEnd ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.         |
| `SessionHeartbeat`   | `never`                                                                                                                             | Requis   | Sortie native acceptée pour SessionHeartbeat ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.   |
| `SubagentStart`      | `never`                                                                                                                             | Requis   | Sortie native acceptée pour SubagentStart ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.      |
| `SubagentStop`       | `never`                                                                                                                             | Requis   | Sortie native acceptée pour SubagentStop ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.       |
| `TaskStarted`        | `never`                                                                                                                             | Requis   | Sortie native acceptée pour TaskStarted ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.        |
| `StopFailure`        | `never`                                                                                                                             | Requis   | Sortie native acceptée pour StopFailure ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.        |
| `Interrupt`          | `never`                                                                                                                             | Requis   | Sortie native acceptée pour Interrupt ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.          |
| `PreCompact`         | `never`                                                                                                                             | Requis   | Sortie native acceptée pour PreCompact ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.         |
| `PostCompact`        | `never`                                                                                                                             | Requis   | Sortie native acceptée pour PostCompact ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.        |
| `Notification`       | `never`                                                                                                                             | Requis   | Sortie native acceptée pour Notification ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.       |

## Signature

```ts
export interface KimiHookDecisions {
  readonly UserPromptSubmit:
    | string
    | {
        readonly hookSpecificOutput?: {
          readonly permissionDecision: "deny";
          readonly permissionDecisionReason?: string;
        };
      };
  readonly UserPromptQueued: never;
  readonly PreToolUse:
    | string
    | {
        readonly hookSpecificOutput?: {
          readonly permissionDecision: "deny";
          readonly permissionDecisionReason?: string;
        };
      };
  readonly Stop:
    | string
    | {
        readonly hookSpecificOutput?: {
          readonly permissionDecision: "deny";
          readonly permissionDecisionReason?: string;
        };
      };
  readonly TurnStarted: never;
  readonly PostToolUse: never;
  readonly PostToolUseFailure: never;
  readonly PermissionRequest: never;
  readonly PermissionResult: never;
  readonly SessionStart: never;
  readonly SessionEnd: never;
  readonly SessionHeartbeat: never;
  readonly SubagentStart: never;
  readonly SubagentStop: never;
  readonly TaskStarted: never;
  readonly StopFailure: never;
  readonly Interrupt: never;
  readonly PreCompact: never;
  readonly PostCompact: never;
  readonly Notification: never;
}
```
