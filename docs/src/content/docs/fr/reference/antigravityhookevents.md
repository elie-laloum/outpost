---
title: "AntigravityHookEvents"
description: "AntigravityHookEvents — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AntigravityHookEvents } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                                                                                                                                                                                                                                                                                                                                             | Présence | Rôle                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`   | `{ readonly conversationId: string; readonly workspacePaths: readonly string[]; readonly transcriptPath?: string; readonly artifactDirectoryPath?: string; readonly modelName?: string; }`                                                                                                                                                       | Requis   | Contenu natif de SessionStart fourni par Antigravity, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.   |
| `PreToolUse`     | `{ readonly conversationId: string; readonly workspacePaths: readonly string[]; readonly transcriptPath?: string; readonly artifactDirectoryPath?: string; readonly modelName?: string; readonly toolCall?: { readonly name: string; readonly args: Readonly<Record<string, unknown>>; }; readonly stepIdx?: number; }`                          | Requis   | Contenu natif de PreToolUse fourni par Antigravity, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.     |
| `PostToolUse`    | `{ readonly conversationId: string; readonly workspacePaths: readonly string[]; readonly transcriptPath?: string; readonly artifactDirectoryPath?: string; readonly modelName?: string; readonly toolCall?: { readonly name: string; readonly args: Readonly<Record<string, unknown>>; }; readonly stepIdx?: number; readonly error?: string; }` | Requis   | Contenu natif de PostToolUse fourni par Antigravity, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.    |
| `PreInvocation`  | `{ readonly conversationId: string; readonly workspacePaths: readonly string[]; readonly transcriptPath?: string; readonly artifactDirectoryPath?: string; readonly modelName?: string; readonly invocationNum?: number; readonly initialNumSteps?: number; }`                                                                                   | Requis   | Contenu natif de PreInvocation fourni par Antigravity, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.  |
| `PostInvocation` | `{ readonly conversationId: string; readonly workspacePaths: readonly string[]; readonly transcriptPath?: string; readonly artifactDirectoryPath?: string; readonly modelName?: string; readonly invocationNum?: number; readonly initialNumSteps?: number; }`                                                                                   | Requis   | Contenu natif de PostInvocation fourni par Antigravity, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution. |
| `Stop`           | `{ readonly conversationId: string; readonly workspacePaths: readonly string[]; readonly transcriptPath?: string; readonly artifactDirectoryPath?: string; readonly modelName?: string; readonly executionNum?: number; readonly terminationReason?: string; readonly error?: string; readonly fullyIdle?: boolean; }`                           | Requis   | Contenu natif de Stop fourni par Antigravity, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.           |

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
