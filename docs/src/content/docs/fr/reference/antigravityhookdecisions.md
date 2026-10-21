---
title: "AntigravityHookDecisions"
description: "AntigravityHookDecisions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AntigravityHookDecisions } from "@elie-laloum/outpost/core";
```

## Paramètres et propriétés

| Nom              | Type                                                                                                                                                                                                                                                                                                                                                               | Présence | Rôle                                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`   | `{ readonly injectSteps?: readonly { readonly systemMessage?: { readonly systemMessage?: string; readonly metadata?: Readonly<Record<string, unknown>>; }; readonly userMessage?: string; readonly ephemeralMessage?: string; readonly toolCall?: Readonly<Record<string, unknown>>; }[]; }`                                                                       | Requis   | Sortie native acceptée pour SessionStart ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.   |
| `PreToolUse`     | `{ readonly decision: "allow" \| "auto_approve" \| "deny" \| "ask" \| "force_ask" \| "deny_unless_prior_grant"; readonly reason?: string; readonly overwrite?: Readonly<Record<string, unknown>>; readonly permissionOverrides?: readonly string[]; }`                                                                                                             | Requis   | Sortie native acceptée pour PreToolUse ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.     |
| `PostToolUse`    | `{}`                                                                                                                                                                                                                                                                                                                                                               | Requis   | Sortie native acceptée pour PostToolUse ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.    |
| `PreInvocation`  | `{ readonly injectSteps?: readonly { readonly systemMessage?: { readonly systemMessage?: string; readonly metadata?: Readonly<Record<string, unknown>>; }; readonly userMessage?: string; readonly ephemeralMessage?: string; readonly toolCall?: Readonly<Record<string, unknown>>; }[]; }`                                                                       | Requis   | Sortie native acceptée pour PreInvocation ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.  |
| `PostInvocation` | `{ readonly injectSteps?: readonly { readonly systemMessage?: { readonly systemMessage?: string; readonly metadata?: Readonly<Record<string, unknown>>; }; readonly userMessage?: string; readonly ephemeralMessage?: string; readonly toolCall?: Readonly<Record<string, unknown>>; }[]; readonly terminationBehavior?: "force_continue" \| "terminate" \| ""; }` | Requis   | Sortie native acceptée pour PostInvocation ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif. |
| `Stop`           | `{ readonly decision: string; readonly reason?: string; }`                                                                                                                                                                                                                                                                                                         | Requis   | Sortie native acceptée pour Stop ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.           |

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
