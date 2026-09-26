---
title: "CLI agent harnesses"
description: "Claude Code, Codex, Antigravity, Copilot and Kimi harnesses — Outpost"
sidebar:
  order: 2
---

A CLI harness configures a native agent CLI: `claudeHarness()`, `codexHarness()`, `antigravityHarness()`, `copilotHarness()` or `kimiHarness()`. It is independent from the sandbox provider and can be reused across calls. The built-in [`harness()`](../../../agents/harness/) engine runs the model loop in Outpost instead.

```ts
import {
  agent as composeAgent,
  claudeHarness,
  codexHarness,
  agentVersions,
} from "@elie-laloum/outpost";

const reviewer = composeAgent({
  harness: claudeHarness({ permissions: "acceptEdits" }),
  model: { name: "sonnet", reasoning: "high", maxOutputTokens: 32_000 },
});
const implementer = composeAgent({
  harness: codexHarness({ approvalReviewer: "auto_review" }),
  model: { name: "gpt-5.5", reasoning: "high" },
});
console.log(reviewer.name, implementer.name, agentVersions);
```

The model belongs to `agent()`, not to the harness. Pass a name, or an object with `name`, `reasoning` and `maxOutputTokens`:

| Model field       | Claude Code                                         | Codex                                                             | Antigravity, Copilot, Kimi |
| ----------------- | --------------------------------------------------- | ----------------------------------------------------------------- | -------------------------- |
| `name`            | `--model`                                           | `--model`                                                         | `--model`                  |
| `reasoning`       | `--effort`: `low`, `medium`, `high`, `xhigh`, `max` | `model_reasoning_effort`: `low`, `medium`, `high`, `xhigh`, `max` | Rejected                   |
| `maxOutputTokens` | `CLAUDE_CODE_MAX_OUTPUT_TOKENS`                     | Rejected: Codex has no output limit                               | Rejected                   |

`agent()` rejects a reasoning level or output limit that the selected CLI cannot express, such as `none` or `minimal`. It never ignores or converts it. Claude Code lowers `CLAUDE_CODE_MAX_OUTPUT_TOKENS` to the model's own cap; do not also set that variable in `variables`. Kimi with `usage` authentication requires a model on `agent()` and passes it through the environment instead of `--model`; with an account, Kimi model names are its configuration aliases, such as `kimi-code/<id>`.

| Harness setting     | Claude Code                                                              | Codex                       | Antigravity                 | Copilot                   | Kimi                           |
| ------------------- | ------------------------------------------------------------------------ | --------------------------- | --------------------------- | ------------------------- | ------------------------------ |
| `authentication`    | `account` (file or token) or `usage`                                     | `account` (file) or `usage` | `account` (file) or `usage` | `account` (file or token) | `account` (profile) or `usage` |
| `permissions`       | `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions` | Not applicable              | Not applicable              | Not applicable            | Not applicable                 |
| `approvalReviewer`  | Not applicable                                                           | `user` or `auto_review`     | Not applicable              | Not applicable            | Not applicable                 |
| `mode`              | Not applicable                                                           | Not applicable              | `accept-edits` or `plan`    | Not applicable            | Not applicable                 |
| `variables`         | Environment map for this adapter                                         | Environment map             | Environment map             | Environment map           | Environment map                |
| `saveConversations` | Default `true`                                                           | Default `true`              | Not applicable              | Not applicable            | Not applicable                 |

Each harness accepts only the [authentication forms](../../../manual/authentication/) its CLI supports; `agent()` rejects the others and lists the accepted forms. Without `authentication`, Outpost prepares nothing and the CLI uses whatever its environment already provides.

Without `model`, the installed CLI chooses its default. Actual model availability and the reasoning levels a given model accepts depend on that CLI and your account. `agentVersions` exposes the pinned CLI versions used by generated images and remote bootstrap (Claude Code, Codex, Copilot and Kimi); rebuild old images when those pins change. Antigravity has no pin: generated images and remote bootstrap install the current `agy` release with its official install script, so a rebuild can pick up a newer version.

Noninteractive defaults avoid blocking on permission prompts and rely on the selected execution boundary: Antigravity passes `--dangerously-skip-permissions` unless `mode` is set, and Copilot passes `--allow-all --no-ask-user`, which allows every tool, path and URL inside the chosen sandbox. Choose permissions deliberately when using host execution. Interactive attachment uses the native terminal behavior; Kimi accepts no initial prompt in an interactive session.

Claude Code and Codex capture, resume and fork native conversations. Antigravity, Copilot and Kimi run fresh sessions only: `resume()`, `fork()` and explicit continuations fail, structured responses require `repairs: 0`, and any conversation identifier they report is informational. Copilot counts premium requests rather than tokens, and Kimi reports no token usage, so their usage stays `0`. Kimi receives the prompt as a command argument, which is subject to the operating system's argument-size limit. Outpost disables CLI auto-update through default adapter variables (`AGY_CLI_DISABLE_AUTO_UPDATE`, `COPILOT_AUTO_UPDATE`, `KIMI_CODE_NO_AUTO_UPDATE`); your `variables` can override them.

The generated container image includes Claude Code, Codex, Copilot CLI, Kimi Code and the Antigravity CLI (`agy`, installed in `/usr/local/bin`). Local execution requires you to install and sign in to the CLIs; for `agy`, follow the [official installation guide](https://antigravity.google/docs/cli/install/). Remote providers can bootstrap a missing CLI unless `bootstrap: false` is set: Claude Code, Codex, Copilot and Kimi from their pinned npm packages into `~/.outpost-tools`, and `agy` with its official install script into `~/.local/bin`. Agent credentials are separate from sandbox-provider credentials.

See [environment](../../../agents/environment/), [conversations](../../../agents/conversations/), or [custom adapters](../../../extend/agents/). To connect each CLI, see [Claude Code](../../../agents/connect-claude/), [Codex](../../../agents/connect-codex/), [Antigravity](../../../agents/connect-antigravity/), [Copilot](../../../agents/connect-copilot/) and [Kimi](../../../agents/connect-kimi/).
