---
title: "QuotaResumePolicy"
description: "QuotaResumePolicy — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { QuotaResumePolicy } from "@elie-laloum/outpost";
```

## Purpose and behavior

quotaResume option of defineAgentTask() and defineIsolatedTask(): how a task resumes after a quota pause. Values: "continue" (default; continue the captured conversation with a resume brief when the agent is resumable and passes is 1, and a fallback agent reruns the brief on the interrupted branch), "restart" (run the original brief in a new conversation).

[Complete example and detailed rules](../../guide/quota-pauses/).

## Signature

```ts
export type QuotaResumePolicy = "continue" | "restart";
```
