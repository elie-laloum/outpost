---
title: "AntigravityHookDecisions"
description: "AntigravityHookDecisions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AntigravityHookDecisions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                                                                                                                                                                                                                                                                                                                                                               | Presence | Meaning                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`   | `{ readonly injectSteps?: readonly { readonly systemMessage?: { readonly systemMessage?: string; readonly metadata?: Readonly<Record<string, unknown>>; }; readonly userMessage?: string; readonly ephemeralMessage?: string; readonly toolCall?: Readonly<Record<string, unknown>>; }[]; }`                                                                       | Required | Accepted native output for SessionStart; never means this event accepts no callback decision. Returning nothing preserves the native flow.   |
| `PreToolUse`     | `{ readonly decision: "allow" \| "auto_approve" \| "deny" \| "ask" \| "force_ask" \| "deny_unless_prior_grant"; readonly reason?: string; readonly overwrite?: Readonly<Record<string, unknown>>; readonly permissionOverrides?: readonly string[]; }`                                                                                                             | Required | Accepted native output for PreToolUse; never means this event accepts no callback decision. Returning nothing preserves the native flow.     |
| `PostToolUse`    | `{}`                                                                                                                                                                                                                                                                                                                                                               | Required | Accepted native output for PostToolUse; never means this event accepts no callback decision. Returning nothing preserves the native flow.    |
| `PreInvocation`  | `{ readonly injectSteps?: readonly { readonly systemMessage?: { readonly systemMessage?: string; readonly metadata?: Readonly<Record<string, unknown>>; }; readonly userMessage?: string; readonly ephemeralMessage?: string; readonly toolCall?: Readonly<Record<string, unknown>>; }[]; }`                                                                       | Required | Accepted native output for PreInvocation; never means this event accepts no callback decision. Returning nothing preserves the native flow.  |
| `PostInvocation` | `{ readonly injectSteps?: readonly { readonly systemMessage?: { readonly systemMessage?: string; readonly metadata?: Readonly<Record<string, unknown>>; }; readonly userMessage?: string; readonly ephemeralMessage?: string; readonly toolCall?: Readonly<Record<string, unknown>>; }[]; readonly terminationBehavior?: "force_continue" \| "terminate" \| ""; }` | Required | Accepted native output for PostInvocation; never means this event accepts no callback decision. Returning nothing preserves the native flow. |
| `Stop`           | `{ readonly decision: string; readonly reason?: string; }`                                                                                                                                                                                                                                                                                                         | Required | Accepted native output for Stop; never means this event accepts no callback decision. Returning nothing preserves the native flow.           |

## Signature

```ts
export interface AntigravityHookDecisions {
  readonly SessionStart: {
    readonly injectSteps?: readonly {
      readonly systemMessage?: {
        readonly systemMessage?: string;
        readonly metadata?: Readonly<Record<string, unknown>>;
      };
      readonly userMessage?: string;
      readonly ephemeralMessage?: string;
      readonly toolCall?: Readonly<Record<string, unknown>>;
    }[];
  };
  readonly PreToolUse: {
    readonly decision:
      | "allow"
      | "auto_approve"
      | "deny"
      | "ask"
      | "force_ask"
      | "deny_unless_prior_grant";
    readonly reason?: string;
    readonly overwrite?: Readonly<Record<string, unknown>>;
    readonly permissionOverrides?: readonly string[];
  };
  readonly PostToolUse: {};
  readonly PreInvocation: {
    readonly injectSteps?: readonly {
      readonly systemMessage?: {
        readonly systemMessage?: string;
        readonly metadata?: Readonly<Record<string, unknown>>;
      };
      readonly userMessage?: string;
      readonly ephemeralMessage?: string;
      readonly toolCall?: Readonly<Record<string, unknown>>;
    }[];
  };
  readonly PostInvocation: {
    readonly injectSteps?: readonly {
      readonly systemMessage?: {
        readonly systemMessage?: string;
        readonly metadata?: Readonly<Record<string, unknown>>;
      };
      readonly userMessage?: string;
      readonly ephemeralMessage?: string;
      readonly toolCall?: Readonly<Record<string, unknown>>;
    }[];
    readonly terminationBehavior?: "force_continue" | "terminate" | "";
  };
  readonly Stop: {
    readonly decision: string;
    readonly reason?: string;
  };
}
```
