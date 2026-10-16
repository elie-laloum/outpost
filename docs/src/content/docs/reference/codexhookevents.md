---
title: "CodexHookEvents"
description: "CodexHookEvents — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CodexHookEvents } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                                                                                                                                                                                                                                                                                                                                                                                                                               | Presence | Meaning                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`      | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "SessionStart"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly source?: string; readonly agent_type?: string; readonly session_title?: string; }`                                                                                                                      | Required | Native SessionStart payload from Codex, retained with its original field names. Unknown additional native fields are tolerated at runtime.      |
| `SessionEnd`        | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "SessionEnd"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly reason?: string; }`                                                                                                                                                                                       | Required | Native SessionEnd payload from Codex, retained with its original field names. Unknown additional native fields are tolerated at runtime.        |
| `UserPromptSubmit`  | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "UserPromptSubmit"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly prompt: string; readonly session_title?: string; }`                                                                                                                                                 | Required | Native UserPromptSubmit payload from Codex, retained with its original field names. Unknown additional native fields are tolerated at runtime.  |
| `PreToolUse`        | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "PreToolUse"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly tool_name: string; readonly tool_input?: unknown; readonly tool_use_id?: string; readonly mcp_server?: Readonly<Record<string, unknown>>; }`                                                              | Required | Native PreToolUse payload from Codex, retained with its original field names. Unknown additional native fields are tolerated at runtime.        |
| `PermissionRequest` | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "PermissionRequest"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly tool_name: string; readonly tool_input?: unknown; readonly tool_use_id?: string; readonly permission_suggestions?: readonly unknown[]; readonly mcp_server?: Readonly<Record<string, unknown>>; }` | Required | Native PermissionRequest payload from Codex, retained with its original field names. Unknown additional native fields are tolerated at runtime. |
| `PostToolUse`       | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "PostToolUse"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly tool_name: string; readonly tool_input?: unknown; readonly tool_use_id?: string; readonly tool_response?: unknown; readonly mcp_server?: Readonly<Record<string, unknown>>; }`                           | Required | Native PostToolUse payload from Codex, retained with its original field names. Unknown additional native fields are tolerated at runtime.       |
| `PreCompact`        | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "PreCompact"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly trigger?: "manual" \| "auto"; }`                                                                                                                                                                          | Required | Native PreCompact payload from Codex, retained with its original field names. Unknown additional native fields are tolerated at runtime.        |
| `PostCompact`       | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "PostCompact"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly trigger?: "manual" \| "auto"; }`                                                                                                                                                                         | Required | Native PostCompact payload from Codex, retained with its original field names. Unknown additional native fields are tolerated at runtime.       |
| `SubagentStart`     | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "SubagentStart"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly agent_id?: string; readonly agent_type?: string; }`                                                                                                                                                    | Required | Native SubagentStart payload from Codex, retained with its original field names. Unknown additional native fields are tolerated at runtime.     |
| `SubagentStop`      | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "SubagentStop"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly agent_id?: string; readonly agent_type?: string; readonly agent_transcript_path?: string \| null; readonly last_assistant_message?: string \| null; readonly stop_hook_active?: boolean; }`             | Required | Native SubagentStop payload from Codex, retained with its original field names. Unknown additional native fields are tolerated at runtime.      |
| `Stop`              | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "Stop"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly stop_hook_active?: boolean; readonly last_assistant_message?: string \| null; }`                                                                                                                                | Required | Native Stop payload from Codex, retained with its original field names. Unknown additional native fields are tolerated at runtime.              |
| `Interrupt`         | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "Interrupt"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; }`                                                                                                                                                                                                                  | Required | Native Interrupt payload from Codex, retained with its original field names. Unknown additional native fields are tolerated at runtime.         |

## Signature

```ts
export interface CodexHookEvents {
  readonly SessionStart: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "SessionStart";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly source?: string;
    readonly agent_type?: string;
    readonly session_title?: string;
  };
  readonly SessionEnd: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "SessionEnd";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly reason?: string;
  };
  readonly UserPromptSubmit: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "UserPromptSubmit";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly prompt: string;
    readonly session_title?: string;
  };
  readonly PreToolUse: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "PreToolUse";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly tool_name: string;
    readonly tool_input?: unknown;
    readonly tool_use_id?: string;
    readonly mcp_server?: Readonly<Record<string, unknown>>;
  };
  readonly PermissionRequest: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "PermissionRequest";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly tool_name: string;
    readonly tool_input?: unknown;
    readonly tool_use_id?: string;
    readonly permission_suggestions?: readonly unknown[];
    readonly mcp_server?: Readonly<Record<string, unknown>>;
  };
  readonly PostToolUse: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "PostToolUse";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly tool_name: string;
    readonly tool_input?: unknown;
    readonly tool_use_id?: string;
    readonly tool_response?: unknown;
    readonly mcp_server?: Readonly<Record<string, unknown>>;
  };
  readonly PreCompact: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "PreCompact";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly trigger?: "manual" | "auto";
  };
  readonly PostCompact: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "PostCompact";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly trigger?: "manual" | "auto";
  };
  readonly SubagentStart: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "SubagentStart";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
  };
  readonly SubagentStop: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "SubagentStop";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly agent_transcript_path?: string | null;
    readonly last_assistant_message?: string | null;
    readonly stop_hook_active?: boolean;
  };
  readonly Stop: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "Stop";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly stop_hook_active?: boolean;
    readonly last_assistant_message?: string | null;
  };
  readonly Interrupt: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "Interrupt";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
  };
}
```
