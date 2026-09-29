---
title: "Serveurs MCP"
description: "Donner à n’importe quel agent les outils de serveurs Model Context Protocol, déclarés une fois et dont les secrets passent uniquement par leur nom."
---

## Déclarer les serveurs

`mcpServers` associe un nom de serveur à une commande stdio ou à un point d’accès Streamable HTTP. Tous les presets CLI et `createHarness()` acceptent la même déclaration.

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

Un serveur a soit `command` (stdio), soit `url` (HTTP). Les noms comptent de 1 à 32 lettres, chiffres, `_` ou `-`.

| Champ                  | Serveur  | Contenu                                                                                          |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `command`, `arguments` | stdio    | L’exécutable et ses arguments, lancés dans la sandbox.                                           |
| `environment`          | stdio    | Des valeurs d’environnement non secrètes.                                                        |
| `variables`            | stdio    | Les noms des variables secrètes transmises au serveur.                                           |
| `url`                  | HTTP     | Un point d’accès `http` ou `https` absolu, sans identifiants.                                    |
| `headers`              | HTTP     | Des en-têtes non secrets envoyés avec chaque requête.                                            |
| `bearerTokenVariable`  | HTTP     | Le nom de la variable envoyée en `Authorization: Bearer`.                                        |
| `oauth`                | HTTP     | Une connexion CLI ou des identifiants client : voir [Connexion aux serveurs MCP](../mcp-oauth/). |
| `tools`                | Les deux | Listes `include` et `exclude` de noms d’outils MCP exacts.                                       |
| `startupTimeoutMs`     | Les deux | Le temps accordé au serveur pour démarrer.                                                       |

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

Déclarez chaque nom dans les `variables` du harness, sur le provider de sandbox ou dans `.outpost/.env`. Une valeur manquante échoue avant le démarrage de l’agent avec `Missing LINEAR_API_KEY`. Outpost n’écrit que le nom ou une référence `${NAME}` ; la CLI lit la valeur dans son environnement.

## Où chaque CLI les reçoit

Outpost traduit la déclaration dans la configuration propre à chaque CLI. Les serveurs déclarés s’ajoutent à ceux que la CLI connaît déjà, et l’approbation des outils suit ses réglages de permissions.

| Harness     | Destination des serveurs                                   | Forme des secrets                                        |
| ----------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| Claude Code | `--mcp-config` à chaque exécution                          | `${NAME}` dans `env` et les en-têtes                     |
| Codex       | `-c mcp_servers.<nom>.…` à chaque exécution                | Noms dans `env_vars` et `bearer_token_env_var`           |
| Copilot CLI | `--additional-mcp-config` à chaque exécution               | `${NAME}` dans `env` et les en-têtes                     |
| Kimi Code   | `~/.kimi-code/mcp.json` dans le home de l’agent            | Environnement hérité (stdio), `bearerTokenEnvVar` (HTTP) |
| Antigravity | `~/.gemini/config/mcp_config.json` dans le home de l’agent | `${NAME}` dans `env` et les en-têtes                     |

Kimi Code et Antigravity n’ont pas d’option par exécution. Outpost fusionne les entrées déclarées dans leur fichier, une fois par sandbox, et conserve les autres entrées.

## Filtrer les outils et régler le délai de démarrage

`tools.include` ne garde que les outils listés ; `tools.exclude` retire ensuite des outils. `startupTimeoutMs` borne le démarrage du serveur.

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

| Harness         | `include`       | `exclude`                             | `startupTimeoutMs`                         |
| --------------- | --------------- | ------------------------------------- | ------------------------------------------ |
| Harness intégré | Oui             | Oui                                   | Oui, 60 s par défaut                       |
| Claude Code     | Refusé          | `--disallowedTools`                   | `MCP_TIMEOUT`, une valeur pour l’exécution |
| Codex           | `enabled_tools` | `disabled_tools`                      | `startup_timeout_ms`                       |
| Copilot CLI     | `tools`         | `--deny-tool` : listé, appels refusés | Refusé                                     |
| Kimi Code       | `enabledTools`  | `disabledTools`                       | `startupTimeoutMs`                         |
| Antigravity     | Refusé          | `disabledTools`                       | Refusé                                     |

Avec Claude Code, tous les serveurs qui fixent `startupTimeoutMs` doivent utiliser la même valeur, et vous ne pouvez pas définir en plus `MCP_TIMEOUT` dans les `variables` du harness.

## Les utiliser dans le harness intégré

Transmettez les mêmes serveurs à `createHarness({ mcpServers })`. Chaque tour les démarre dans la sandbox empruntée et les arrête à la fin du tour.

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

- `mcp__<server>__<tool>` : Le nom que voit le modèle et que visent les [règles de permissions](../harness-permissions/). Les caractères autres que lettres, chiffres, `_` et `-` deviennent `_` ; les noms longs finissent par un hachage.
- **Dans la sandbox** : Les serveurs stdio et le pont HTTP y tournent, donc les jetons y restent et les [règles réseau](../network-restrictions/) s’appliquent.
- **Résultats** : Le texte, le contenu structuré et le texte des ressources parviennent au modèle. Images et audio deviennent un marqueur ; les erreurs du serveur deviennent des erreurs d’outil.

Le harness n’a pas de `variables` propres : déclarez les secrets sur le provider de sandbox ou dans `.outpost/.env`. Un [sous-agent](../subagents/) démarre les serveurs de son propre harness.

:::note
La sandbox a besoin de `node` et doit accepter l’entrée en direct (`liveInput`). Tous les providers de sandbox intégrés le font.
:::

## Lire les ressources et les prompts

Dans le harness intégré, les serveurs qui annoncent des ressources ou des prompts ajoutent des outils en lecture seule. Chacun prend un nom de `server`.

| Outil                | Rôle                                               |
| -------------------- | -------------------------------------------------- |
| `mcp_list_resources` | Liste les ressources et les modèles de ressources. |
| `mcp_read_resource`  | Lit une ressource par son URI.                     |
| `mcp_list_prompts`   | Liste les prompts.                                 |
| `mcp_get_prompt`     | Rend un prompt avec ses arguments.                 |

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

- Avec [`createLocalSandboxProvider()`](../host-process/), les entrées de Kimi Code et d’Antigravity sont fusionnées dans votre propre home et y restent après l’exécution.
- Un fichier de configuration qu’Outpost ne peut pas lire comme du JSON fait échouer l’exécution au lieu d’être remplacé.
- Dans le harness intégré, un serveur qui s’arrête ou ne s’initialise pas dans son délai de démarrage fait échouer le tour, tout comme un nom `include` que le serveur ne propose pas.
- Sur Vercel et Daytona, chaque message MCP passe par un fichier dans la sandbox, ce qui ajoute de la latence à chaque requête.

API : [McpServers](../../reference/mcpservers/) · [McpStdioServer](../../reference/mcpstdioserver/) · [McpHttpServer](../../reference/mcphttpserver/) · [McpToolFilter](../../reference/mcptoolfilter/) · [defineMcpPrompt](../../reference/definemcpprompt/) · [HarnessOptions](../../reference/customharnessoptions/).
