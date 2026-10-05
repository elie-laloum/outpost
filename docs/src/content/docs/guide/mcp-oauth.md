---
title: "Connect MCP accounts"
description: "Reuse a declared CLI server login or configure client credentials for the built-in harness."
---

## Choose a form

Set `oauth` on a declared HTTP [MCP server](../mcp-servers/) to use a saved login or client credentials. This option replaces `bearerTokenVariable` and any `Authorization` header; choose the form supported by your harness.

| Form                 | Harnesses                     | Token source                                        |
| -------------------- | ----------------------------- | --------------------------------------------------- |
| `oauth: "login"`     | Claude Code, Codex, Kimi Code | The CLI’s own MCP login, made once on the host      |
| `oauth: { client… }` | Built-in harness              | A client credentials grant requested in the sandbox |
| Neither              | Copilot CLI, Antigravity      | Use `bearerTokenVariable` with a token you provide  |

A harness that cannot use the declared form fails when the agent is composed.

## Reuse a CLI login

Log in on the host with the same server name and URL as your declaration.

| CLI         | Host login                                                                                          | Host file (relocated by)                            |
| ----------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Claude Code | `claude mcp add --transport http linear https://mcp.linear.app/mcp`, then `claude mcp login linear` | `~/.claude/.credentials.json` (`CLAUDE_CONFIG_DIR`) |
| Codex       | Set `mcp_oauth_credentials_store = "file"` in `~/.codex/config.toml`, then `codex mcp login linear` | `~/.codex/.credentials.json` (`CODEX_HOME`)         |
| Kimi Code   | Add the server to `~/.kimi-code/mcp.json`, then authenticate it in a `kimi` session                 | `~/.kimi-code/credentials/mcp/` (`KIMI_CODE_HOME`)  |

Then declare `oauth: "login"`.

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createCodexHarness({
    authentication: "account",
    mcpServers: {
      linear: { url: "https://mcp.linear.app/mcp", oauth: "login" },
    },
  }),
});
```

Before the agent starts, Outpost copies only the matching server entries into the private sandbox home. Your other logins, including the CLI account itself, are not copied by this option. A missing login fails with the host command to run.

With [`createLocalSandboxProvider()`](../host-process/), nothing is copied: the CLI reads your home directly.

:::caution
The CLI refreshes the token inside the sandbox. If the authorization server rotates refresh tokens, this can invalidate your host login: log in again on the host when a later run fails.
:::

## Request tokens with client credentials

For machine-to-machine servers in the [built-in harness](../harness/), name the variables that hold the client ID and secret.

```ts
import type { McpServers } from "@elie-laloum/outpost";

const mcpServers: McpServers = {
  internal: {
    url: "https://mcp.example.com/mcp",
    oauth: {
      clientIdVariable: "MCP_CLIENT_ID",
      clientSecretVariable: "MCP_CLIENT_SECRET",
      scopes: ["mcp:read"],
    },
  },
};
// createHarness({ modelProvider, mcpServers })
```

Declare both variables on the sandbox provider or in `.outpost/.env` ([Environment variables](../environment-variables/)). Without `scopes`, the bridge requests the scope named in the server’s 401 challenge, if any.

The HTTP bridge in the sandbox obtains the token itself, so the secret stays there and [outbound rules](../network-restrictions/) apply to the token requests.

<!-- canvas -->

- **Discover**: From the MCP server URL.
  - Steps
  - **Read the metadata**: Protected resource metadata, then the authorization server metadata and its token endpoint.
    - sandbox
  - → **Request**: then
- **Request**: One `client_credentials` grant.
  - Steps
  - **Authenticate the client**: With `client_secret_basic`, or `client_secret_post` when the server advertises only that.
    - sandbox
  - **Bind the token**: The server URL is sent as `resource`.
    - sandbox
  - → **Reuse**: then
- **Reuse**: Until the token expires.
  - Steps
  - **Retry on 401**: Discover again, request a new token and retry the request once.
    - sandbox

## Limits

- `oauth` is for HTTP servers only and cannot be combined with `bearerTokenVariable` or an `Authorization` header.
- The built-in harness refuses `"login"`; CLI harnesses refuse client credentials.
- Client credentials support neither `private_key_jwt`, refresh tokens nor interactive authorization.
- Outpost never reads a system keychain: a CLI that stores its MCP login there has nothing to copy.

API: [McpHttpServer](../../reference/mcphttpserver/) · [McpClientCredentials](../../reference/mcpclientcredentials/) · [McpServers](../../reference/mcpservers/).
