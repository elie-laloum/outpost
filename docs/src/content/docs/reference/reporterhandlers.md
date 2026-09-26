---
title: "ReporterHandlers"
description: "ReporterHandlers — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ReporterHandlers } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                                                                                                                                                                                                                                                                     | Presence | Meaning                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `phase`        | `((event: { readonly kind: "phase"; readonly name: string; readonly agent?: string; readonly branch?: string; readonly directory?: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                  | Optional | Handle the execution phase and available agent/workspace metadata; receives pass and at metadata and may return a promise.                               |
| `summary`      | `((event: { readonly kind: "summary"; readonly durationMs: number; readonly status: number; readonly tokens: import("../domain/agent.types.ts").Usage; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                      | Optional | Handle the completed pass duration, exit status and authoritative token totals; receives pass and at metadata and may return a promise.                  |
| `warning`      | `((event: { readonly kind: "warning"; readonly message: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                             | Optional | Handle the non-fatal warning message; receives pass and at metadata and may return a promise.                                                            |
| `text`         | `((event: { readonly kind: "text"; readonly text: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                                   | Optional | Handle the agent text fragment; receives pass and at metadata and may return a promise.                                                                  |
| `result`       | `((event: { readonly kind: "result"; readonly text: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                                 | Optional | Handle the final agent response text; receives pass and at metadata and may return a promise.                                                            |
| `prompt`       | `((event: { readonly kind: "prompt"; readonly text: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                                 | Optional | Handle the rendered prompt sent to the agent; receives pass and at metadata and may return a promise.                                                    |
| `tool`         | `((event: { readonly kind: "tool"; readonly name: string; readonly input: unknown; readonly callId?: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                | Optional | Handle the tool name and input reported by the agent; receives pass and at metadata and may return a promise.                                            |
| `tool-result`  | `((event: { readonly kind: "tool-result"; readonly callId: string; readonly name: string; readonly isError: boolean; readonly preview: string; readonly characters: number; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined` | Optional | Handle the custom harness tool result, with its call identifier, error flag and bounded preview; receives pass and at metadata and may return a promise. |
| `step`         | `((event: { readonly kind: "step"; readonly index: number; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                                  | Optional | Handle the start of a custom harness step before its model request; receives pass and at metadata and may return a promise.                              |
| `conversation` | `((event: { readonly kind: "conversation"; readonly id: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                             | Optional | Handle the native conversation identifier; receives pass and at metadata and may return a promise.                                                       |
| `usage`        | `((event: { readonly kind: "usage"; readonly tokens: import("../domain/agent.types.ts").Usage; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                              | Optional | Handle the reported incremental token consumption; receives pass and at metadata and may return a promise.                                               |
| `failure`      | `((event: { readonly kind: "failure"; readonly message: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                             | Optional | Handle the failure message emitted by the agent protocol, not every dispatch rejection; receives pass and at metadata and may return a promise.          |
| `finished`     | `((event: { readonly kind: "finished"; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                                                      | Optional | Handle the agent protocol completion, before dispatch synchronization and cleanup; receives pass and at metadata and may return a promise.               |
| `raw`          | `((event: { readonly kind: "raw"; readonly value: unknown; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                                  | Optional | Handle the raw protocol data, which may contain sensitive content; receives pass and at metadata and may return a promise.                               |

## Signature

```ts
export type ReporterHandlers = {
  readonly [Kind in AgentObservation["kind"]]?: (
    event: Extract<
      AgentObservation,
      {
        kind: Kind;
      }
    >,
  ) => void | Promise<void>;
};
```

## Related contracts

- [AgentObservation](../agentobservation/)
