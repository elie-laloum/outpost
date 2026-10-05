---
title: "Connecter des serveurs MCP"
description: "Donnez à un agent des outils, des ressources et des prompts MCP avec des identifiants déclarés explicitement."
---

## Déclarer les serveurs

Déclarez les serveurs MCP dans `mcpServers`, en donnant un nom à chacun. Un serveur peut être lancé par une commande ou exposer un point d’accès Streamable HTTP. Les harness des agents et le harness intégré acceptent la même déclaration.

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

Référence API : [McpStdioServer](../../reference/mcpstdioserver/) et [McpHttpServer](../../reference/mcphttpserver/).

## Transmettre les secrets par leur nom

`command`, `arguments`, `environment`, `url` et `headers` sont recopiés tels quels et ne peuvent pas contenir `${`. Placez les secrets dans des [variables déclarées](../environment-variables/) et référencez-les par leur nom.

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

Déclarez chaque nom dans les `variables` du harness, sur le fournisseur de sandbox ou dans `.outpost/.env`. Une valeur manquante échoue avant le démarrage de l’agent avec `Missing LINEAR_API_KEY`. Outpost n’écrit que le nom ou une référence `${NAME}` ; la CLI lit la valeur dans son environnement.

## Où chaque CLI les reçoit

Outpost traduit la déclaration dans la configuration propre à chaque CLI. Les serveurs déclarés s’ajoutent à ceux que la CLI connaît déjà, et l’approbation des outils suit ses réglages de permissions.

| Harness     | Destination des serveurs                                                   | Forme des secrets                                        |
| ----------- | -------------------------------------------------------------------------- | -------------------------------------------------------- |
| Claude Code | `--mcp-config` à chaque exécution                                          | `${NAME}` dans `env` et les en-têtes                     |
| Codex       | `-c mcp_servers.<nom>.…` à chaque exécution                                | Noms dans `env_vars` et `bearer_token_env_var`           |
| Copilot CLI | `--additional-mcp-config` à chaque exécution                               | `${NAME}` dans `env` et les en-têtes                     |
| Kimi Code   | `~/.kimi-code/mcp.json` dans le répertoire personnel de l’agent            | Environnement hérité (stdio), `bearerTokenEnvVar` (HTTP) |
| Antigravity | `~/.gemini/config/mcp_config.json` dans le répertoire personnel de l’agent | `${NAME}` dans `env` et les en-têtes                     |

Kimi Code et Antigravity n’ont pas d’option par exécution. Outpost fusionne les entrées déclarées dans leur fichier, une fois par sandbox, et conserve les autres entrées.

## Filtrer les outils et régler le délai de démarrage

Cet exemple retire l’outil de suppression des outils proposés au modèle et laisse deux minutes au serveur pour démarrer.

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

Une option qu’un harness ne sait pas appliquer échoue à la composition de l’agent.

Référence API : [McpToolFilter](../../reference/mcptoolfilter/).

Avec Claude Code, tous les serveurs qui fixent `startupTimeoutMs` doivent utiliser la même valeur, et vous ne pouvez pas définir en plus `MCP_TIMEOUT` dans les `variables` du harness.

## Les utiliser dans le harness intégré

Transmettez les mêmes serveurs à `createHarness({ mcpServers })`. Chaque tour les démarre dans la sandbox empruntée et les arrête à la fin du tour.

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

Référence API : [HarnessMcpContext](../../reference/harnessmcpcontext/) et [HarnessPermissionRule](../../reference/harnesspermissionrule/).

Le harness n’a pas de `variables` propres : déclarez les secrets sur le fournisseur de sandbox ou dans `.outpost/.env`. Un [sous-agent](../subagents/) démarre les serveurs de son propre harness.

:::note
La sandbox a besoin de `node` et doit accepter l’entrée en direct (`liveInput`). Tous les fournisseurs de sandbox intégrés le font.
:::

## Lire les ressources et les prompts

Dans le harness intégré, les serveurs qui annoncent des ressources ou des prompts ajoutent des outils en lecture seule. Chacun prend un nom de `server`.

Référence API : [createHarness](../../reference/createharness/) et [HarnessMcpContext](../../reference/harnessmcpcontext/).

`defineMcpPrompt()` place un prompt du serveur dans les instructions du harness. Il est rendu au début de chaque tour.

```ts
import { defineMcpPrompt } from "@elie-laloum/outpost";

const review = defineMcpPrompt({
  server: "docs",
  name: "review",
  arguments: { language: "typescript" },
});
// createHarness({ modelProvider, mcpServers, instructions: [review] })
```

## Limites

- Avec [`createLocalSandboxProvider()`](../host-process/), les entrées de Kimi Code et d’Antigravity sont fusionnées dans votre répertoire personnel et y restent après l’exécution.
- Un fichier de configuration qu’Outpost ne peut pas lire comme du JSON fait échouer l’exécution au lieu d’être remplacé.
- Dans le harness intégré, un serveur qui s’arrête ou ne s’initialise pas dans son délai de démarrage fait échouer le tour, tout comme un nom `include` que le serveur ne propose pas.
- Sur Vercel et Daytona, chaque message MCP passe par un fichier dans la sandbox, ce qui ajoute de la latence à chaque requête.

API : [McpServers](../../reference/mcpservers/) · [McpStdioServer](../../reference/mcpstdioserver/) · [McpHttpServer](../../reference/mcphttpserver/) · [McpToolFilter](../../reference/mcptoolfilter/) · [defineMcpPrompt](../../reference/definemcpprompt/) · [HarnessOptions](../../reference/customharnessoptions/).
