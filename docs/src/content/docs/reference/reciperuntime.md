---
title: "RecipeRuntime"
description: "RecipeRuntime — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeRuntime } from "@elie-laloum/outpost/recipes";
```

## Parameters and properties

| Name                    | Type                                                       | Presence | Meaning                                                                                                                                                                                                    |
| ----------------------- | ---------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `serve`                 | `(options: RecipeServeOptions) => Promise<void>`           | Required | Start one named service and its dependencies until cancellation or runtime closure; other declared services remain unconstructed.                                                                          |
| `enqueue`               | `(options: RecipeEnqueueOptions) => Promise<QueueJob>`     | Required | Publish a typed recipe parameter mapping to a named queue without starting a workflow or service; close only runtime-owned queue resources.                                                                |
| `run`                   | `(options?: RecipeRunOptions) => Promise<RecipeReport>`    | Required | Run one invocation at a time; close its owned resources before returning its report.                                                                                                                       |
| `resume`                | `(options: RecipeResumeOptions) => Promise<RecipeReport>`  | Required | Resume an existing durable run with its original inputs, workspace records and cumulative accounting. Changed identities or missing workspaces fail; interrupted tasks need explicit replay authorization. |
| `status`                | `(runId: string) => Promise<RecipeRunStatus \| undefined>` | Required | Read checkpoint revision, ownership, task summaries and retained workspace records without acquiring it; settled runs include their redacted final report.                                                 |
| `close`                 | `() => Promise<void>`                                      | Required | Prevent further runs, cancel the active run and wait for its cleanup; repeat calls are safe.                                                                                                               |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                      | Required | Close the runtime when leaving an await using scope.                                                                                                                                                       |

## Signature

```ts
export interface RecipeRuntime {
  serve(options: RecipeServeOptions): Promise<void>;
  enqueue(options: RecipeEnqueueOptions): Promise<QueueJob>;
  run(options?: RecipeRunOptions): Promise<RecipeReport>;
  resume(options: RecipeResumeOptions): Promise<RecipeReport>;
  status(runId: string): Promise<RecipeRunStatus | undefined>;
  close(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Related contracts

- [QueueJob](../queuejob/)
- [RecipeEnqueueOptions](../recipeenqueueoptions/)
- [RecipeReport](../support-recipereport/)
- [RecipeResumeOptions](../reciperesumeoptions/)
- [RecipeRunOptions](../reciperunoptions/)
- [RecipeRunStatus](../reciperunstatus/)
- [RecipeServeOptions](../recipeserveoptions/)
