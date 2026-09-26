---
title: "Connect your Claude Code account"
description: "Connect your Claude Code account — Outpost"
sidebar:
  order: 5
---

Outpost runs the native Claude Code CLI and does not create a separate account. Select a credential with the `authentication` option of `claudeHarness()`: `account` forms use your Claude subscription, `usage` forms bill an Anthropic API key. Install the CLI on the host for account setup; generated images include it. The [authentication manual](../../../manual/authentication/) gives the complete contract.

## Local login

Run `claude` and follow the login flow; `/login` changes accounts. With `localSandboxProvider()`, Claude uses that host login directly and Outpost writes nothing on the host. See [Claude authentication](https://code.claude.com/docs/en/authentication).

On Linux and Windows, the login is stored in `~/.claude/.credentials.json` (or `$CLAUDE_CONFIG_DIR/.credentials.json`). Select `claudeHarness({ authentication: "account" })` and Outpost installs a private copy in the sandbox home before the first dispatch, keeping only the `claudeAiOauth` subscription entry; other entries such as MCP OAuth tokens stay on the host. `{ account: { file } }` reads the same format from another path.

On macOS, Claude Code keeps its login in the Keychain, which Outpost never reads. Use the subscription token below. Containers never inherit a host keychain.

Claude can rotate its refresh token when the sandbox copy refreshes, which may log out the host. Keep a dedicated login for Outpost where file storage is available: `CLAUDE_CONFIG_DIR=~/.outpost/accounts/claude claude`, then `/login`, and select `{ account: { file: "~/.outpost/accounts/claude/.credentials.json" } }`.

## Subscription token for sandboxes

Run `claude setup-token` on your computer and complete browser authorization. Store its output as `CLAUDE_CODE_OAUTH_TOKEN` in your secret manager or parent process. Declare in `.outpost/.env`:

```dotenv
CLAUDE_CODE_OAUTH_TOKEN=
```

The empty declaration imports the process variable. Select `{ account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } }`, or another variable name that holds the token; Outpost passes its value to Claude as `CLAUDE_CODE_OAUTH_TOKEN`. This native flow requires an eligible subscription; consult the [CLI reference](https://code.claude.com/docs/en/cli-reference). Never put the token in a Dockerfile, prompt, command argument or committed script.

## API-key alternative

Declare `ANTHROPIC_API_KEY=` instead, supply that variable and select `usage`, or `{ usage: { variable: "TEAM_ANTHROPIC_KEY" } }` for another name. Claude Code gives an API key precedence over a subscription, so Outpost rejects the combination: an account form fails while `ANTHROPIC_API_KEY` is declared, and a usage form fails while `CLAUDE_CODE_OAUTH_TOKEN` is declared. Remove unused declarations and variables when switching.

## Check and run

```ts
import { agent, claudeHarness, createSandbox } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: agent({
    harness: claudeHarness({
      authentication: { account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } },
    }),
  }),
});
const result = await sandbox.dispatch({
  brief: { text: "Summarize the repository without changing files." },
  deadlineMs: 120_000,
});
console.log(result.text);
```

Before the CLI starts, Outpost checks the selected credential: an undeclared token fails with `Missing CLAUDE_CODE_OAUTH_TOKEN. Declare the selected credential explicitly.`, and a declared `ANTHROPIC_API_KEY` fails as a conflict. The dispatch then makes a real model request, subject to usage limits or billing, and exposes a rejected credential as a CLI error.

## Keep the home coherent

The default home is entirely ephemeral: `~/.claude.json` and `~/.claude/` share its lifetime. Prefer the built-in `authentication` option to mounting only a persistent `~/.claude` inside an otherwise empty home, which separates settings from backups and sessions.

[Conversation capture](../../../agents/conversations/) preserves transcripts, not the complete home or login. Vercel/Daytona credentials allocate a sandbox but do not authenticate Claude.

## Troubleshooting

If the host works but the sandbox fails, read the error: it names a missing variable, a missing `.credentials.json` path with the login command, a file without `claudeAiOauth`, or conflicting credentials. Then check `.outpost/.env`, provider and harness variables, a Keychain-only login, connectivity and expired credentials. Do not print secrets to debug. Recreate sandboxes after changing authentication. Continue with [environment precedence](../../../agents/environment/) or [cookbooks](../../../cookbook/).
