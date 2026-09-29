---
title: "MCP servers"
description: "Give agents the tools of Model Context Protocol servers."
---

Declare MCP servers once and pass them to any CLI harness or to the built-in model loop. A server is either a command that speaks MCP over stdio or a Streamable HTTP endpoint.

```ts
import type { McpServers } from "@elie-laloum/outpost";

const mcpServers: McpServers = {
  linear: {
    command: "npx",
    arguments: ["-y", "linear-mcp"],
    environment: { LOG_LEVEL: "warn" },
    variables: ["LINEAR_API_KEY"],
  },
  docs: {
    url: "https://mcp.example.com/mcp",
    bearerTokenVariable: "DOCS_TOKEN",
  },
};
```

Server names use letters, digits, `_` and `-`, up to 32 characters. `command`, `arguments`, `environment`, `url` and `headers` are literal, non-secret values: they are copied into command lines or configuration files and cannot contain `${`. Pass secrets by name with `variables` or `bearerTokenVariable`.

## Declare the secrets

Each name in `variables` and `bearerTokenVariable` must be a declared variable: on the harness `variables`, on the sandbox provider, or in `.outpost/.env`. A missing value fails before the agent starts with `Missing NAME`. See [Environment values](../environment-values/).

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
      docs: {
        url: "https://mcp.example.com/mcp",
        bearerTokenVariable: "DOCS_TOKEN",
      },
    },
    variables: {
      LINEAR_API_KEY: process.env.LINEAR_API_KEY ?? "",
      DOCS_TOKEN: process.env.DOCS_TOKEN ?? "",
    },
  }),
});
```

Outpost only writes references such as `${LINEAR_API_KEY}` or the variable name. The CLI resolves them from its own environment, so secret values never appear in arguments or files.

## CLI harnesses

Every CLI preset accepts `mcpServers`. Outpost translates them into the native configuration of that CLI.

| Harness     | Where the servers go                                             |
| ----------- | ---------------------------------------------------------------- |
| Claude Code | `--mcp-config` for each run                                      |
| Codex       | `-c mcp_servers.<name>…` overrides for each run                  |
| Copilot CLI | `--additional-mcp-config` for each run                           |
| Kimi Code   | Merged into `~/.kimi-code/mcp.json` in the agent home            |
| Antigravity | Merged into `~/.gemini/config/mcp_config.json` in the agent home |

Declared servers add to those the CLI already knows. Tool approval follows each CLI’s own permission settings: headless presets that skip permissions also allow MCP tools.

Kimi and Antigravity have no per-run option, so Outpost merges the declared entries into their home file once per sandbox. Other servers and settings in that file are kept; an unreadable file fails instead of being replaced. In a container or cloud sandbox the home is private and disappears with the sandbox. With [`createLocalSandboxProvider()`](../host-process/) it is your own home, and the merged entries stay after the run.

## Built-in model loop

Pass the same servers to `createHarness({ mcpServers })`. Each turn starts the servers inside the borrowed sandbox, lists their tools and stops them when the turn ends.

```ts
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  createOpenAIModelProvider,
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
  }),
});
```

Tools are named `mcp__<server>__<tool>`; characters outside letters, digits, `_` and `-` become `_`, and long names end with a short hash. [Permission rules](../tool-policies/) match these names, for example `tools: ["mcp__linear__*"]`. Tool deadlines send an MCP cancellation. Server errors reach the model as tool errors; text, structured content and resource text are returned, while images and audio are replaced by a marker.

A stdio server runs through a small Node.js launcher in the sandbox. An HTTP server is reached through a bridge that also runs in the sandbox, so the bearer token stays there and [outbound rules](../outbound-rules/) apply to it. The sandbox therefore needs `node`, and its lease must accept live process input, as every built-in provider does. On Vercel and Daytona each message to a stdio server goes through a polled file in the sandbox, which adds about a second per request. A server that exits or does not initialize within 60 seconds fails the turn. Subagents start the servers of their own harness.

For the built-in loop, declare secrets on the sandbox provider or in `.outpost/.env`: a custom harness has no `variables` of its own.

API: [McpServers](../../reference/mcpservers/) · [McpStdioServer](../../reference/mcpstdioserver/) · [McpHttpServer](../../reference/mcphttpserver/) · [HarnessOptions](../../reference/customharnessoptions/).
