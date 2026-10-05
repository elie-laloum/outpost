---
title: "Configure Antigravity"
description: "Run Google’s agy CLI and understand its conversation limits."
---

## Install

Use the [agent image](../agent-images/) to make `agy` available in a local container. In a [cloud sandbox](../cloud-sandboxes/), Outpost installs it when it is missing, unless you set `bootstrap: false`.

<!-- features -->

- **Pinned version**: `agentVersions.antigravity`, downloaded from Google’s versioned archives.
- **SHA-512 check**: Each archive is verified before extraction; a mismatch aborts the installation.
- **No auto-update**: Images, runs and `doctor` set `AGY_CLI_DISABLE_AUTO_UPDATE=true`.

The installer supports Linux amd64 and arm64 (glibc and musl) and macOS Intel and Apple Silicon. Other platforms fail.

Check the installed version against the pinned one:

```sh
npx outpost doctor --agent antigravity --image outpost:dev
npx outpost doctor --agent antigravity --sandbox-provider local
```

`doctor` warns when the versions differ. It does not verify the binary’s checksum or test sign-in.

## Sign in with your account

Run `agy` on the host and sign in with your Google account.

```ts
import { createAgent, createAntigravityHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createAntigravityHarness({ authentication: "account" }),
});
```

Outpost copies `~/.gemini/antigravity-cli/antigravity-oauth-token` into the sandbox’s private home. For a token stored elsewhere, pass `{ account: { file: "/path/to/token" } }`. See [Authentication](../authentication/).

## Use an API key

Declare `GEMINI_API_KEY`. Gemini API usage is billed separately from Google AI plans.

```ts
import { createAgent, createAntigravityHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createAntigravityHarness({
    authentication: "usage",
    variables: { GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "" },
  }),
});
```

Outpost also writes `~/.gemini/antigravity-cli/settings.json` in the sandbox home to select the Gemini provider. `{ usage: { variable: "NAME" } }` reads the key from another declared variable.

## Available features

<!-- features -->

- [Conversations](../conversations/): Resume in the same [sandbox session](../sandbox-sessions/) with `sandbox.resume(id, options)` or a warm result’s `resume()`.
- [Response repairs](../typed-responses/): An invalid typed answer is repaired in that same conversation.
- [Steering](../steering/): Delivered as `resumed`: Outpost stops `agy`, then resumes the conversation with your text.
- [MCP servers](../mcp-servers/): Merged into `~/.gemini/config/mcp_config.json` in the agent home.
- **Usage**: Input, cached and output tokens per turn; thinking tokens count as output.
- **Model and mode**: The agent’s `model` becomes `--model`; `mode` sets `--mode accept-edits` or `plan`.

Without `mode`, headless runs pass `--dangerously-skip-permissions`: the sandbox bounds what the agent can do. Interactive terminals keep the CLI’s approval prompts. [Choose an agent](../choose-an-agent/) compares every agent.

## Limits

- Conversations are not captured: they end with the sandbox. Cold resume and `fork()` are rejected, and `createAntigravityHarness()` refuses a `conversations` store.
- A model with `reasoning` or `maxOutputTokens` is rejected when the agent is composed.
- MCP `tools.include`, `startupTimeoutMs` and `oauth: "login"` are refused.
- Bootstrap reuses an `agy` already on the path without checking its version or checksum.

API: [createAntigravityHarness](../../reference/createantigravityharness/) · [AntigravitySettings](../../reference/antigravitysettings/) · [agentVersions](../../reference/agentversions/).
