---
title: "Kimi Code"
description: "Run Moonshot’s Kimi Code CLI in a sandbox, signed in with your Kimi account or an API key."
---

## Install

<!-- features -->

- [Agent images](../agent-images/): Generated images already include `kimi`.
- [Cloud sandboxes](../cloud-sandboxes/): Outpost installs `@moonshot-ai/kimi-code` with npm when `kimi` is missing.
- [Host execution](../host-process/): Install it yourself with `npm install -g @moonshot-ai/kimi-code`.

Images and cloud installs use the version in [`agentVersions.kimi`](../../reference/agentversions/). Outpost turns off the CLI’s auto-update. `outpost init --agent kimi` generates a Kimi project ([CLI commands](../cli/)).

## Account access

Sign in on the host with `kimi login --region global` (`mainland-cn` for a kimi.com account), then select `account`. The run uses your Kimi Code plan.

```ts
import { createAgent, createKimiHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createKimiHarness({ authentication: "account" }),
});
```

In a container or cloud sandbox, Outpost copies the region’s credential file and `device_id` from `~/.kimi-code` (or `$KIMI_CODE_HOME`) into the sandbox’s private home, then runs `kimi login --region <region>` there. Nothing else from your Kimi home is copied. On the [host](../host-process/), the CLI uses your own `~/.kimi-code` as is.

A `model` on `createAgent()` becomes `--model`; without one, the CLI picks its default.

### Choose the region

`region` selects the account service. It defaults to `"global"`.

| `region`             | Account  | Credential file                                   | Endpoints                       |
| -------------------- | -------- | ------------------------------------------------- | ------------------------------- |
| `"global"` (default) | kimi.ai  | `credentials/kimi-code-env-0e4f99c69cc27850.json` | `auth.kimi.ai`, `api.kimi.ai`   |
| `"mainland-cn"`      | kimi.com | `credentials/kimi-code.json`                      | `auth.kimi.com`, `api.kimi.com` |

Outpost sets `KIMI_CODE_OAUTH_HOST` and `KIMI_CODE_BASE_URL` to the region’s endpoints. See Kimi’s [login command](https://www.kimi.com/code/docs/en/kimi-code-cli/reference/kimi-command.html).

### Use a dedicated profile

`{ account: { file } }` points to a profile directory that holds `credentials/` and `device_id`. Set the `region` of the account signed in there.

```ts
import { createAgent, createKimiHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createKimiHarness({
    authentication: { account: { file: "/srv/outpost/kimi-profile" } },
    region: "mainland-cn",
  }),
});
```

## API access

Pass `KIMI_API_KEY` and a model: without a model, composition fails. API calls use Kimi’s API billing, not your plan.

```ts
import { createAgent, createKimiHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createKimiHarness({
    authentication: "usage",
    variables: { KIMI_API_KEY: process.env.KIMI_API_KEY ?? "" },
  }),
  model: process.env.KIMI_MODEL ?? "",
});
```

Outpost passes the key and model to the CLI as `KIMI_MODEL_API_KEY` and `KIMI_MODEL_NAME`. For another endpoint, add `KIMI_MODEL_BASE_URL` to `variables` ([Kimi variables](https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/env-vars.html)). Other key forms: [Authentication](../authentication/).

## What it supports

[Choose an agent](../choose-an-agent/) compares agents.

<!-- features -->

- [Conversations](../conversations/): Capture, cold and warm resume, and fork with `kimi fork`. The parent session stays unchanged.
  - `createKimiConversations()`
- [Typed responses](../typed-responses/): An invalid answer is repaired by resuming the session.
  - `repairs`
- [Steering](../steering/): Outpost stops the CLI once its session is known, then resumes it with your text.
  - `resumed`
- [MCP servers](../mcp-servers/): Merged into `~/.kimi-code/mcp.json` in the agent home. `oauth: "login"` servers reuse your host login.
  - `mcpServers`
- [Quota pauses](../quota-pauses/): Quota and balance errors stop the turn with code `quota`.
  - `onQuota`
- [Budgets](../budgets/): Token usage is read from the session after the CLI exits.
  - `result.usage`

### Token usage

After the CLI exits, Outpost reads the session’s `usage.record` entries in the sandbox, for the main agent and its subagents. A resumed session counts only the new turn.

| Kimi field           | Outpost field        |
| -------------------- | -------------------- |
| `inputOther`         | `usage.input`        |
| `output`             | `usage.output`       |
| `inputCacheRead`     | `usage.cached`       |
| `inputCacheCreation` | `usage.cacheCreated` |

`usage.complete` is `false` after an interruption, without a session ID, with missing, malformed or oversized records, and on a fork’s first turn. Counters are then a lower bound: bound the run with `budget.attempts` and a timeout ([Budgets](../budgets/)).

## Limits

- **Model settings**: `reasoning` and `maxOutputTokens` are refused when the agent is composed. Only the model name applies.
- **Region**: `region` applies to account access only; combined with `usage` authentication it is refused.
- **Endpoint variables**: With account access, a declared `KIMI_CODE_OAUTH_HOST`, `KIMI_OAUTH_HOST` or `KIMI_CODE_BASE_URL` that does not match the region fails, including with the default region.
- **Account forms**: `{ account: { key } }` and `{ account: { variable } }` are not supported.
- **Late counters**: A token budget sees a turn’s usage only after the CLI exits.

API: [createKimiHarness](../../reference/createkimiharness/) · [KimiSettings](../../reference/kimisettings/) · [createKimiConversations](../../reference/createkimiconversations/) · [agentVersions](../../reference/agentversions/).
