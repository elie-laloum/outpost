---
title: "Connect your Claude Code account"
description: "Connect your Claude Code account — Outpost"
sidebar:
  order: 5
---

Outpost runs the native Claude Code CLI and does not create a separate account. Install the CLI on the host for account setup; generated images include it.

## Local login

Run `claude` and follow the login flow; `/login` changes accounts. With `localSandboxProvider()`, host credentials are available. Containers do not inherit the host keychain. See [Claude authentication](https://code.claude.com/docs/en/authentication).

## Subscription token for sandboxes

Run `claude setup-token` on your computer and complete browser authorization. Store its output as `CLAUDE_CODE_OAUTH_TOKEN` in your secret manager or parent process. Declare in `.outpost/.env`:

```dotenv
CLAUDE_CODE_OAUTH_TOKEN=
```

The empty declaration imports the process variable. This native flow requires an eligible subscription; consult the [CLI reference](https://code.claude.com/docs/en/cli-reference). Never put the token in a Dockerfile, prompt, command argument or committed script.

## API-key alternative

Declare `ANTHROPIC_API_KEY=` instead and supply that variable. Choose one method: leaving an API key set can select API billing instead of subscription access. Remove unused declarations and variables when switching.

## Check and run

```ts
import {
  agent as composeAgent,
  createSandbox,
  claudeHarness,
} from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: composeAgent({ harness: claudeHarness({}) }),
});
const check = await sandbox.command({
  executable: "sh",
  arguments: [
    "-c",
    'test -n "$CLAUDE_CODE_OAUTH_TOKEN" || test -n "$ANTHROPIC_API_KEY"',
  ],
});
if (check.status !== 0)
  throw new Error("Declare a Claude credential in .outpost/.env");
const result = await sandbox.dispatch({
  brief: { text: "Summarize the repository without changing files." },
  deadlineMs: 120_000,
});
console.log(result.text);
```

The first check verifies presence only. The dispatch makes a real model request, subject to usage limits or billing, and exposes a rejected credential as a CLI error.

## Keep the home coherent

The default home is entirely ephemeral: `~/.claude.json` and `~/.claude/` share its lifetime. Prefer the token route to mounting only a persistent `~/.claude` inside an otherwise empty home, which separates settings from backups and sessions.

[Conversation capture](../../../agents/conversations/) preserves transcripts, not the complete home or login. Vercel/Daytona credentials allocate a sandbox but do not authenticate Claude.

## Troubleshooting

If the host works but the sandbox fails, check `.outpost/.env`, provider/adapter overrides, connectivity and expired credentials. Do not print secrets to debug. Recreate sandboxes after changing authentication. Continue with [environment precedence](../../../agents/environment/) or [cookbooks](../../../cookbook/).
