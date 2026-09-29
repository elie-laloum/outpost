---
title: "projectKey"
description: "projectKey — Outpost API"
sidebar:
  order: 0
---

Supporting contract not directly exported; use TypeScript inference or the public type that references it.

## Purpose and behavior

Return Claude’s project folder name for a repository path, used under ~/.claude/projects: every character other than an ASCII letter or digit becomes -.

## Parameters and properties

| Name   | Type     | Presence | Meaning                                                                 |
| ------ | -------- | -------- | ----------------------------------------------------------------------- |
| `path` | `string` | Required | Repository path to encode for Claude’s native project directory layout. |

## Returns

`string`

## Signature

```ts
export declare function projectKey(path: string): string;
```
