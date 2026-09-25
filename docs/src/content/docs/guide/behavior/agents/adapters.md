---
title: "Claude Code and Codex"
description: "Claude Code and Codex — Outpost"
sidebar:
  order: 2
---

An adapter configures the native agent CLI. It is independent from the sandbox provider and can be reused across calls.

```ts
import { claude, codex, agentVersions } from "@elie-laloum/outpost";

const reviewer = claude({
  model: "sonnet",
  reasoning: "high",
  permissions: "acceptEdits",
});
const implementer = codex({
  reasoning: "high",
  approvalReviewer: "auto_review",
});
console.log(reviewer.name, implementer.name, agentVersions);
```

| Setting             | Claude Code                                                              | Codex                            |
| ------------------- | ------------------------------------------------------------------------ | -------------------------------- |
| `model`             | Optional CLI model name                                                  | Optional CLI model name          |
| `reasoning`         | `low`, `medium`, `high`, `xhigh`, `max`                                  | `low`, `medium`, `high`, `xhigh` |
| `permissions`       | `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions` | Not applicable                   |
| `approvalReviewer`  | Not applicable                                                           | `user` or `auto_review`          |
| `variables`         | Environment map for this adapter                                         | Environment map for this adapter |
| `saveConversations` | Default `true`                                                           | Default `true`                   |

Without `model`, the installed CLI chooses its default. Actual model availability and supported reasoning levels depend on that CLI and your account. `agentVersions` exposes the pinned CLI versions used by generated images; rebuild old images when those pins change.

Noninteractive defaults avoid blocking on permission prompts and rely on the selected execution boundary. Choose permissions deliberately when using host execution. Interactive attachment uses the native terminal behavior.

The generated container image includes Claude Code, Codex and [Gemini CLI](../../../agents/gemini/). Gemini has a separate configuration and supports fresh sessions without native conversation continuation. Local execution requires you to install and authenticate them. Remote providers can bootstrap a missing selected CLI unless `bootstrap: false` is set. Agent credentials are separate from sandbox-provider credentials.

See [environment](../../../agents/environment/), [conversations](../../../agents/conversations/), or [custom adapters](../../../extend/agents/).

For Gemini settings and fresh-session limits, see [Run Gemini CLI](../../../agents/gemini/).
