---
title: "Serveurs MCP"
description: "Donner aux agents les outils des serveurs Model Context Protocol."
---

Déclarez les serveurs MCP une seule fois et transmettez-les à n’importe quel harness CLI ou à la boucle de modèle intégrée. Un serveur est soit une commande qui parle MCP sur stdio, soit un point d’accès Streamable HTTP.

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

Les noms de serveur utilisent des lettres, des chiffres, `_` et `-`, jusqu’à 32 caractères. `command`, `arguments`, `environment`, `url` et `headers` sont des valeurs littérales non secrètes : elles sont copiées dans des lignes de commande ou des fichiers de configuration et ne peuvent pas contenir `${`. Transmettez les secrets par nom avec `variables` ou `bearerTokenVariable`.

## Déclarer les secrets

Chaque nom de `variables` et de `bearerTokenVariable` doit être une variable déclarée : dans les `variables` du harness, sur le fournisseur de sandbox ou dans `.outpost/.env`. Une valeur manquante échoue avant le démarrage de l’agent avec `Missing NAME`. Voir [Valeurs d’environnement](../environment-variables/).

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

Outpost n’écrit que des références comme `${LINEAR_API_KEY}` ou le nom de la variable. La CLI les résout depuis son propre environnement : les valeurs secrètes n’apparaissent jamais dans les arguments ni dans les fichiers.

## Harness CLI

Chaque preset CLI accepte `mcpServers`. Outpost les traduit dans la configuration native de la CLI.

| Harness     | Destination des serveurs                                          |
| ----------- | ----------------------------------------------------------------- |
| Claude Code | `--mcp-config` à chaque exécution                                 |
| Codex       | Surcharges `-c mcp_servers.<nom>…` à chaque exécution             |
| Copilot CLI | `--additional-mcp-config` à chaque exécution                      |
| Kimi Code   | Fusion dans `~/.kimi-code/mcp.json` du home de l’agent            |
| Antigravity | Fusion dans `~/.gemini/config/mcp_config.json` du home de l’agent |

Les serveurs déclarés s’ajoutent à ceux que la CLI connaît déjà. L’approbation des outils suit les réglages de permissions de chaque CLI : les presets headless qui ignorent les permissions autorisent aussi les outils MCP.

Kimi et Antigravity n’ont pas d’option par exécution : Outpost fusionne donc les entrées déclarées dans leur fichier du home, une fois par sandbox. Les autres serveurs et réglages du fichier sont conservés ; un fichier illisible fait échouer l’opération au lieu d’être remplacé. Dans un conteneur ou une sandbox cloud, le home est privé et disparaît avec la sandbox. Avec [`createLocalSandboxProvider()`](../host-process/), c’est votre propre home, et les entrées fusionnées restent après l’exécution.

## Filtrer les outils et régler le délai de démarrage

`tools: { include, exclude }` sélectionne les outils par leur nom MCP exact ; les exclusions s’appliquent après les inclusions. `startupTimeoutMs` borne le temps de démarrage d’un serveur.

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

| Harness         | `include`       | `exclude`                                           | `startupTimeoutMs`                               |
| --------------- | --------------- | --------------------------------------------------- | ------------------------------------------------ |
| Boucle intégrée | Oui             | Oui                                                 | Oui, 60 s par défaut                             |
| Claude Code     | Refusé          | `--disallowedTools`                                 | `MCP_TIMEOUT`, une valeur pour tous les serveurs |
| Codex           | `enabled_tools` | `disabled_tools`                                    | `startup_timeout_ms`                             |
| Copilot CLI     | `tools`         | `--deny-tool` : listé, mais les appels sont refusés | Refusé                                           |
| Kimi Code       | `enabledTools`  | `disabledTools`                                     | `startupTimeoutMs`                               |
| Antigravity     | Refusé          | `disabledTools`                                     | Refusé                                           |

Une option qu’une CLI ne sait pas appliquer échoue à la composition de l’agent. Claude Code applique un seul délai de démarrage à tous les serveurs de l’exécution : les valeurs déclarées doivent être identiques et ne peuvent pas être combinées avec une variable `MCP_TIMEOUT` explicite. Dans la boucle intégrée, un nom inclus que le serveur ne propose pas fait échouer le tour.

Pour les serveurs qui exigent OAuth, voir [Connexion aux serveurs MCP](../mcp-oauth/).

## Boucle de modèle intégrée

Transmettez les mêmes serveurs à `createHarness({ mcpServers })`. Chaque tour démarre les serveurs dans la sandbox empruntée, liste leurs outils et les arrête à la fin du tour.

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

Les outils s’appellent `mcp__<serveur>__<outil>` ; les caractères autres que lettres, chiffres, `_` et `-` deviennent `_`, et les noms trop longs se terminent par un court hachage. Les [règles de permissions](../harness-permissions/) portent sur ces noms, par exemple `tools: ["mcp__linear__*"]`. Les délais des outils envoient une annulation MCP. Les erreurs du serveur parviennent au modèle comme erreurs d’outil ; le texte, le contenu structuré et le texte des ressources sont renvoyés, tandis que les images et l’audio sont remplacés par un marqueur.

Un serveur stdio passe par un petit lanceur Node.js dans la sandbox. Un serveur HTTP est joint par un pont qui s’exécute lui aussi dans la sandbox : le jeton bearer y reste et les [règles sortantes](../network-restrictions/) s’y appliquent. La sandbox a donc besoin de `node`, et son bail doit accepter l’entrée en direct des processus, comme tous les fournisseurs intégrés. Sur Vercel et Daytona, chaque message vers un serveur stdio passe par un fichier interrogé dans la sandbox, ce qui ajoute environ une seconde par requête. Un serveur qui s’arrête ou ne s’initialise pas dans son délai de démarrage fait échouer le tour. Les sous-agents démarrent les serveurs de leur propre harness.

Pour la boucle intégrée, déclarez les secrets sur le fournisseur de sandbox ou dans `.outpost/.env` : un harness personnalisé n’a pas de `variables` propres.

## Ressources et prompts

Claude Code, Codex et Antigravity exposent déjà les ressources MCP à leur modèle. Dans la boucle intégrée, les serveurs qui annoncent des ressources ou des prompts ajoutent quatre outils en lecture seule, qui prennent chacun un nom de `server` : `mcp_list_resources` liste les ressources et modèles d’URI, `mcp_read_resource` lit une URI, `mcp_list_prompts` liste les prompts et `mcp_get_prompt` en rend un. Le texte des ressources est renvoyé ; le contenu binaire est remplacé par un marqueur.

Utilisez `defineMcpPrompt()` pour placer un prompt d’un serveur dans les instructions du harness. Il est rendu au début de chaque tour, et échoue si le serveur n’est pas déclaré sur ce harness ou ne propose pas de prompts.

```ts
import { defineMcpPrompt } from "@elie-laloum/outpost";

const review = defineMcpPrompt({
  server: "docs",
  name: "review",
  arguments: { language: "typescript" },
});
// createHarness({ modelProvider, mcpServers, instructions: [review] })
```

API : [McpServers](../../reference/mcpservers/) · [McpStdioServer](../../reference/mcpstdioserver/) · [McpHttpServer](../../reference/mcphttpserver/) · [McpToolFilter](../../reference/mcptoolfilter/) · [defineMcpPrompt](../../reference/definemcpprompt/) · [HarnessOptions](../../reference/customharnessoptions/).
