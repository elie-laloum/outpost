---
title: "MCP servers"
description: "Give any agent the tools of Model Context Protocol servers, declared once and passed secrets by name only."
---

## Declare servers

`mcpServers` maps a server name to a stdio command or a Streamable HTTP endpoint. Every CLI preset and `createHarness()` accept the same declaration.

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

A server has either `command` (stdio) or `url` (HTTP). Names use 1 to 32 letters, digits, `_` or `-`.

| Field                  | Server | Holds                                                                     |
| ---------------------- | ------ | ------------------------------------------------------------------------- |
| `command`, `arguments` | stdio  | The executable and its arguments, started in the sandbox.                 |
| `environment`          | stdio  | Non-secret environment values.                                            |
| `variables`            | stdio  | Names of secret variables forwarded to the server.                        |
| `url`                  | HTTP   | An absolute `http` or `https` endpoint, without credentials.              |
| `headers`              | HTTP   | Non-secret headers sent with every request.                               |
| `bearerTokenVariable`  | HTTP   | Name of the variable sent as `Authorization: Bearer`.                     |
| `oauth`                | HTTP   | A CLI login or client credentials: see [MCP server login](../mcp-oauth/). |
| `tools`                | Both   | `include` and `exclude` lists of exact MCP tool names.                    |
| `startupTimeoutMs`     | Both   | How long the server may take to start.                                    |

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

`tools.include` keeps only the listed tools; `tools.exclude` removes tools afterwards. `startupTimeoutMs` bounds server start-up.

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

| Harness          | `include`       | `exclude`                            | `startupTimeoutMs`                   |
| ---------------- | --------------- | ------------------------------------ | ------------------------------------ |
| Built-in harness | Yes             | Yes                                  | Yes, 60 s by default                 |
| Claude Code      | Refused         | `--disallowedTools`                  | `MCP_TIMEOUT`, one value for the run |
| Codex            | `enabled_tools` | `disabled_tools`                     | `startup_timeout_ms`                 |
| Copilot CLI      | `tools`         | `--deny-tool`: listed, calls refused | Refused                              |
| Kimi Code        | `enabledTools`  | `disabledTools`                      | `startupTimeoutMs`                   |
| Antigravity      | Refused         | `disabledTools`                      | Refused                              |

With Claude Code, every server that sets `startupTimeoutMs` must use the same value, and you cannot also set `MCP_TIMEOUT` in the harness `variables`.

## Use them in the built-in harness

Pass the same servers to `createHarness({ mcpServers })`. Each turn starts them inside the borrowed sandbox and stops them when the turn ends.

```ts
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  createOpenAIModelProvider,
  defineHarnessPermissions,
} from "@elie-laloum/outpost";

const reviewer = createAgent({
  model: process.env.MODEL_NAME ?? "",
  harness: createHarness({
    modelProvider: createOpenAIModelProvider({
      baseUrl: "https://api.openai.com/v1",
      api: "responses",
      apiKey: process.env.OPENAI_API_KEY ?? "",
    }),
    tools: [createHarnessFileTools()],
    mcpServers: {
      linear: {
        command: "npx",
        arguments: ["-y", "linear-mcp"],
        variables: ["LINEAR_API_KEY"],
      },
    },
    permissions: defineHarnessPermissions({
      rules: [{ effect: "deny", tools: ["mcp__linear__delete_*"] }],
    }),
  }),
});
```

<!-- features -->

- `mcp__<server>__<tool>`: The name the model sees and [permission rules](../harness-permissions/) match. Characters other than letters, digits, `_` and `-` become `_`; long names end with a hash.
- **Inside the sandbox**: Stdio servers and the HTTP bridge run there, so tokens stay in the sandbox and [network rules](../network-restrictions/) apply.
- **Results**: Text, structured content and resource text reach the model. Images and audio become a marker; server errors become tool errors.

The harness has no `variables` of its own: declare secrets on the sandbox provider or in `.outpost/.env`. A [subagent](../subagents/) starts the servers of its own harness.

:::note
The sandbox needs `node` and must accept live input (`liveInput`). Every built-in sandbox provider does.
:::

## Read resources and prompts

In the built-in harness, servers that announce resources or prompts add read-only tools. Each takes a `server` name.

| Tool                 | Does                                    |
| -------------------- | --------------------------------------- |
| `mcp_list_resources` | Lists resources and resource templates. |
| `mcp_read_resource`  | Reads a resource by URI.                |
| `mcp_list_prompts`   | Lists prompts.                          |
| `mcp_get_prompt`     | Renders a prompt with its arguments.    |

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
