---
title: "ClaudeHookEvents"
description: "ClaudeHookEvents — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ClaudeHookEvents } from "@elie-laloum/outpost/core";
```

## Paramètres et propriétés

| Nom                   | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Présence | Rôle                                                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`        | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "SessionStart"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly source?: string; readonly model?: string; readonly session_title?: string; }`                                                                                                                                                                                                                            | Requis   | Contenu natif de SessionStart fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.        |
| `Setup`               | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "Setup"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly trigger?: string; }`                                                                                                                                                                                                                                                                                            | Requis   | Contenu natif de Setup fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.               |
| `UserPromptSubmit`    | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "UserPromptSubmit"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly prompt: string; readonly session_title?: string; }`                                                                                                                                                                                                                                                  | Requis   | Contenu natif de UserPromptSubmit fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.    |
| `UserPromptExpansion` | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "UserPromptExpansion"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly prompt: string; readonly expansion_type?: string; readonly command_name?: string; readonly command_args?: string; readonly command_source?: string; }`                                                                                                                                            | Requis   | Contenu natif de UserPromptExpansion fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution. |
| `PreToolUse`          | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PreToolUse"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_use_id?: string; readonly mcp_server?: Readonly<Record<string, unknown>>; }`                                                                                                                                     | Requis   | Contenu natif de PreToolUse fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.          |
| `PermissionRequest`   | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PermissionRequest"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_use_id?: string; readonly permission_suggestions?: readonly unknown[]; readonly mcp_server?: Readonly<Record<string, unknown>>; }`                                                                        | Requis   | Contenu natif de PermissionRequest fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.   |
| `PermissionDenied`    | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PermissionDenied"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_use_id?: string; readonly reason?: string; readonly mcp_server?: Readonly<Record<string, unknown>>; }`                                                                                                     | Requis   | Contenu natif de PermissionDenied fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.    |
| `PostToolUse`         | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PostToolUse"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_use_id?: string; readonly tool_response?: unknown; readonly mcp_server?: Readonly<Record<string, unknown>>; }`                                                                                                  | Requis   | Contenu natif de PostToolUse fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.         |
| `PostToolUseFailure`  | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PostToolUseFailure"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_use_id?: string; readonly error?: string; readonly is_interrupt?: boolean; readonly mcp_server?: Readonly<Record<string, unknown>>; }`                                                                   | Requis   | Contenu natif de PostToolUseFailure fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.  |
| `PostToolBatch`       | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PostToolBatch"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly tool_calls?: readonly { readonly tool_name?: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_use_id?: string; readonly tool_response?: unknown; }[]; }`                                                                                                                  | Requis   | Contenu natif de PostToolBatch fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.       |
| `Notification`        | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "Notification"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly message?: string; readonly title?: string; readonly notification_type?: string; }`                                                                                                                                                                                                                       | Requis   | Contenu natif de Notification fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.        |
| `MessageDisplay`      | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "MessageDisplay"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly delta: string; readonly turn_id?: string; readonly message_id?: string; readonly index?: number; readonly final?: boolean; }`                                                                                                                                                                          | Requis   | Contenu natif de MessageDisplay fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.      |
| `SubagentStart`       | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "SubagentStart"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; }`                                                                                                                                                                                                                                                                                                               | Requis   | Contenu natif de SubagentStart fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.       |
| `SubagentStop`        | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "SubagentStop"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly agent_transcript_path?: string; readonly last_assistant_message?: string; readonly stop_hook_active?: boolean; }`                                                                                                                                                                                        | Requis   | Contenu natif de SubagentStop fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.        |
| `TaskCreated`         | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "TaskCreated"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly task_id?: string; readonly task_subject?: string; readonly task_description?: string; }`                                                                                                                                                                                                                  | Requis   | Contenu natif de TaskCreated fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.         |
| `TaskCompleted`       | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "TaskCompleted"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly task_id?: string; readonly task_subject?: string; readonly task_description?: string; readonly teammate_name?: string; readonly team_name?: string; }`                                                                                                                                                  | Requis   | Contenu natif de TaskCompleted fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.       |
| `Stop`                | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "Stop"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly stop_hook_active?: boolean; readonly last_assistant_message?: string; }`                                                                                                                                                                                                                                         | Requis   | Contenu natif de Stop fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.                |
| `StopFailure`         | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "StopFailure"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly error?: string; readonly error_details?: string; readonly last_assistant_message?: string; }`                                                                                                                                                                                                             | Requis   | Contenu natif de StopFailure fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.         |
| `TeammateIdle`        | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "TeammateIdle"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly teammate_name?: string; readonly team_name?: string; }`                                                                                                                                                                                                                                                  | Requis   | Contenu natif de TeammateIdle fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.        |
| `InstructionsLoaded`  | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "InstructionsLoaded"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly file_path?: string; readonly memory_type?: string; readonly load_reason?: string; readonly globs?: readonly string[]; readonly trigger_file_path?: string; readonly parent_file_path?: string; }`                                                                                                  | Requis   | Contenu natif de InstructionsLoaded fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.  |
| `ConfigChange`        | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "ConfigChange"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly source?: string; readonly file_path?: string; }`                                                                                                                                                                                                                                                         | Requis   | Contenu natif de ConfigChange fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.        |
| `CwdChanged`          | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "CwdChanged"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly old_cwd?: string; readonly new_cwd?: string; }`                                                                                                                                                                                                                                                            | Requis   | Contenu natif de CwdChanged fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.          |
| `DirectoryAdded`      | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "DirectoryAdded"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly directory?: string; readonly source?: "slash_command" \| "register_repo_root"; }`                                                                                                                                                                                                                      | Requis   | Contenu natif de DirectoryAdded fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.      |
| `FileChanged`         | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "FileChanged"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly file_path?: string; readonly event?: string; }`                                                                                                                                                                                                                                                           | Requis   | Contenu natif de FileChanged fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.         |
| `WorktreeCreate`      | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "WorktreeCreate"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly name?: string; }`                                                                                                                                                                                                                                                                                      | Requis   | Contenu natif de WorktreeCreate fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.      |
| `WorktreeRemove`      | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "WorktreeRemove"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly worktree_path?: string; }`                                                                                                                                                                                                                                                                             | Requis   | Contenu natif de WorktreeRemove fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.      |
| `PreCompact`          | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PreCompact"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly trigger?: string; readonly custom_instructions?: string \| null; }`                                                                                                                                                                                                                                        | Requis   | Contenu natif de PreCompact fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.          |
| `PostCompact`         | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PostCompact"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly trigger?: string; readonly compact_summary?: string; }`                                                                                                                                                                                                                                                   | Requis   | Contenu natif de PostCompact fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.         |
| `PreModelSwitch`      | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PreModelSwitch"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly from_model?: string; readonly to_model?: string; readonly requested_model?: string \| null; readonly source?: string; readonly context_tokens?: number; readonly prompt_cache_warm?: boolean; readonly cache_ttl?: string; readonly estimated_cache_write_usd?: number; readonly pricing?: string; }`  | Requis   | Contenu natif de PreModelSwitch fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.      |
| `PostModelSwitch`     | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PostModelSwitch"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly from_model?: string; readonly to_model?: string; readonly requested_model?: string \| null; readonly source?: string; readonly context_tokens?: number; readonly prompt_cache_warm?: boolean; readonly cache_ttl?: string; readonly estimated_cache_write_usd?: number; readonly pricing?: string; }` | Requis   | Contenu natif de PostModelSwitch fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.     |
| `Elicitation`         | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "Elicitation"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly mcp_server_name?: string; readonly message?: string; readonly mode?: string; readonly requested_schema?: Readonly<Record<string, unknown>>; readonly elicitation_id?: string; readonly url?: string; }`                                                                                                   | Requis   | Contenu natif de Elicitation fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.         |
| `ElicitationResult`   | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "ElicitationResult"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly mcp_server_name?: string; readonly action?: string; readonly content?: Readonly<Record<string, unknown>>; }`                                                                                                                                                                                        | Requis   | Contenu natif de ElicitationResult fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.   |
| `SessionEnd`          | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "SessionEnd"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly reason?: string; }`                                                                                                                                                                                                                                                                                        | Requis   | Contenu natif de SessionEnd fourni par Claude, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.          |

## Signature

```ts
export interface ClaudeHookEvents {
  readonly SessionStart: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "SessionStart";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly source?: string;
    readonly model?: string;
    readonly session_title?: string;
  };
  readonly Setup: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "Setup";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly trigger?: string;
  };
  readonly UserPromptSubmit: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "UserPromptSubmit";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly prompt: string;
    readonly session_title?: string;
  };
  readonly UserPromptExpansion: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "UserPromptExpansion";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly prompt: string;
    readonly expansion_type?: string;
    readonly command_name?: string;
    readonly command_args?: string;
    readonly command_source?: string;
  };
  readonly PreToolUse: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "PreToolUse";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly tool_name: string;
    readonly tool_input?: Readonly<Record<string, unknown>>;
    readonly tool_use_id?: string;
    readonly mcp_server?: Readonly<Record<string, unknown>>;
  };
  readonly PermissionRequest: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "PermissionRequest";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly tool_name: string;
    readonly tool_input?: Readonly<Record<string, unknown>>;
    readonly tool_use_id?: string;
    readonly permission_suggestions?: readonly unknown[];
    readonly mcp_server?: Readonly<Record<string, unknown>>;
  };
  readonly PermissionDenied: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "PermissionDenied";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly tool_name: string;
    readonly tool_input?: Readonly<Record<string, unknown>>;
    readonly tool_use_id?: string;
    readonly reason?: string;
    readonly mcp_server?: Readonly<Record<string, unknown>>;
  };
  readonly PostToolUse: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "PostToolUse";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly tool_name: string;
    readonly tool_input?: Readonly<Record<string, unknown>>;
    readonly tool_use_id?: string;
    readonly tool_response?: unknown;
    readonly mcp_server?: Readonly<Record<string, unknown>>;
  };
  readonly PostToolUseFailure: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "PostToolUseFailure";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly tool_name: string;
    readonly tool_input?: Readonly<Record<string, unknown>>;
    readonly tool_use_id?: string;
    readonly error?: string;
    readonly is_interrupt?: boolean;
    readonly mcp_server?: Readonly<Record<string, unknown>>;
  };
  readonly PostToolBatch: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "PostToolBatch";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly tool_calls?: readonly {
      readonly tool_name?: string;
      readonly tool_input?: Readonly<Record<string, unknown>>;
      readonly tool_use_id?: string;
      readonly tool_response?: unknown;
    }[];
  };
  readonly Notification: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "Notification";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly message?: string;
    readonly title?: string;
    readonly notification_type?: string;
  };
  readonly MessageDisplay: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "MessageDisplay";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly delta: string;
    readonly turn_id?: string;
    readonly message_id?: string;
    readonly index?: number;
    readonly final?: boolean;
  };
  readonly SubagentStart: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "SubagentStart";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
  };
  readonly SubagentStop: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "SubagentStop";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly agent_transcript_path?: string;
    readonly last_assistant_message?: string;
    readonly stop_hook_active?: boolean;
  };
  readonly TaskCreated: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "TaskCreated";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly task_id?: string;
    readonly task_subject?: string;
    readonly task_description?: string;
  };
  readonly TaskCompleted: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "TaskCompleted";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly task_id?: string;
    readonly task_subject?: string;
    readonly task_description?: string;
    readonly teammate_name?: string;
    readonly team_name?: string;
  };
  readonly Stop: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "Stop";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly stop_hook_active?: boolean;
    readonly last_assistant_message?: string;
  };
  readonly StopFailure: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "StopFailure";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly error?: string;
    readonly error_details?: string;
    readonly last_assistant_message?: string;
  };
  readonly TeammateIdle: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "TeammateIdle";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly teammate_name?: string;
    readonly team_name?: string;
  };
  readonly InstructionsLoaded: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "InstructionsLoaded";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly file_path?: string;
    readonly memory_type?: string;
    readonly load_reason?: string;
    readonly globs?: readonly string[];
    readonly trigger_file_path?: string;
    readonly parent_file_path?: string;
  };
  readonly ConfigChange: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "ConfigChange";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly source?: string;
    readonly file_path?: string;
  };
  readonly CwdChanged: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "CwdChanged";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly old_cwd?: string;
    readonly new_cwd?: string;
  };
  readonly DirectoryAdded: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "DirectoryAdded";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly directory?: string;
    readonly source?: "slash_command" | "register_repo_root";
  };
  readonly FileChanged: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "FileChanged";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly file_path?: string;
    readonly event?: string;
  };
  readonly WorktreeCreate: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "WorktreeCreate";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly name?: string;
  };
  readonly WorktreeRemove: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "WorktreeRemove";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly worktree_path?: string;
  };
  readonly PreCompact: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "PreCompact";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly trigger?: string;
    readonly custom_instructions?: string | null;
  };
  readonly PostCompact: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "PostCompact";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly trigger?: string;
    readonly compact_summary?: string;
  };
  readonly PreModelSwitch: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "PreModelSwitch";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly from_model?: string;
    readonly to_model?: string;
    readonly requested_model?: string | null;
    readonly source?: string;
    readonly context_tokens?: number;
    readonly prompt_cache_warm?: boolean;
    readonly cache_ttl?: string;
    readonly estimated_cache_write_usd?: number;
    readonly pricing?: string;
  };
  readonly PostModelSwitch: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "PostModelSwitch";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly from_model?: string;
    readonly to_model?: string;
    readonly requested_model?: string | null;
    readonly source?: string;
    readonly context_tokens?: number;
    readonly prompt_cache_warm?: boolean;
    readonly cache_ttl?: string;
    readonly estimated_cache_write_usd?: number;
    readonly pricing?: string;
  };
  readonly Elicitation: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "Elicitation";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly mcp_server_name?: string;
    readonly message?: string;
    readonly mode?: string;
    readonly requested_schema?: Readonly<Record<string, unknown>>;
    readonly elicitation_id?: string;
    readonly url?: string;
  };
  readonly ElicitationResult: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "ElicitationResult";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly mcp_server_name?: string;
    readonly action?: string;
    readonly content?: Readonly<Record<string, unknown>>;
  };
  readonly SessionEnd: {
    readonly session_id: string;
    readonly transcript_path?: string;
    readonly cwd: string;
    readonly hook_event_name: "SessionEnd";
    readonly permission_mode?: string;
    readonly prompt_id?: string;
    readonly scratchpad_dir?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly effort?: {
      readonly level: string;
    };
    readonly reason?: string;
  };
}
```
