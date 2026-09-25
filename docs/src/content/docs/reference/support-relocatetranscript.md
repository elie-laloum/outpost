---
title: "relocateTranscript"
description: "relocateTranscript — Outpost API"
sidebar:
  order: 0
---

Supporting contract not directly exported; use TypeScript inference or the public type that references it.

## Purpose and behavior

Rewrite native transcript records from a source repository path to a destination repository path while preserving conversation data. The function returns rewritten text and does not itself read or write files.

## Parameters and properties

| Name          | Type                  | Presence | Meaning                                                                 |
| ------------- | --------------------- | -------- | ----------------------------------------------------------------------- |
| `text`        | `string`              | Required | Native transcript contents to rewrite.                                  |
| `destination` | `string`              | Required | New repository path to embed in relocated transcript records.           |
| `source`      | `string \| undefined` | Optional | Original repository path to replace when relocating transcript records. |

## Returns

`string`

## Signature

```ts
export declare function relocateTranscript(
  text: string,
  destination: string,
  source?: string,
): string;
```
