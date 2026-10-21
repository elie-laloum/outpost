---
title: "CodexHookEvents"
description: "CodexHookEvents — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CodexHookEvents } from "@elie-laloum/outpost/core";
```

## Paramètres et propriétés

| Nom                 | Type                                                                                                                                                                                                                                                                                                                                                                                                                                               | Présence | Rôle                                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`      | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "SessionStart"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly source?: string; readonly agent_type?: string; readonly session_title?: string; }`                                                                                                                      | Requis   | Contenu natif de SessionStart fourni par Codex, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.      |
| `SessionEnd`        | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "SessionEnd"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly reason?: string; }`                                                                                                                                                                                       | Requis   | Contenu natif de SessionEnd fourni par Codex, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.        |
| `UserPromptSubmit`  | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "UserPromptSubmit"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly prompt: string; readonly session_title?: string; }`                                                                                                                                                 | Requis   | Contenu natif de UserPromptSubmit fourni par Codex, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.  |
| `PreToolUse`        | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "PreToolUse"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly tool_name: string; readonly tool_input?: unknown; readonly tool_use_id?: string; readonly mcp_server?: Readonly<Record<string, unknown>>; }`                                                              | Requis   | Contenu natif de PreToolUse fourni par Codex, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.        |
| `PermissionRequest` | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "PermissionRequest"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly tool_name: string; readonly tool_input?: unknown; readonly tool_use_id?: string; readonly permission_suggestions?: readonly unknown[]; readonly mcp_server?: Readonly<Record<string, unknown>>; }` | Requis   | Contenu natif de PermissionRequest fourni par Codex, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution. |
| `PostToolUse`       | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "PostToolUse"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly tool_name: string; readonly tool_input?: unknown; readonly tool_use_id?: string; readonly tool_response?: unknown; readonly mcp_server?: Readonly<Record<string, unknown>>; }`                           | Requis   | Contenu natif de PostToolUse fourni par Codex, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.       |
| `PreCompact`        | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "PreCompact"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly trigger?: "manual" \| "auto"; }`                                                                                                                                                                          | Requis   | Contenu natif de PreCompact fourni par Codex, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.        |
| `PostCompact`       | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "PostCompact"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly trigger?: "manual" \| "auto"; }`                                                                                                                                                                         | Requis   | Contenu natif de PostCompact fourni par Codex, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.       |
| `SubagentStart`     | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "SubagentStart"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly agent_id?: string; readonly agent_type?: string; }`                                                                                                                                                    | Requis   | Contenu natif de SubagentStart fourni par Codex, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.     |
| `SubagentStop`      | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "SubagentStop"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly agent_id?: string; readonly agent_type?: string; readonly agent_transcript_path?: string \| null; readonly last_assistant_message?: string \| null; readonly stop_hook_active?: boolean; }`             | Requis   | Contenu natif de SubagentStop fourni par Codex, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.      |
| `Stop`              | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "Stop"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; readonly stop_hook_active?: boolean; readonly last_assistant_message?: string \| null; }`                                                                                                                                | Requis   | Contenu natif de Stop fourni par Codex, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.              |
| `Interrupt`         | `{ readonly session_id: string; readonly transcript_path?: string \| null; readonly cwd: string; readonly hook_event_name: "Interrupt"; readonly model?: string; readonly turn_id?: string; readonly permission_mode?: string; }`                                                                                                                                                                                                                  | Requis   | Contenu natif de Interrupt fourni par Codex, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.         |

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
