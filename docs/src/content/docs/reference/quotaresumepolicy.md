---
title: "QuotaResumePolicy"
description: "QuotaResumePolicy — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { QuotaResumePolicy } from "@elie-laloum/outpost/workflows";
```

## Purpose and behavior

quotaResume option of defineAgentTask() and defineIsolatedTask(): how a task resumes after a quota pause. Values: "continue" (default; continue the captured conversation with a resume brief when the agent is resumable and passes is 1, and a fallback agent reruns the brief on the interrupted branch), "restart" (run the original brief in a new conversation).

[Complete example and detailed rules](../../guide/quota-pauses/).

<span id="outpost-instructions"></span>

## Instructions added by Outpost

Templates below preserve the English text sent to the model. `${…}` marks runtime substitutions, not brief template syntax.

Automatic continuation after a quota pause replaces the original brief with:

```text
Your previous turn was interrupted by a usage or rate limit before it finished. Continue the same task from where you stopped. Inspect the workspace first: changes that were not committed may be missing.
```

For ordinary agent tasks with a response tag, this line follows:

```text
Return the final answer inside <${tag}> and </${tag}>.
```

Dispatch then appends the complete [response-format instructions](../responsespec/#outpost-instructions). Interactive tasks use the same base quota message followed by their [dialogue protocol](../defineinteractiveagenttask/#outpost-instructions).

For ordinary tasks, this replacement requires `quotaResume: "continue"` (the default), a captured quota conversation, a resumable non-fallback agent, one pass and no explicit `continuation` in the request. Otherwise the requested brief is kept. A fallback agent restarts with the original brief. Interactive tasks manage their quota continuation internally and do not expose `quotaResume`.

The resume text cannot be overridden. `quotaResume: "restart"` selects the original request instead of this automatic continuation; it does not edit the resume message.

Implementation: [quota-resume.constants.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/quota-resume.constants.ts) · [quota-resume.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/quota-resume.ts).

## Signature

```ts
export type QuotaResumePolicy = "continue" | "restart";
```
