---
title: "ClaudeHookDecisions"
description: "ClaudeHookDecisions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ClaudeHookDecisions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                  | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Presence | Meaning                                                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`        | `string \| { readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "SessionStart"; readonly additionalContext?: string; readonly initialUserMessage?: string; readonly sessionTitle?: string; readonly watchPaths?: readonly string[]; readonly reloadSkills?: boolean; }; readonly terminalSequence?: string; }`                                            | Required | Accepted native output for SessionStart; never means this event accepts no callback decision. Returning nothing preserves the native flow.        |
| `Setup`               | `{ readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Required | Accepted native output for Setup; never means this event accepts no callback decision. Returning nothing preserves the native flow.               |
| `UserPromptSubmit`    | `string \| { readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "UserPromptSubmit"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                 | Required | Accepted native output for UserPromptSubmit; never means this event accepts no callback decision. Returning nothing preserves the native flow.    |
| `UserPromptExpansion` | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "UserPromptExpansion"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                        | Required | Accepted native output for UserPromptExpansion; never means this event accepts no callback decision. Returning nothing preserves the native flow. |
| `PreToolUse`          | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PreToolUse"; readonly permissionDecision?: "allow" \| "deny" \| "ask" \| "defer"; readonly permissionDecisionReason?: string; readonly updatedInput?: Readonly<Record<string, unknown>>; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                            | Required | Accepted native output for PreToolUse; never means this event accepts no callback decision. Returning nothing preserves the native flow.          |
| `PermissionRequest`   | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PermissionRequest"; readonly decision?: { readonly behavior: "allow" \| "deny"; readonly updatedInput?: Readonly<Record<string, unknown>>; readonly updatedPermissions?: readonly unknown[]; readonly message?: string; readonly interrupt?: boolean; }; }; readonly terminalSequence?: string; }` | Required | Accepted native output for PermissionRequest; never means this event accepts no callback decision. Returning nothing preserves the native flow.   |
| `PermissionDenied`    | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PermissionDenied"; readonly retry?: boolean; }; readonly terminalSequence?: string; }`                                                                                                                                                                                                             | Required | Accepted native output for PermissionDenied; never means this event accepts no callback decision. Returning nothing preserves the native flow.    |
| `PostToolUse`         | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PostToolUse"; readonly additionalContext?: string; readonly classifierContext?: string; readonly updatedToolOutput?: unknown; readonly updatedMCPToolOutput?: unknown; }; readonly terminalSequence?: string; }`                            | Required | Accepted native output for PostToolUse; never means this event accepts no callback decision. Returning nothing preserves the native flow.         |
| `PostToolUseFailure`  | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PostToolUseFailure"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                                                                                | Required | Accepted native output for PostToolUseFailure; never means this event accepts no callback decision. Returning nothing preserves the native flow.  |
| `PostToolBatch`       | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PostToolBatch"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                              | Required | Accepted native output for PostToolBatch; never means this event accepts no callback decision. Returning nothing preserves the native flow.       |
| `Notification`        | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "Notification"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                                                                                      | Required | Accepted native output for Notification; never means this event accepts no callback decision. Returning nothing preserves the native flow.        |
| `MessageDisplay`      | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "MessageDisplay"; readonly displayContent?: string; }; readonly terminalSequence?: string; }`                                                                                                                                                                                                       | Required | Accepted native output for MessageDisplay; never means this event accepts no callback decision. Returning nothing preserves the native flow.      |
| `SubagentStart`       | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "SubagentStart"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                                                                                     | Required | Accepted native output for SubagentStart; never means this event accepts no callback decision. Returning nothing preserves the native flow.       |
| `SubagentStop`        | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "SubagentStop"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                               | Required | Accepted native output for SubagentStop; never means this event accepts no callback decision. Returning nothing preserves the native flow.        |
| `TaskCreated`         | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                               | Required | Accepted native output for TaskCreated; never means this event accepts no callback decision. Returning nothing preserves the native flow.         |
| `TaskCompleted`       | `{ readonly continue?: boolean; readonly stopReason?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                          | Required | Accepted native output for TaskCompleted; never means this event accepts no callback decision. Returning nothing preserves the native flow.       |
| `Stop`                | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "Stop"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                                       | Required | Accepted native output for Stop; never means this event accepts no callback decision. Returning nothing preserves the native flow.                |
| `StopFailure`         | `{ readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Required | Accepted native output for StopFailure; never means this event accepts no callback decision. Returning nothing preserves the native flow.         |
| `TeammateIdle`        | `{ readonly continue?: boolean; readonly stopReason?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                          | Required | Accepted native output for TeammateIdle; never means this event accepts no callback decision. Returning nothing preserves the native flow.        |
| `InstructionsLoaded`  | `{ readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Required | Accepted native output for InstructionsLoaded; never means this event accepts no callback decision. Returning nothing preserves the native flow.  |
| `ConfigChange`        | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                               | Required | Accepted native output for ConfigChange; never means this event accepts no callback decision. Returning nothing preserves the native flow.        |
| `CwdChanged`          | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "CwdChanged"; readonly watchPaths?: readonly string[]; }; readonly terminalSequence?: string; }`                                                                                                                                                                                                    | Required | Accepted native output for CwdChanged; never means this event accepts no callback decision. Returning nothing preserves the native flow.          |
| `DirectoryAdded`      | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                      | Required | Accepted native output for DirectoryAdded; never means this event accepts no callback decision. Returning nothing preserves the native flow.      |
| `FileChanged`         | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "FileChanged"; readonly watchPaths?: readonly string[]; }; readonly terminalSequence?: string; }`                                                                                                                                                                                                   | Required | Accepted native output for FileChanged; never means this event accepts no callback decision. Returning nothing preserves the native flow.         |
| `WorktreeCreate`      | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Required | Accepted native output for WorktreeCreate; never means this event accepts no callback decision. Returning nothing preserves the native flow.      |
| `WorktreeRemove`      | `{ readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Required | Accepted native output for WorktreeRemove; never means this event accepts no callback decision. Returning nothing preserves the native flow.      |
| `PreCompact`          | `{ readonly decision?: "block"; readonly reason?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                              | Required | Accepted native output for PreCompact; never means this event accepts no callback decision. Returning nothing preserves the native flow.          |
| `PostCompact`         | `{ readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Required | Accepted native output for PostCompact; never means this event accepts no callback decision. Returning nothing preserves the native flow.         |
| `PreModelSwitch`      | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PreModelSwitch"; readonly permissionDecision?: "allow" \| "deny" \| "ask"; readonly permissionDecisionReason?: string; }; readonly terminalSequence?: string; }`                                                                            | Required | Accepted native output for PreModelSwitch; never means this event accepts no callback decision. Returning nothing preserves the native flow.      |
| `PostModelSwitch`     | `string \| { readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PostModelSwitch"; readonly additionalContext?: string; }; readonly terminalSequence?: string; }`                                                                                                                                                                                         | Required | Accepted native output for PostModelSwitch; never means this event accepts no callback decision. Returning nothing preserves the native flow.     |
| `Elicitation`         | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "Elicitation"; readonly action?: "accept" \| "decline" \| "cancel"; readonly content?: Readonly<Record<string, unknown>>; }; readonly decision?: "block"; readonly terminalSequence?: string; }`                                                                                                    | Required | Accepted native output for Elicitation; never means this event accepts no callback decision. Returning nothing preserves the native flow.         |
| `ElicitationResult`   | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "ElicitationResult"; readonly action?: "accept" \| "decline" \| "cancel"; readonly content?: Readonly<Record<string, unknown>>; }; readonly decision?: "block"; readonly terminalSequence?: string; }`                                                                                              | Required | Accepted native output for ElicitationResult; never means this event accepts no callback decision. Returning nothing preserves the native flow.   |
| `SessionEnd`          | `{ readonly terminalSequence?: string; }`                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Required | Accepted native output for SessionEnd; never means this event accepts no callback decision. Returning nothing preserves the native flow.          |

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
