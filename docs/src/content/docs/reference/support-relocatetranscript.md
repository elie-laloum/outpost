---
title: "relocateTranscript"
description: "relocateTranscript — Outpost API"
sidebar:
  order: 0
---

Supporting contract not directly exported; use TypeScript inference or the public type that references it.

## Purpose and behavior

Return transcript text in which every cwd value equal to source becomes destination; without source, the first cwd recorded in the text is replaced. Lines that are not JSON are kept as they are, and no file is read or written.

## Parameters and properties

| Name          | Type                  | Presence | Meaning                                                                    |
| ------------- | --------------------- | -------- | -------------------------------------------------------------------------- |
| `text`        | `string`              | Required | Native transcript contents to rewrite.                                     |
| `destination` | `string`              | Required | Path written in place of each matching cwd value.                          |
| `source`      | `string \| undefined` | Optional | Recorded cwd value to replace; defaults to the first cwd recorded in text. |

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
