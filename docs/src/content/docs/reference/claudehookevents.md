---
title: "ClaudeHookEvents"
description: "ClaudeHookEvents — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ClaudeHookEvents } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                  | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Presence | Meaning                                                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`        | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "SessionStart"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly source?: string; readonly model?: string; readonly session_title?: string; }`                                                                                                                                                                                                                            | Required | Native SessionStart payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.        |
| `Setup`               | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "Setup"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly trigger?: string; }`                                                                                                                                                                                                                                                                                            | Required | Native Setup payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.               |
| `UserPromptSubmit`    | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "UserPromptSubmit"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly prompt: string; readonly session_title?: string; }`                                                                                                                                                                                                                                                  | Required | Native UserPromptSubmit payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.    |
| `UserPromptExpansion` | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "UserPromptExpansion"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly prompt: string; readonly expansion_type?: string; readonly command_name?: string; readonly command_args?: string; readonly command_source?: string; }`                                                                                                                                            | Required | Native UserPromptExpansion payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime. |
| `PreToolUse`          | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PreToolUse"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_use_id?: string; readonly mcp_server?: Readonly<Record<string, unknown>>; }`                                                                                                                                     | Required | Native PreToolUse payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.          |
| `PermissionRequest`   | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PermissionRequest"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_use_id?: string; readonly permission_suggestions?: readonly unknown[]; readonly mcp_server?: Readonly<Record<string, unknown>>; }`                                                                        | Required | Native PermissionRequest payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.   |
| `PermissionDenied`    | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PermissionDenied"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_use_id?: string; readonly reason?: string; readonly mcp_server?: Readonly<Record<string, unknown>>; }`                                                                                                     | Required | Native PermissionDenied payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.    |
| `PostToolUse`         | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PostToolUse"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_use_id?: string; readonly tool_response?: unknown; readonly mcp_server?: Readonly<Record<string, unknown>>; }`                                                                                                  | Required | Native PostToolUse payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.         |
| `PostToolUseFailure`  | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PostToolUseFailure"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_use_id?: string; readonly error?: string; readonly is_interrupt?: boolean; readonly mcp_server?: Readonly<Record<string, unknown>>; }`                                                                   | Required | Native PostToolUseFailure payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.  |
| `PostToolBatch`       | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PostToolBatch"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly tool_calls?: readonly { readonly tool_name?: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_use_id?: string; readonly tool_response?: unknown; }[]; }`                                                                                                                  | Required | Native PostToolBatch payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.       |
| `Notification`        | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "Notification"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly message?: string; readonly title?: string; readonly notification_type?: string; }`                                                                                                                                                                                                                       | Required | Native Notification payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.        |
| `MessageDisplay`      | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "MessageDisplay"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly delta: string; readonly turn_id?: string; readonly message_id?: string; readonly index?: number; readonly final?: boolean; }`                                                                                                                                                                          | Required | Native MessageDisplay payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.      |
| `SubagentStart`       | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "SubagentStart"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; }`                                                                                                                                                                                                                                                                                                               | Required | Native SubagentStart payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.       |
| `SubagentStop`        | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "SubagentStop"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly agent_transcript_path?: string; readonly last_assistant_message?: string; readonly stop_hook_active?: boolean; }`                                                                                                                                                                                        | Required | Native SubagentStop payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.        |
| `TaskCreated`         | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "TaskCreated"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly task_id?: string; readonly task_subject?: string; readonly task_description?: string; }`                                                                                                                                                                                                                  | Required | Native TaskCreated payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.         |
| `TaskCompleted`       | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "TaskCompleted"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly task_id?: string; readonly task_subject?: string; readonly task_description?: string; readonly teammate_name?: string; readonly team_name?: string; }`                                                                                                                                                  | Required | Native TaskCompleted payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.       |
| `Stop`                | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "Stop"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly stop_hook_active?: boolean; readonly last_assistant_message?: string; }`                                                                                                                                                                                                                                         | Required | Native Stop payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.                |
| `StopFailure`         | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "StopFailure"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly error?: string; readonly error_details?: string; readonly last_assistant_message?: string; }`                                                                                                                                                                                                             | Required | Native StopFailure payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.         |
| `TeammateIdle`        | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "TeammateIdle"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly teammate_name?: string; readonly team_name?: string; }`                                                                                                                                                                                                                                                  | Required | Native TeammateIdle payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.        |
| `InstructionsLoaded`  | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "InstructionsLoaded"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly file_path?: string; readonly memory_type?: string; readonly load_reason?: string; readonly globs?: readonly string[]; readonly trigger_file_path?: string; readonly parent_file_path?: string; }`                                                                                                  | Required | Native InstructionsLoaded payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.  |
| `ConfigChange`        | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "ConfigChange"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly source?: string; readonly file_path?: string; }`                                                                                                                                                                                                                                                         | Required | Native ConfigChange payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.        |
| `CwdChanged`          | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "CwdChanged"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly old_cwd?: string; readonly new_cwd?: string; }`                                                                                                                                                                                                                                                            | Required | Native CwdChanged payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.          |
| `DirectoryAdded`      | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "DirectoryAdded"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly directory?: string; readonly source?: "slash_command" \| "register_repo_root"; }`                                                                                                                                                                                                                      | Required | Native DirectoryAdded payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.      |
| `FileChanged`         | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "FileChanged"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly file_path?: string; readonly event?: string; }`                                                                                                                                                                                                                                                           | Required | Native FileChanged payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.         |
| `WorktreeCreate`      | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "WorktreeCreate"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly name?: string; }`                                                                                                                                                                                                                                                                                      | Required | Native WorktreeCreate payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.      |
| `WorktreeRemove`      | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "WorktreeRemove"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly worktree_path?: string; }`                                                                                                                                                                                                                                                                             | Required | Native WorktreeRemove payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.      |
| `PreCompact`          | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PreCompact"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly trigger?: string; readonly custom_instructions?: string \| null; }`                                                                                                                                                                                                                                        | Required | Native PreCompact payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.          |
| `PostCompact`         | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PostCompact"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly trigger?: string; readonly compact_summary?: string; }`                                                                                                                                                                                                                                                   | Required | Native PostCompact payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.         |
| `PreModelSwitch`      | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PreModelSwitch"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly from_model?: string; readonly to_model?: string; readonly requested_model?: string \| null; readonly source?: string; readonly context_tokens?: number; readonly prompt_cache_warm?: boolean; readonly cache_ttl?: string; readonly estimated_cache_write_usd?: number; readonly pricing?: string; }`  | Required | Native PreModelSwitch payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.      |
| `PostModelSwitch`     | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "PostModelSwitch"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly from_model?: string; readonly to_model?: string; readonly requested_model?: string \| null; readonly source?: string; readonly context_tokens?: number; readonly prompt_cache_warm?: boolean; readonly cache_ttl?: string; readonly estimated_cache_write_usd?: number; readonly pricing?: string; }` | Required | Native PostModelSwitch payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.     |
| `Elicitation`         | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "Elicitation"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly mcp_server_name?: string; readonly message?: string; readonly mode?: string; readonly requested_schema?: Readonly<Record<string, unknown>>; readonly elicitation_id?: string; readonly url?: string; }`                                                                                                   | Required | Native Elicitation payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.         |
| `ElicitationResult`   | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "ElicitationResult"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly mcp_server_name?: string; readonly action?: string; readonly content?: Readonly<Record<string, unknown>>; }`                                                                                                                                                                                        | Required | Native ElicitationResult payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.   |
| `SessionEnd`          | `{ readonly session_id: string; readonly transcript_path?: string; readonly cwd: string; readonly hook_event_name: "SessionEnd"; readonly permission_mode?: string; readonly prompt_id?: string; readonly scratchpad_dir?: string; readonly agent_id?: string; readonly agent_type?: string; readonly effort?: { readonly level: string; }; readonly reason?: string; }`                                                                                                                                                                                                                                                                                        | Required | Native SessionEnd payload from Claude, retained with its original field names. Unknown additional native fields are tolerated at runtime.          |

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
