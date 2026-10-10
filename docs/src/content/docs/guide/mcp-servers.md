---
title: "Connect MCP servers"
description: "Give an agent MCP tools, resources and prompts with explicitly declared credentials."
---

Start with a working [CLI agent](../choose-an-agent/) or [built-in harness](../harness/). The sandbox must be able to start or reach the declared server. Keep server tokens in explicitly selected environment variables.

## Declare servers

Declare MCP servers in `mcpServers`, using a name for each server. A server can start from a command or expose a Streamable HTTP endpoint. CLI harnesses and the built-in harness accept the same declaration.

```ts
import type { McpServers } from "@elie-laloum/outpost";

const mcpServers: McpServers = {
  linear: {
    command: "npx",
    arguments: ["-y", "linear-mcp"],
    variables: ["LINEAR_API_KEY"],
  },
  docs: {
    url: "https://mcp.example.com/mcp",
    bearerTokenVariable: "DOCS_TOKEN",
  },
};
```

API reference: [McpStdioServer](../../reference/mcpstdioserver/) and [McpHttpServer](../../reference/mcphttpserver/).

## Pass secrets by name

`command`, `arguments`, `environment`, `url` and `headers` are copied as written and cannot contain `${`. Put secrets in [declared variables](../environment-variables/) and reference them by name.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createClaudeHarness({
    authentication: "account",
    mcpServers: {
      linear: {
        command: "npx",
        arguments: ["-y", "linear-mcp"],
        variables: ["LINEAR_API_KEY"],
      },
    },
    variables: { LINEAR_API_KEY: process.env.LINEAR_API_KEY ?? "" },
  }),
});
```

Declare each name on the harness `variables`, on the sandbox provider or in `.outpost/.env`. A missing value fails before the agent starts with `Missing LINEAR_API_KEY`. Outpost writes only the name or a `${NAME}` reference; the CLI reads the value from its environment.

## Where each CLI receives them

Outpost translates the declaration into each CLI’s own configuration. Declared servers add to those the CLI already knows, and tool approval follows the CLI’s permission settings.

| Harness     | Servers go to                                        | Secrets are written as                                    |
| ----------- | ---------------------------------------------------- | --------------------------------------------------------- |
| Claude Code | `--mcp-config` on each run                           | `${NAME}` in `env` and headers                            |
| Codex       | `-c mcp_servers.<name>.…` on each run                | `env_vars` and `bearer_token_env_var` names               |
| Copilot CLI | `--additional-mcp-config` on each run                | `${NAME}` in `env` and headers                            |
| Kimi Code   | `~/.kimi-code/mcp.json` in the agent home            | Inherited environment (stdio), `bearerTokenEnvVar` (HTTP) |
| Antigravity | `~/.gemini/config/mcp_config.json` in the agent home | `${NAME}` in `env` and headers                            |

Kimi Code and Antigravity have no per-run option. Outpost merges the declared entries into their file once per sandbox and keeps the other entries.

## Filter tools and set startup timeouts

This example removes the deletion tool from the tools offered to the model and gives the server two minutes to start.

```ts
import type { McpServers } from "@elie-laloum/outpost";

const mcpServers: McpServers = {
  linear: {
    command: "npx",
    arguments: ["-y", "linear-mcp"],
    tools: { exclude: ["delete_issue"] },
    startupTimeoutMs: 120_000,
  },
};
```

An option a harness cannot apply fails when the agent is composed.

API reference: [McpToolFilter](../../reference/mcptoolfilter/).

With Claude Code, every server that sets `startupTimeoutMs` must use the same value, and you cannot also set `MCP_TIMEOUT` in the harness `variables`.

## Use them in the built-in harness

Pass the same servers to `createHarness({ mcpServers })`. Each turn starts them inside the borrowed sandbox and stops them when the turn ends.

<!-- tabs -->

```ts title="mcp-model.ts"
import { createOpenAIModelProvider } from "@elie-laloum/outpost";

export const modelProvider = createOpenAIModelProvider({
  baseUrl: "https://api.openai.com/v1",
  api: "responses",
  apiKey: process.env.OPENAI_API_KEY ?? "",
});
```

```ts title="linear-access.ts"
import { defineHarnessPermissions } from "@elie-laloum/outpost";

export const mcpServers = {
  linear: {
    command: "npx",
    arguments: ["-y", "linear-mcp"],
    variables: ["LINEAR_API_KEY"],
  },
};
export const permissions = defineHarnessPermissions({
  rules: [{ effect: "deny", tools: ["mcp__linear__delete_*"] }],
});
```

```ts title="mcp-reviewer.ts"
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
} from "@elie-laloum/outpost";
import { modelProvider } from "./mcp-model.ts";
import { mcpServers, permissions } from "./linear-access.ts";

export const reviewer = createAgent({
  model: process.env.MODEL_NAME ?? "",
  harness: createHarness({
    modelProvider,
    tools: [createHarnessFileTools()],
    mcpServers,
    permissions,
  }),
});
```

API reference: [HarnessMcpContext](../../reference/harnessmcpcontext/) and [HarnessPermissionRule](../../reference/harnesspermissionrule/).

The harness has no `variables` of its own: declare secrets on the sandbox provider or in `.outpost/.env`. A [subagent](../subagents/) starts the servers of its own harness.

:::note
The sandbox needs `node` and must accept live input (`liveInput`). Every built-in sandbox provider does.
:::

## Read resources and prompts

In the built-in harness, servers that announce resources or prompts add read-only tools. Each takes a `server` name.

API reference: [createHarness](../../reference/createharness/) and [HarnessMcpContext](../../reference/harnessmcpcontext/).

`defineMcpPrompt()` puts a server prompt into the harness instructions. It is rendered at the start of each turn.

```ts
import { defineMcpPrompt } from "@elie-laloum/outpost";

const review = defineMcpPrompt({
  server: "docs",
  name: "review",
  arguments: { language: "typescript" },
});
// createHarness({ modelProvider, mcpServers, instructions: [review] })
```

## Limits

- With [`createLocalSandboxProvider()`](../host-process/), Kimi Code and Antigravity entries are merged into your own home and stay after the run.
- A config file Outpost cannot read as JSON fails the run instead of being replaced.
- In the built-in harness, a server that exits or does not initialize within its startup timeout fails the turn, as does an `include` name the server does not offer.
- On Vercel and Daytona, each MCP message passes through a file in the sandbox, which adds latency per request.

API: [McpServers](../../reference/mcpservers/) · [McpStdioServer](../../reference/mcpstdioserver/) · [McpHttpServer](../../reference/mcphttpserver/) · [McpToolFilter](../../reference/mcptoolfilter/) · [defineMcpPrompt](../../reference/definemcpprompt/) · [HarnessOptions](../../reference/customharnessoptions/).
