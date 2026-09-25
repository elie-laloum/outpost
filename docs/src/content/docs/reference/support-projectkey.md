---
title: "projectKey"
description: "projectKey — Outpost API"
sidebar:
  order: 0
---

Supporting contract not directly exported; use TypeScript inference or the public type that references it.

## Purpose and behavior

Convert a repository path into the directory key used by Claude’s native project transcript layout. This is a path-layout helper, not a conversation identifier.

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
