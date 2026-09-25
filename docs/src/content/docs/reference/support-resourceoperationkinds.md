---
title: "resourceOperationKinds"
description: "resourceOperationKinds — Outpost API"
sidebar:
  order: 10
---

Supporting contract not directly exported; use TypeScript inference or the public type that references it.

## Purpose and behavior

List operation names accepted by local resource activity recording; ResourceOperationKind derives its allowed values from this constant.

## Signature

```ts
export declare const resourceOperationKinds: readonly [
  "dispatch",
  "attach",
  "diagnose",
  "command",
  "invoke",
  "upload",
  "download",
  "manifest",
  "download-batch",
  "upload-batch",
];
```
