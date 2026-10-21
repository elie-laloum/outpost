---
title: "AntigravityHookEvents"
description: "AntigravityHookEvents — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AntigravityHookEvents } from "@elie-laloum/outpost/core";
```

## Parameters and properties

| Name             | Type                                                                                                                                                                                                                                                                                                                                             | Presence | Meaning                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`   | `{ readonly conversationId: string; readonly workspacePaths: readonly string[]; readonly transcriptPath?: string; readonly artifactDirectoryPath?: string; readonly modelName?: string; }`                                                                                                                                                       | Required | Native SessionStart payload from Antigravity, retained with its original field names. Unknown additional native fields are tolerated at runtime.   |
| `PreToolUse`     | `{ readonly conversationId: string; readonly workspacePaths: readonly string[]; readonly transcriptPath?: string; readonly artifactDirectoryPath?: string; readonly modelName?: string; readonly toolCall?: { readonly name: string; readonly args: Readonly<Record<string, unknown>>; }; readonly stepIdx?: number; }`                          | Required | Native PreToolUse payload from Antigravity, retained with its original field names. Unknown additional native fields are tolerated at runtime.     |
| `PostToolUse`    | `{ readonly conversationId: string; readonly workspacePaths: readonly string[]; readonly transcriptPath?: string; readonly artifactDirectoryPath?: string; readonly modelName?: string; readonly toolCall?: { readonly name: string; readonly args: Readonly<Record<string, unknown>>; }; readonly stepIdx?: number; readonly error?: string; }` | Required | Native PostToolUse payload from Antigravity, retained with its original field names. Unknown additional native fields are tolerated at runtime.    |
| `PreInvocation`  | `{ readonly conversationId: string; readonly workspacePaths: readonly string[]; readonly transcriptPath?: string; readonly artifactDirectoryPath?: string; readonly modelName?: string; readonly invocationNum?: number; readonly initialNumSteps?: number; }`                                                                                   | Required | Native PreInvocation payload from Antigravity, retained with its original field names. Unknown additional native fields are tolerated at runtime.  |
| `PostInvocation` | `{ readonly conversationId: string; readonly workspacePaths: readonly string[]; readonly transcriptPath?: string; readonly artifactDirectoryPath?: string; readonly modelName?: string; readonly invocationNum?: number; readonly initialNumSteps?: number; }`                                                                                   | Required | Native PostInvocation payload from Antigravity, retained with its original field names. Unknown additional native fields are tolerated at runtime. |
| `Stop`           | `{ readonly conversationId: string; readonly workspacePaths: readonly string[]; readonly transcriptPath?: string; readonly artifactDirectoryPath?: string; readonly modelName?: string; readonly executionNum?: number; readonly terminationReason?: string; readonly error?: string; readonly fullyIdle?: boolean; }`                           | Required | Native Stop payload from Antigravity, retained with its original field names. Unknown additional native fields are tolerated at runtime.           |

## Signature

```ts
export interface AntigravityHookEvents {
  readonly SessionStart: {
    readonly conversationId: string;
    readonly workspacePaths: readonly string[];
    readonly transcriptPath?: string;
    readonly artifactDirectoryPath?: string;
    readonly modelName?: string;
  };
  readonly PreToolUse: {
    readonly conversationId: string;
    readonly workspacePaths: readonly string[];
    readonly transcriptPath?: string;
    readonly artifactDirectoryPath?: string;
    readonly modelName?: string;
    readonly toolCall?: {
      readonly name: string;
      readonly args: Readonly<Record<string, unknown>>;
    };
    readonly stepIdx?: number;
  };
  readonly PostToolUse: {
    readonly conversationId: string;
    readonly workspacePaths: readonly string[];
    readonly transcriptPath?: string;
    readonly artifactDirectoryPath?: string;
    readonly modelName?: string;
    readonly toolCall?: {
      readonly name: string;
      readonly args: Readonly<Record<string, unknown>>;
    };
    readonly stepIdx?: number;
    readonly error?: string;
  };
  readonly PreInvocation: {
    readonly conversationId: string;
    readonly workspacePaths: readonly string[];
    readonly transcriptPath?: string;
    readonly artifactDirectoryPath?: string;
    readonly modelName?: string;
    readonly invocationNum?: number;
    readonly initialNumSteps?: number;
  };
  readonly PostInvocation: {
    readonly conversationId: string;
    readonly workspacePaths: readonly string[];
    readonly transcriptPath?: string;
    readonly artifactDirectoryPath?: string;
    readonly modelName?: string;
    readonly invocationNum?: number;
    readonly initialNumSteps?: number;
  };
  readonly Stop: {
    readonly conversationId: string;
    readonly workspacePaths: readonly string[];
    readonly transcriptPath?: string;
    readonly artifactDirectoryPath?: string;
    readonly modelName?: string;
    readonly executionNum?: number;
    readonly terminationReason?: string;
    readonly error?: string;
    readonly fullyIdle?: boolean;
  };
}
```
