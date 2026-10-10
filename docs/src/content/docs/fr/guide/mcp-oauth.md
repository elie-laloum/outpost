---
title: "Connecter les comptes MCP"
description: "Réutilisez une connexion déclarée à un serveur MCP ou configurez des identifiants client pour le harness intégré."
---

## Choisir un mode de connexion

Définissez `oauth` sur un [serveur MCP](../mcp-servers/) HTTP déclaré pour utiliser une connexion enregistrée ou des identifiants client. Cette option remplace `bearerTokenVariable` et tout en-tête `Authorization` ; choisissez la forme prise en charge par votre harness.

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

Avant le démarrage de l’agent, Outpost copie uniquement les entrées des serveurs concernés dans le répertoire personnel privé de la sandbox. Vos autres connexions, dont le compte de la CLI lui-même, ne sont pas copiées par cette option. Une connexion absente échoue en indiquant la commande à lancer sur l’hôte.

Avec [`createLocalSandboxProvider()`](../host-process/), rien n’est copié : la CLI lit directement votre répertoire personnel.

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

Déclarez les deux variables sur le fournisseur de sandbox ou dans `.outpost/.env` ([Variables d’environnement](../environment-variables/)). Sans `scopes`, le pont demande le scope indiqué par le challenge 401 du serveur, s’il y en a un.

Le pont HTTP de la sandbox obtient le jeton lui-même : le secret y reste et les [règles sortantes](../network-restrictions/) s’appliquent aux demandes de jeton.

1. Dans la sandbox, découvrez les métadonnées de la ressource protégée et du serveur d’autorisation depuis l’URL MCP.
2. Demandez un token `client_credentials` avec cette URL comme `resource`. Utilisez `client_secret_basic`, ou `client_secret_post` si le serveur n’annonce que cette méthode.
3. Réutilisez le token jusqu’à expiration. Sur une réponse `401`, refaites la découverte, obtenez un nouveau token et réessayez une seule fois.

## Limites

- `oauth` concerne uniquement les serveurs HTTP et ne se combine ni avec `bearerTokenVariable` ni avec un en-tête `Authorization`.
- Le harness intégré refuse `"login"` ; les harness CLI refusent les identifiants client.
- Les identifiants client ne prennent en charge ni `private_key_jwt`, ni les refresh tokens, ni l’autorisation interactive.
- Outpost ne lit jamais de trousseau système : une CLI qui y stocke sa connexion MCP n’a rien à copier.

API : [McpHttpServer](../../reference/mcphttpserver/) · [McpClientCredentials](../../reference/mcpclientcredentials/) · [McpServers](../../reference/mcpservers/).
