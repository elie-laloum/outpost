---
title: "MCP server login"
description: "Authenticate HTTP MCP servers with a CLI login or OAuth client credentials."
---

An HTTP MCP server protected by OAuth needs an access token. `oauth` offers two ways to get one, and replaces `bearerTokenVariable` and any `Authorization` header.

| Option               | Harnesses                     | Token source                                   |
| -------------------- | ----------------------------- | ---------------------------------------------- |
| `oauth: "login"`     | Claude Code, Codex, Kimi Code | The CLI's own login, made once on the host     |
| `oauth: { client… }` | Built-in loop                 | A client credentials grant made in the sandbox |

Copilot CLI and Antigravity refuse both forms: they offer no reliable headless MCP login.

## Reuse a CLI login

Log in on the host with the same server name and URL as the declaration, then declare `oauth: "login"`.

| CLI         | Host login                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| Claude Code | `claude mcp add --transport http linear https://mcp.linear.app/mcp`, then `claude mcp login linear`  |
| Codex       | Set `mcp_oauth_credentials_store = "file"` in `~/.codex/config.toml`, then `codex mcp login linear`  |
| Kimi Code   | Add the server to `~/.kimi-code/mcp.json`, then authenticate it in a Kimi session with `/mcp-config` |

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

Before the agent starts, Outpost copies only the matching login into the private sandbox home: Claude Code `mcpOAuth` entries of `.credentials.json`, Codex entries of `.credentials.json` (and it forces the Codex file store), or the Kimi token files. Other logins, including your Claude subscription, are not copied by this option. A missing login fails with the command to run. With [`createLocalSandboxProvider()`](../host-process/) nothing is copied: the CLI reads your home directly.

The CLI refreshes the token in the sandbox. If the authorization server rotates refresh tokens, that refresh can invalidate the host login; log in again on the host when a later run fails.

## Client credentials in the built-in loop

For machine-to-machine servers, pass the client ID and secret as declared variables.

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
```

The HTTP bridge in the sandbox reads the protected resource metadata, then the authorization server metadata, and requests a `client_credentials` token with the server URL as `resource`. It authenticates with `client_secret_basic`, or `client_secret_post` when the server only advertises that. The token is reused until it expires; after a 401 the bridge rediscovers, requests a new token with the challenged scope when `scopes` is omitted, and retries once. The client declares the `io.modelcontextprotocol/oauth-client-credentials` extension. The secret stays in the sandbox environment and [outbound rules](../outbound-rules/) apply to the token requests.

`private_key_jwt`, refresh tokens and interactive authorization are not supported. CLI harnesses refuse client credentials.

API: [McpHttpServer](../../reference/mcphttpserver/) · [McpClientCredentials](../../reference/mcpclientcredentials/).
