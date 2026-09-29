---
title: "Authentication"
description: "Run each CLI agent on your subscription login or on an API key, and know which credential reaches the sandbox."
---

## Account or API key

Each CLI harness takes an `authentication` mode. Outpost never picks one for you.

|                | `"account"`                                        | `"usage"`                                    |
| -------------- | -------------------------------------------------- | -------------------------------------------- |
| Uses           | Your CLI login or a subscription token             | An API key                                   |
| Billing        | Your ChatGPT, Claude, Copilot, Google or Kimi plan | Per token, on the vendor’s API account       |
| On the host    | The CLI’s login file, such as `~/.codex/auth.json` | A variable you declare                       |
| In the sandbox | A copy of the login in the sandbox’s private home  | The key, in the CLI’s standard variable      |
| Suited to      | Your own runs, within your plan’s terms            | CI, services and automation shared by a team |

```ts
import {
  createAgent,
  createClaudeHarness,
  createCodexHarness,
} from "@elie-laloum/outpost";

// Your ChatGPT plan, from ~/.codex/auth.json
export const planCoder = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});

// API billing, from a variable you pass to the harness
export const apiCoder = createAgent({
  harness: createClaudeHarness({
    authentication: "usage",
    variables: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "" },
  }),
});
```

Without `authentication`, Outpost prepares nothing: the CLI uses whatever access the sandbox already has. Where declared variables come from: [Environment variables](../environment-variables/).

## Pick a form for your agent

The short forms read the default location. The object forms point elsewhere: `file` to another login file, `variable` to a variable of another name, `key` to a value your code already holds.

| Agent                          | `"account"` reads                                   | `{ account: { file } }` | `{ account: { key \| variable } }` | `"usage"` sets      |
| ------------------------------ | --------------------------------------------------- | ----------------------- | ---------------------------------- | ------------------- |
| [Claude Code](../claude-code/) | `~/.claude/.credentials.json`                       | A file                  | `CLAUDE_CODE_OAUTH_TOKEN`          | `ANTHROPIC_API_KEY` |
| [Codex](../codex/)             | `~/.codex/auth.json`                                | A file                  | No                                 | `OPENAI_API_KEY`    |
| [Copilot CLI](../copilot-cli/) | `~/.copilot/config.json`                            | A file                  | `COPILOT_GITHUB_TOKEN`             | No                  |
| [Kimi Code](../kimi-code/)     | `~/.kimi-code/`                                     | A profile directory     | No                                 | `KIMI_API_KEY`      |
| [Antigravity](../antigravity/) | `~/.gemini/antigravity-cli/antigravity-oauth-token` | A file                  | No                                 | `GEMINI_API_KEY`    |

Every agent with `"usage"` also accepts `{ usage: { key | variable } }`. On the host, `CLAUDE_CONFIG_DIR`, `CODEX_HOME`, `COPILOT_HOME` and `KIMI_CODE_HOME` move the default file. Each agent page gives its login command.

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

export const teamCoder = createAgent({
  harness: createCodexHarness({
    // Sent to Codex as OPENAI_API_KEY
    authentication: { usage: { variable: "TEAM_OPENAI_KEY" } },
    variables: { TEAM_OPENAI_KEY: process.env.TEAM_OPENAI_KEY ?? "" },
  }),
});
```

## What reaches the sandbox

Outpost reads only the file you select, never a system keychain. What it does next depends on where the agent runs.

|                      | Isolated sandbox                                                                           | [Host execution](../host-process/)       |
| -------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------- |
| Login file           | Copied into a private home, discarded with the sandbox; Copilot’s token goes in a variable | Not read: the CLI uses your host session |
| Credential variables | Passed to the agent’s commands                                                             | Passed to the agent’s commands           |
| Login commands       | Run in the sandbox, such as `codex login --with-api-key`                                   | Not run                                  |

:::caution
A CLI that refreshes its token inside the sandbox can invalidate the host login it was copied from. For unattended runs, sign in to a dedicated profile and select it with `{ account: { file } }`.
:::

## Keep credentials apart

Three kinds of credentials serve three different clients. A Vercel or S3 key never authenticates the agent.

<!-- features -->

- [Sandbox provider](../cloud-sandboxes/): Allocation credentials stay with the provider client on the host.
- [Agent](../choose-an-agent/): `authentication` and the harness `variables` sign the CLI in.
- [Storage](../object-storage/): Bucket keys stay with the transport client on the host.

## Limits

- Claude rejects conflicting variables: account forms fail when `ANTHROPIC_API_KEY` is declared, `usage` forms when `CLAUDE_CODE_OAUTH_TOKEN` is.
- Kimi account forms reject `KIMI_CODE_OAUTH_HOST`, `KIMI_OAUTH_HOST` or `KIMI_CODE_BASE_URL` values that contradict the selected region. Kimi `usage` needs a model name on `createAgent()`.
- Copilot has no `usage` mode and rejects classic `ghp_` tokens. A login kept in the system keychain is unreadable: pass the token with `{ account: { variable } }`.
- Codex with a custom `modelProvider` accepts only `usage` forms.
- A login file must be a regular file of at most 1 MiB, not a symbolic link.
- An unsupported form fails when you call `createAgent()`. A missing file or variable fails at dispatch with the `configuration` code and names the login command.

API: [AgentAuthentication](../../reference/agentauthentication/) · [AccountCredential](../../reference/accountcredential/) · [UsageCredential](../../reference/usagecredential/).
