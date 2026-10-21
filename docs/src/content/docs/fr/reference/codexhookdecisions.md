---
title: "CodexHookDecisions"
description: "CodexHookDecisions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CodexHookDecisions } from "@elie-laloum/outpost/core";
```

## Paramètres et propriétés

| Nom                 | Type                                                                                                                                                                                                                                                                                                                                                                | Présence | Rôle                                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`      | `string \| { readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "SessionStart"; readonly additionalContext?: string; }; readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`           | Requis   | Sortie native acceptée pour SessionStart ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.      |
| `SessionEnd`        | `never`                                                                                                                                                                                                                                                                                                                                                             | Requis   | Sortie native acceptée pour SessionEnd ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.        |
| `UserPromptSubmit`  | `string \| { readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "UserPromptSubmit"; readonly additionalContext?: string; }; readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`       | Requis   | Sortie native acceptée pour UserPromptSubmit ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.  |
| `PreToolUse`        | `{ readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PreToolUse"; readonly permissionDecision?: "allow" \| "deny"; readonly permissionDecisionReason?: string; readonly updatedInput?: Readonly<Record<string, unknown>>; readonly additionalContext?: string; }; }` | Requis   | Sortie native acceptée pour PreToolUse ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.        |
| `PermissionRequest` | `{ readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PermissionRequest"; readonly decision?: { readonly behavior: "allow" \| "deny"; readonly message?: string; }; }; }`                                                                                                                                                    | Requis   | Sortie native acceptée pour PermissionRequest ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif. |
| `PostToolUse`       | `{ readonly systemMessage?: string; readonly continue?: boolean; readonly stopReason?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PostToolUse"; readonly additionalContext?: string; }; }`                                                                                             | Requis   | Sortie native acceptée pour PostToolUse ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.       |
| `PreCompact`        | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                            | Requis   | Sortie native acceptée pour PreCompact ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.        |
| `PostCompact`       | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                            | Requis   | Sortie native acceptée pour PostCompact ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.       |
| `SubagentStart`     | `string \| { readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "SubagentStart"; readonly additionalContext?: string; }; readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`          | Requis   | Sortie native acceptée pour SubagentStart ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.     |
| `SubagentStop`      | `{ readonly decision?: "block"; readonly reason?: string; readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`                                                                                                                                     | Requis   | Sortie native acceptée pour SubagentStop ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.      |
| `Stop`              | `{ readonly decision?: "block"; readonly reason?: string; readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`                                                                                                                                     | Requis   | Sortie native acceptée pour Stop ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.              |
| `Interrupt`         | `{ readonly systemMessage?: string; }`                                                                                                                                                                                                                                                                                                                              | Requis   | Sortie native acceptée pour Interrupt ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.         |

## Signature

```ts
export interface CodexHookDecisions {
  readonly SessionStart:
    | string
    | {
        readonly decision?: "block";
        readonly reason?: string;
        readonly hookSpecificOutput?: {
          readonly hookEventName: "SessionStart";
          readonly additionalContext?: string;
        };
        readonly continue?: boolean;
        readonly stopReason?: string;
        readonly suppressOutput?: boolean;
        readonly systemMessage?: string;
        readonly terminalSequence?: string;
      };
  readonly SessionEnd: never;
  readonly UserPromptSubmit:
    | string
    | {
        readonly decision?: "block";
        readonly reason?: string;
        readonly hookSpecificOutput?: {
          readonly hookEventName: "UserPromptSubmit";
          readonly additionalContext?: string;
        };
        readonly continue?: boolean;
        readonly stopReason?: string;
        readonly suppressOutput?: boolean;
        readonly systemMessage?: string;
        readonly terminalSequence?: string;
      };
  readonly PreToolUse: {
    readonly systemMessage?: string;
    readonly decision?: "block";
    readonly reason?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "PreToolUse";
      readonly permissionDecision?: "allow" | "deny";
      readonly permissionDecisionReason?: string;
      readonly updatedInput?: Readonly<Record<string, unknown>>;
      readonly additionalContext?: string;
    };
  };
  readonly PermissionRequest: {
    readonly systemMessage?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "PermissionRequest";
      readonly decision?: {
        readonly behavior: "allow" | "deny";
        readonly message?: string;
      };
    };
  };
  readonly PostToolUse: {
    readonly systemMessage?: string;
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly decision?: "block";
    readonly reason?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "PostToolUse";
      readonly additionalContext?: string;
    };
  };
  readonly PreCompact: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly terminalSequence?: string;
  };
  readonly PostCompact: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly terminalSequence?: string;
  };
  readonly SubagentStart:
    | string
    | {
        readonly decision?: "block";
        readonly reason?: string;
        readonly hookSpecificOutput?: {
          readonly hookEventName: "SubagentStart";
          readonly additionalContext?: string;
        };
        readonly continue?: boolean;
        readonly stopReason?: string;
        readonly suppressOutput?: boolean;
        readonly systemMessage?: string;
        readonly terminalSequence?: string;
      };
  readonly SubagentStop: {
    readonly decision?: "block";
    readonly reason?: string;
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly terminalSequence?: string;
  };
  readonly Stop: {
    readonly decision?: "block";
    readonly reason?: string;
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly terminalSequence?: string;
  };
  readonly Interrupt: {
    readonly systemMessage?: string;
  };
}
```
