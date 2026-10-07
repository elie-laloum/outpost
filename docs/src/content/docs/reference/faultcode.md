---
title: "FaultCode"
description: "FaultCode — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { FaultCode } from "@elie-laloum/outpost";
```

## Purpose and behavior

Stable code of every OutpostError; branch on it rather than on message. Values: "rejected" (workflow gate refused by an authorized actor), "configuration" (invalid options, overlapping variables, missing or malformed credential file, refused storage reservation), "process" (agent or command exits nonzero or without a final event), "timeout" (idle, deadline, command, tool, transfer, MCP startup, model request or workflow time limit elapsed), "aborted" (sandbox closed, command cancelled, harness turn or tool call ended, model request aborted), "workspace" (unsafe path or symlink, refused recovery quota admission, failed remote synchronization or recovery restore), "conflict" (worktree locked, branch checked out elsewhere, host edits during synchronization, failed automatic integration), "prompt" (missing prompt variable or failed prompt command), "response" (missing or invalid typed response, invalid model or MCP reply, model refusal), "session" (conversation or transcript missing or unreadable), "provider" (sandbox provider operation failed, model HTTP error other than 429, model stream error), "limit" (harness maxSteps, maxToolCalls, maxOutputTokens, token budget or delegation depth reached), "quota" (agent or model reported a terminal usage or rate limit), "replay" (replay agent diverged from its journal), "steering" (instruction not delivered before the dispatch ended or the controller closed). The value "guard" means a workspace committed-diff policy refused changes, references changed during inspection, or inspection could not complete.

[Complete example and detailed rules](../../guide/error-handling/).

## Signature

```ts
export type FaultCode =
  | "guard"
  | "rejected"
  | "configuration"
  | "process"
  | "timeout"
  | "aborted"
  | "workspace"
  | "conflict"
  | "prompt"
  | "response"
  | "session"
  | "provider"
  | "limit"
  | "quota"
  | "replay"
  | "steering";
```
