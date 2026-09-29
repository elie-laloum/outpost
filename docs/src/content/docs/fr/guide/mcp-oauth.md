---
title: "Connexion aux serveurs MCP"
description: "Authentifier des serveurs MCP HTTP avec une connexion CLI ou des identifiants client OAuth."
---

Un serveur MCP HTTP protégé par OAuth exige un jeton d’accès. `oauth` propose deux façons de l’obtenir, et remplace `bearerTokenVariable` ainsi que tout en-tête `Authorization`.

| Option               | Harness                       | Source du jeton                                    |
| -------------------- | ----------------------------- | -------------------------------------------------- |
| `oauth: "login"`     | Claude Code, Codex, Kimi Code | La connexion de la CLI, faite une fois sur l’hôte  |
| `oauth: { client… }` | Boucle intégrée               | Un grant client credentials obtenu dans la sandbox |

Copilot CLI et Antigravity refusent les deux formes : ils n’offrent pas de connexion MCP headless fiable.

## Réutiliser une connexion CLI

Connectez-vous sur l’hôte avec le même nom de serveur et la même URL que la déclaration, puis déclarez `oauth: "login"`.

| CLI         | Connexion sur l’hôte                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| Claude Code | `claude mcp add --transport http linear https://mcp.linear.app/mcp`, puis `claude mcp login linear`          |
| Codex       | Définissez `mcp_oauth_credentials_store = "file"` dans `~/.codex/config.toml`, puis `codex mcp login linear` |
| Kimi Code   | Ajoutez le serveur à `~/.kimi-code/mcp.json`, puis authentifiez-le dans une session Kimi avec `/mcp-config`  |

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

Avant le démarrage de l’agent, Outpost copie uniquement la connexion correspondante dans le home privé de la sandbox : les entrées `mcpOAuth` du `.credentials.json` de Claude Code, les entrées du `.credentials.json` de Codex (en forçant le stockage fichier de Codex) ou les fichiers de jetons de Kimi. Les autres connexions, dont votre abonnement Claude, ne sont pas copiées par cette option. Une connexion absente échoue en indiquant la commande à lancer. Avec [`createLocalSandboxProvider()`](../host-process/), rien n’est copié : la CLI lit directement votre home.

La CLI rafraîchit le jeton dans la sandbox. Si le serveur d’autorisation fait tourner les refresh tokens, ce rafraîchissement peut invalider la connexion de l’hôte ; reconnectez-vous sur l’hôte si une exécution ultérieure échoue.

## Identifiants client dans la boucle intégrée

Pour les serveurs de machine à machine, transmettez l’identifiant et le secret du client sous forme de variables déclarées.

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

Le pont HTTP de la sandbox lit les métadonnées de la ressource protégée, puis celles du serveur d’autorisation, et demande un jeton `client_credentials` avec l’URL du serveur comme `resource`. Il s’authentifie en `client_secret_basic`, ou en `client_secret_post` si le serveur n’annonce que celui-ci. Le jeton est réutilisé jusqu’à son expiration ; après un 401, le pont refait la découverte, demande un nouveau jeton avec le scope annoncé si `scopes` est omis, puis réessaie une fois. Le client déclare l’extension `io.modelcontextprotocol/oauth-client-credentials`. Le secret reste dans l’environnement de la sandbox et les [règles sortantes](../outbound-rules/) s’appliquent aux demandes de jeton.

`private_key_jwt`, les refresh tokens et l’autorisation interactive ne sont pas pris en charge. Les harness CLI refusent les identifiants client.

API : [McpHttpServer](../../reference/mcphttpserver/) · [McpClientCredentials](../../reference/mcpclientcredentials/).
