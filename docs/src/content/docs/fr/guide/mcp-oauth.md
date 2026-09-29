---
title: "Connexion aux serveurs MCP"
description: "Connecter les agents à des serveurs MCP HTTP protégés par OAuth, avec une connexion CLI faite sur l’hôte ou des identifiants client demandés dans la sandbox."
---

## Choisir une forme

Définissez `oauth` sur un serveur HTTP de [`mcpServers`](../mcp-servers/). Il remplace `bearerTokenVariable` et tout en-tête `Authorization`.

| Forme                | Harness                       | Source du jeton                                         |
| -------------------- | ----------------------------- | ------------------------------------------------------- |
| `oauth: "login"`     | Claude Code, Codex, Kimi Code | La connexion MCP de la CLI, faite une fois sur l’hôte   |
| `oauth: { client… }` | Harness intégré               | Un grant client credentials demandé dans la sandbox     |
| Aucune               | Copilot CLI, Antigravity      | `bearerTokenVariable` avec un jeton que vous fournissez |

Un harness qui ne peut pas utiliser la forme déclarée échoue dès la composition de l’agent.

## Réutiliser une connexion CLI

Connectez-vous sur l’hôte avec le même nom de serveur et la même URL que dans votre déclaration.

| CLI         | Connexion sur l’hôte                                                                                         | Fichier sur l’hôte (déplacé par)                    |
| ----------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Claude Code | `claude mcp add --transport http linear https://mcp.linear.app/mcp`, puis `claude mcp login linear`          | `~/.claude/.credentials.json` (`CLAUDE_CONFIG_DIR`) |
| Codex       | Définissez `mcp_oauth_credentials_store = "file"` dans `~/.codex/config.toml`, puis `codex mcp login linear` | `~/.codex/.credentials.json` (`CODEX_HOME`)         |
| Kimi Code   | Ajoutez le serveur à `~/.kimi-code/mcp.json`, puis authentifiez-le dans une session `kimi`                   | `~/.kimi-code/credentials/mcp/` (`KIMI_CODE_HOME`)  |

Déclarez ensuite `oauth: "login"`.

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

Avant le démarrage de l’agent, Outpost copie uniquement les entrées des serveurs concernés dans le home privé de la sandbox. Vos autres connexions, dont le compte de la CLI lui-même, ne sont pas copiées par cette option. Une connexion absente échoue en indiquant la commande à lancer sur l’hôte.

Avec [`createLocalSandboxProvider()`](../host-process/), rien n’est copié : la CLI lit directement votre home.

:::caution
La CLI rafraîchit le jeton dans la sandbox. Si le serveur d’autorisation fait tourner les refresh tokens, ce rafraîchissement peut invalider votre connexion sur l’hôte : reconnectez-vous sur l’hôte si une exécution ultérieure échoue.
:::

## Demander des jetons par identifiants client

Pour les serveurs de machine à machine du [harness intégré](../harness/), nommez les variables qui contiennent l’identifiant et le secret du client.

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

Déclarez les deux variables sur le provider de sandbox ou dans `.outpost/.env` ([Variables d’environnement](../environment-variables/)). Sans `scopes`, le pont demande le scope indiqué par le challenge 401 du serveur, s’il y en a un.

Le pont HTTP de la sandbox obtient le jeton lui-même : le secret y reste et les [règles sortantes](../network-restrictions/) s’appliquent aux demandes de jeton.

<!-- flow -->

1. **Découvrir**: À partir de l’URL du serveur MCP.
   - **Lire les métadonnées**: Métadonnées de la ressource protégée, puis celles du serveur d’autorisation et son endpoint de jeton.
     - sandbox
2. **Demander**: Un grant `client_credentials`.
   - **Authentifier le client**: Avec `client_secret_basic`, ou `client_secret_post` si le serveur n’annonce que celui-ci.
     - sandbox
   - **Lier le jeton**: L’URL du serveur est envoyée comme `resource`.
     - sandbox
3. **Réutiliser**: Jusqu’à l’expiration du jeton.
   - **Réessayer après un 401**: Refaire la découverte, demander un nouveau jeton et réessayer la requête une fois.
     - sandbox

## Limites

- `oauth` concerne uniquement les serveurs HTTP et ne se combine ni avec `bearerTokenVariable` ni avec un en-tête `Authorization`.
- Le harness intégré refuse `"login"` ; les harness CLI refusent les identifiants client.
- Les identifiants client ne prennent en charge ni `private_key_jwt`, ni les refresh tokens, ni l’autorisation interactive.
- Outpost ne lit jamais de trousseau système : une CLI qui y stocke sa connexion MCP n’a rien à copier.

API : [McpHttpServer](../../reference/mcphttpserver/) · [McpClientCredentials](../../reference/mcpclientcredentials/) · [McpServers](../../reference/mcpservers/).
