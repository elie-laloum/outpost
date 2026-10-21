---
title: "ClaudeHookDecisions"
description: "ClaudeHookDecisions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ClaudeHookDecisions } from "@elie-laloum/outpost/core";
```

## Paramètres et propriétés

| Nom                   | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Présence | Rôle                                                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`        | `string \| { readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "SessionStart"; readonly additionalContext?: string; readonly initialUserMessage?: string; readonly sessionTitle?: string; readonly watchPaths?: readonly string[]; readonly reloadSkills?: boolean; }; readonly terminalSequence?: string; }`                                            | Requis   | Sortie native acceptée pour SessionStart ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.        |
| `Setup`               | `{ readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Requis   | Sortie native acceptée pour Setup ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.               |
| `UserPromptSubmit`    | `string \| { readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "UserPromptSubmit"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                 | Requis   | Sortie native acceptée pour UserPromptSubmit ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.    |
| `UserPromptExpansion` | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "UserPromptExpansion"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                        | Requis   | Sortie native acceptée pour UserPromptExpansion ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif. |
| `PreToolUse`          | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PreToolUse"; readonly permissionDecision?: "allow" \| "deny" \| "ask" \| "defer"; readonly permissionDecisionReason?: string; readonly updatedInput?: Readonly<Record<string, unknown>>; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                            | Requis   | Sortie native acceptée pour PreToolUse ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.          |
| `PermissionRequest`   | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PermissionRequest"; readonly decision?: { readonly behavior: "allow" \| "deny"; readonly updatedInput?: Readonly<Record<string, unknown>>; readonly updatedPermissions?: readonly unknown[]; readonly message?: string; readonly interrupt?: boolean; }; }; readonly terminalSequence?: string; }` | Requis   | Sortie native acceptée pour PermissionRequest ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.   |
| `PermissionDenied`    | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PermissionDenied"; readonly retry?: boolean; }; readonly terminalSequence?: string; }`                                                                                                                                                                                                             | Requis   | Sortie native acceptée pour PermissionDenied ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.    |
| `PostToolUse`         | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PostToolUse"; readonly additionalContext?: string; readonly classifierContext?: string; readonly updatedToolOutput?: unknown; readonly updatedMCPToolOutput?: unknown; }; readonly terminalSequence?: string; }`                            | Requis   | Sortie native acceptée pour PostToolUse ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.         |
| `PostToolUseFailure`  | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PostToolUseFailure"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                                                                                | Requis   | Sortie native acceptée pour PostToolUseFailure ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.  |
| `PostToolBatch`       | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PostToolBatch"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                              | Requis   | Sortie native acceptée pour PostToolBatch ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.       |
| `Notification`        | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "Notification"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                                                                                      | Requis   | Sortie native acceptée pour Notification ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.        |
| `MessageDisplay`      | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "MessageDisplay"; readonly displayContent?: string; }; readonly terminalSequence?: string; }`                                                                                                                                                                                                       | Requis   | Sortie native acceptée pour MessageDisplay ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.      |
| `SubagentStart`       | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "SubagentStart"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                                                                                     | Requis   | Sortie native acceptée pour SubagentStart ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.       |
| `SubagentStop`        | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "SubagentStop"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                               | Requis   | Sortie native acceptée pour SubagentStop ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.        |
| `TaskCreated`         | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                               | Requis   | Sortie native acceptée pour TaskCreated ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.         |
| `TaskCompleted`       | `{ readonly continue?: boolean; readonly stopReason?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                          | Requis   | Sortie native acceptée pour TaskCompleted ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.       |
| `Stop`                | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "Stop"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                                       | Requis   | Sortie native acceptée pour Stop ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.                |
| `StopFailure`         | `{ readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Requis   | Sortie native acceptée pour StopFailure ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.         |
| `TeammateIdle`        | `{ readonly continue?: boolean; readonly stopReason?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                          | Requis   | Sortie native acceptée pour TeammateIdle ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.        |
| `InstructionsLoaded`  | `{ readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Requis   | Sortie native acceptée pour InstructionsLoaded ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.  |
| `ConfigChange`        | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                               | Requis   | Sortie native acceptée pour ConfigChange ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.        |
| `CwdChanged`          | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "CwdChanged"; readonly watchPaths?: readonly string[]; }; readonly terminalSequence?: string; }`                                                                                                                                                                                                    | Requis   | Sortie native acceptée pour CwdChanged ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.          |
| `DirectoryAdded`      | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                      | Requis   | Sortie native acceptée pour DirectoryAdded ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.      |
| `FileChanged`         | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "FileChanged"; readonly watchPaths?: readonly string[]; }; readonly terminalSequence?: string; }`                                                                                                                                                                                                   | Requis   | Sortie native acceptée pour FileChanged ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.         |
| `WorktreeCreate`      | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Requis   | Sortie native acceptée pour WorktreeCreate ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.      |
| `WorktreeRemove`      | `{ readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Requis   | Sortie native acceptée pour WorktreeRemove ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.      |
| `PreCompact`          | `{ readonly decision?: "block"; readonly reason?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                              | Requis   | Sortie native acceptée pour PreCompact ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.          |
| `PostCompact`         | `{ readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Requis   | Sortie native acceptée pour PostCompact ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.         |
| `PreModelSwitch`      | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PreModelSwitch"; readonly permissionDecision?: "allow" \| "deny" \| "ask"; readonly permissionDecisionReason?: string; }; readonly terminalSequence?: string; }`                                                                            | Requis   | Sortie native acceptée pour PreModelSwitch ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.      |
| `PostModelSwitch`     | `string \| { readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PostModelSwitch"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                                                                         | Requis   | Sortie native acceptée pour PostModelSwitch ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.     |
| `Elicitation`         | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "Elicitation"; readonly action?: "accept" \| "decline" \| "cancel"; readonly content?: Readonly<Record<string, unknown>>; }; readonly decision?: "block"; readonly terminalSequence?: string; }`                                                                                                    | Requis   | Sortie native acceptée pour Elicitation ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.         |
| `ElicitationResult`   | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "ElicitationResult"; readonly action?: "accept" \| "decline" \| "cancel"; readonly content?: Readonly<Record<string, unknown>>; }; readonly decision?: "block"; readonly terminalSequence?: string; }`                                                                                              | Requis   | Sortie native acceptée pour ElicitationResult ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.   |
| `SessionEnd`          | `{ readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Requis   | Sortie native acceptée pour SessionEnd ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.          |

## Signature

```ts
export interface ClaudeHookDecisions {
  readonly SessionStart:
    | string
    | {
        readonly continue?: boolean;
        readonly stopReason?: string;
        readonly suppressOutput?: boolean;
        readonly systemMessage?: string;
        readonly hookSpecificOutput?: {
          readonly hookEventName: "SessionStart";
          readonly additionalContext?: string;
          readonly initialUserMessage?: string;
          readonly sessionTitle?: string;
          readonly watchPaths?: readonly string[];
          readonly reloadSkills?: boolean;
        };
        readonly terminalSequence?: string;
      };
  readonly Setup: {
    readonly terminalSequence?: string;
  };
  readonly UserPromptSubmit:
    | string
    | {
        readonly continue?: boolean;
        readonly stopReason?: string;
        readonly suppressOutput?: boolean;
        readonly systemMessage?: string;
        readonly decision?: "block";
        readonly reason?: string;
        readonly hookSpecificOutput?: {
          readonly hookEventName: "UserPromptSubmit";
          readonly additionalContext?: string;
        };
        readonly terminalSequence?: string;
      };
  readonly UserPromptExpansion: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly decision?: "block";
    readonly reason?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "UserPromptExpansion";
      readonly additionalContext?: string;
    };
    readonly terminalSequence?: string;
  };
  readonly PreToolUse: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "PreToolUse";
      readonly permissionDecision?: "allow" | "deny" | "ask" | "defer";
      readonly permissionDecisionReason?: string;
      readonly updatedInput?: Readonly<Record<string, unknown>>;
      readonly additionalContext?: string;
    };
    readonly terminalSequence?: string;
  };
  readonly PermissionRequest: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "PermissionRequest";
      readonly decision?: {
        readonly behavior: "allow" | "deny";
        readonly updatedInput?: Readonly<Record<string, unknown>>;
        readonly updatedPermissions?: readonly unknown[];
        readonly message?: string;
        readonly interrupt?: boolean;
      };
    };
    readonly terminalSequence?: string;
  };
  readonly PermissionDenied: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "PermissionDenied";
      readonly retry?: boolean;
    };
    readonly terminalSequence?: string;
  };
  readonly PostToolUse: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly decision?: "block";
    readonly reason?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "PostToolUse";
      readonly additionalContext?: string;
      readonly classifierContext?: string;
      readonly updatedToolOutput?: unknown;
      readonly updatedMCPToolOutput?: unknown;
    };
    readonly terminalSequence?: string;
  };
  readonly PostToolUseFailure: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "PostToolUseFailure";
      readonly additionalContext?: string;
    };
    readonly terminalSequence?: string;
  };
  readonly PostToolBatch: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly decision?: "block";
    readonly reason?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "PostToolBatch";
      readonly additionalContext?: string;
    };
    readonly terminalSequence?: string;
  };
  readonly Notification: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "Notification";
      readonly additionalContext?: string;
    };
    readonly terminalSequence?: string;
  };
  readonly MessageDisplay: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "MessageDisplay";
      readonly displayContent?: string;
    };
    readonly terminalSequence?: string;
  };
  readonly SubagentStart: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "SubagentStart";
      readonly additionalContext?: string;
    };
    readonly terminalSequence?: string;
  };
  readonly SubagentStop: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly decision?: "block";
    readonly reason?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "SubagentStop";
      readonly additionalContext?: string;
    };
    readonly terminalSequence?: string;
  };
  readonly TaskCreated: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly decision?: "block";
    readonly reason?: string;
    readonly terminalSequence?: string;
  };
  readonly TaskCompleted: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly terminalSequence?: string;
  };
  readonly Stop: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly decision?: "block";
    readonly reason?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "Stop";
      readonly additionalContext?: string;
    };
    readonly terminalSequence?: string;
  };
  readonly StopFailure: {
    readonly terminalSequence?: string;
  };
  readonly TeammateIdle: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly terminalSequence?: string;
  };
  readonly InstructionsLoaded: {
    readonly terminalSequence?: string;
  };
  readonly ConfigChange: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly decision?: "block";
    readonly reason?: string;
    readonly terminalSequence?: string;
  };
  readonly CwdChanged: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "CwdChanged";
      readonly watchPaths?: readonly string[];
    };
    readonly terminalSequence?: string;
  };
  readonly DirectoryAdded: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly terminalSequence?: string;
  };
  readonly FileChanged: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "FileChanged";
      readonly watchPaths?: readonly string[];
    };
    readonly terminalSequence?: string;
  };
  readonly WorktreeCreate: string;
  readonly WorktreeRemove: {
    readonly terminalSequence?: string;
  };
  readonly PreCompact: {
    readonly decision?: "block";
    readonly reason?: string;
    readonly terminalSequence?: string;
  };
  readonly PostCompact: {
    readonly terminalSequence?: string;
  };
  readonly PreModelSwitch: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly decision?: "block";
    readonly reason?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "PreModelSwitch";
      readonly permissionDecision?: "allow" | "deny" | "ask";
      readonly permissionDecisionReason?: string;
    };
    readonly terminalSequence?: string;
  };
  readonly PostModelSwitch:
    | string
    | {
        readonly continue?: boolean;
        readonly stopReason?: string;
        readonly suppressOutput?: boolean;
        readonly systemMessage?: string;
        readonly hookSpecificOutput?: {
          readonly hookEventName: "PostModelSwitch";
          readonly additionalContext?: string;
        };
        readonly terminalSequence?: string;
      };
  readonly Elicitation: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "Elicitation";
      readonly action?: "accept" | "decline" | "cancel";
      readonly content?: Readonly<Record<string, unknown>>;
    };
    readonly decision?: "block";
    readonly terminalSequence?: string;
  };
  readonly ElicitationResult: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "ElicitationResult";
      readonly action?: "accept" | "decline" | "cancel";
      readonly content?: Readonly<Record<string, unknown>>;
    };
    readonly decision?: "block";
    readonly terminalSequence?: string;
  };
  readonly SessionEnd: {
    readonly terminalSequence?: string;
  };
}
```
