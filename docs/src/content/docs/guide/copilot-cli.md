---
title: "GitHub Copilot CLI"
description: "Run the copilot CLI on your Copilot plan, with a stored login or a fine-grained GitHub token."
---

## Install

Generated [agent images](../agent-images/) install the `copilot` CLI (`@github/copilot`) at the version pinned in [`agentVersions.copilot`](../../reference/agentversions/). To generate a Copilot project that reads a token from `.env`:

```sh
npx outpost init --yes --agent copilot --authentication account-token --image outpost:dev
```

Your GitHub account needs Copilot access; see [GitHub’s CLI quickstart](https://docs.github.com/en/copilot/get-started/cli-quickstart).

## Account access

Copilot always runs on your Copilot plan. Pass a fine-grained GitHub token with the **Copilot Requests** permission:

```ts
import { createAgent, createCopilotHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createCopilotHarness({
    authentication: { account: { variable: "COPILOT_GITHUB_TOKEN" } },
    variables: { COPILOT_GITHUB_TOKEN: process.env.COPILOT_GITHUB_TOKEN ?? "" },
  }),
});
```

To reuse a host login instead, run `copilot login` and set `authentication: "account"`. Outpost reads the token of the last logged-in user from `~/.copilot/config.json` (or `$COPILOT_HOME/config.json`) and passes it to the sandbox as `COPILOT_GITHUB_TOKEN`.

:::caution
Copilot stores its login in the system keychain by default, which Outpost never reads. If `config.json` holds no token, use the token form above.
:::

Other credential forms and where credentials go: [Authentication](../authentication/).

## API access

Copilot has no API-key mode: `authentication: "usage"` is rejected when the agent is composed. Requests count against your Copilot plan.

## What it supports

<!-- features -->

- [Conversations](../conversations/): Captured as a session bundle, then resumed warm or cold with `--resume`.
  - `conversations`
  - `createCopilotConversations()`
- [Typed responses](../typed-responses/): An invalid answer is repaired by resuming the same conversation.
  - `response`
- [Steering](../steering/): Outpost stops the process and resumes the session with your text.
  - `resumed`
- [MCP servers](../mcp-servers/): Passed on each run with `--additional-mcp-config`.
  - `mcpServers`
- [Usage reporting](../budgets/): Token counts read after the run from `session-state/<id>/events.jsonl`.
  - `usage.complete`
- [Quota pauses](../quota-pauses/): Copilot rate-limit and credit messages fail with code `quota`.
  - `onQuota`

`conversations` accepts a `"copilot"` store, such as `createTransportConversations(createCopilotConversations(), …)`. [Choose an agent](../choose-an-agent/) compares these capabilities across agents.

## Limits

- **No automated fork**: Forking a Copilot conversation is rejected; resume it instead.
- **Model settings**: `model` accepts a name only. `reasoning` and `maxOutputTokens` are rejected.
- **Classic tokens**: `ghp_` personal access tokens are rejected.
- **Incomplete usage**: A missing or unreadable session file sets `usage.complete` to `false`, with a warning.
- **Late counts**: Token totals can arrive after the model has spent them. Pair a [budget](../budgets/) with a timeout.
- **Premium requests**: Copilot bills premium requests; `usage` reports tokens, not premium requests.
- **MCP options**: `startupTimeoutMs` and `oauth` are rejected; authenticate HTTP servers with `bearerTokenVariable`.

API: [createCopilotHarness](../../reference/createcopilotharness/) · [CopilotSettings](../../reference/copilotsettings/) · [createCopilotConversations](../../reference/createcopilotconversations/).
