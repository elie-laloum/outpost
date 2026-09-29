---
title: "Kimi Code"
description: "Connect Kimi Code to an Outpost sandbox."
---

Use `kimiHarness()` with any supported [execution backend](../execution-backends/). Install the CLI in your image or allow bootstrap on remote providers.

## Account access

Sign in with `kimi login --region global` for a `kimi.ai` account, or `kimi login --region mainland-cn` for a `kimi.com` account. Outpost defaults to `global`; set `region: "mainland-cn"` explicitly for a Chinese account:

```ts
import { agent, kimiHarness } from "@elie-laloum/outpost";

const coder = agent({
  harness: kimiHarness({ authentication: "account" }),
});
```

Outpost reads the region's OAuth file and `device_id` under `~/.kimi-code` (or `KIMI_CODE_HOME`), installs them in the private sandbox home, and runs `kimi login --region global` to provision the international service. It does not copy the rest of your configuration or credentials. The international file is `credentials/kimi-code-env-0e4f99c69cc27850.json`; mainland China uses `credentials/kimi-code.json`. These names follow the pinned CLI's regional credential slots.

For a dedicated profile, use `authentication: { account: { file: "/path/to/profile" } }` and the matching `region`. The path is the directory containing `credentials/` and `device_id`. Omitting `region` selects `global`, just like `region: "global"`. Set `region: "mainland-cn"` to use the Chinese credential file and service. Declared OAuth/API endpoint variables must agree with the selected region, including the default. The local provider forwards the region variables but does not copy files or run login commands.

See [Kimi's login command](https://www.kimi.com/code/docs/en/kimi-code-cli/reference/kimi-command.html) and [OAuth environment variables](https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/env-vars.html).

## API access

Supply `KIMI_API_KEY` explicitly. API usage follows the provider’s API billing.

```ts
import { agent, kimiHarness } from "@elie-laloum/outpost";

const coder = agent({
  harness: kimiHarness({
    authentication: "usage",
    variables: { KIMI_API_KEY: process.env.KIMI_API_KEY ?? "" },
  }),
  model: process.env.KIMI_MODEL ?? "",
});
```

## Behavior

API authentication requires an explicit model on `agent()`. The `region` option is reserved for account authentication; configure API endpoints through the CLI model variables when needed. Set `KIMI_MODEL` in your application environment for the snippet above; this is an example variable, not an Outpost setting. Account authentication can use the CLI’s default model.

Native capture, warm and cold resume, fork and automatic response repairs are supported for Kimi Code 2.1.1. Outpost resumes with `--session` and forks with `kimi fork <id> --yes` before continuing the new ID. The parent remains independent. Capture preserves session metadata and agent files, including native history and plans. `conversations` stores captured sessions in a `"kimi"` [conversation store](../chat-history/#storage), such as `transportConversations("kimi", …)`. See [chat history](../chat-history/) and [Kimi’s session documentation](https://www.kimi.com/code/docs/en/kimi-code-cli/guides/sessions.html).

## Token accounting

The pinned `@moonshot-ai/kimi-code` 2.1.1 CLI omits usage from `stream-json`. After the command exits, Outpost uses its session ID to read `usage.record` entries under `KIMI_CODE_HOME/sessions/<workspace>/<id>/agents/*/wire.jsonl` (default home: `~/.kimi-code`), inside the sandbox. Main-agent and sub-agent records are added once; context-size and step summaries are not added again.

`inputOther` maps to `usage.input`, `output` to `usage.output`, `inputCacheRead` to `usage.cached`, and `inputCacheCreation` to `usage.cacheCreated`. Input excludes cache reads and writes. Only reported usage is available; an upstream zero cannot establish that an unreported model call was free.

A missing session ID, absent or malformed records, interrupted execution or exceeded reader limits produces `usage.complete === false`; measured counters are retained as a lower bound. Collection warns at startup because it happens after execution. Combine `budget.attempts` with a task timeout or dispatch deadline; see [Usage budgets](../token-budgets/).

`mcpServers` merges [MCP servers](../mcp-servers/) into `~/.kimi-code/mcp.json` in the agent home, which is your own home with the local provider.

API: [kimiHarness](../../reference/kimiharness/).
