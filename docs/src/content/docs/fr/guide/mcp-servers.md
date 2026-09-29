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

Chaque nom de `variables` et de `bearerTokenVariable` doit être une variable déclarée : dans les `variables` du harness, sur le fournisseur de sandbox ou dans `.outpost/.env`. Une valeur manquante échoue avant le démarrage de l’agent avec `Missing NAME`. Voir [Valeurs d’environnement](../environment-values/).

```ts
import { agent, claudeHarness } from "@elie-laloum/outpost";

const coder = agent({
  harness: claudeHarness({
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

Kimi et Antigravity n’ont pas d’option par exécution : Outpost fusionne donc les entrées déclarées dans leur fichier du home, une fois par sandbox. Les autres serveurs et réglages du fichier sont conservés ; un fichier illisible fait échouer l’opération au lieu d’être remplacé. Dans un conteneur ou une sandbox cloud, le home est privé et disparaît avec la sandbox. Avec [`localSandboxProvider()`](../host-process/), c’est votre propre home, et les entrées fusionnées restent après l’exécution.

## Boucle de modèle intégrée

Transmettez les mêmes serveurs à `harness({ mcpServers })`. Chaque tour démarre les serveurs dans la sandbox empruntée, liste leurs outils et les arrête à la fin du tour.

```ts
import {
  agent,
  harness,
  harnessFileTools,
  openaiModelProvider,
} from "@elie-laloum/outpost";

const reviewer = agent({
  model: process.env.MODEL_NAME ?? "",
  harness: harness({
    modelProvider: openaiModelProvider({
      baseUrl: "https://api.openai.com/v1",
      api: "responses",
      apiKey: process.env.OPENAI_API_KEY ?? "",
    }),
    tools: [harnessFileTools()],
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

Les outils s’appellent `mcp__<serveur>__<outil>` ; les caractères autres que lettres, chiffres, `_` et `-` deviennent `_`, et les noms trop longs se terminent par un court hachage. Les [règles de permissions](../tool-policies/) portent sur ces noms, par exemple `tools: ["mcp__linear__*"]`. Les délais des outils envoient une annulation MCP. Les erreurs du serveur parviennent au modèle comme erreurs d’outil ; le texte, le contenu structuré et le texte des ressources sont renvoyés, tandis que les images et l’audio sont remplacés par un marqueur.

Un serveur stdio passe par un petit lanceur Node.js dans la sandbox. Un serveur HTTP est joint par un pont qui s’exécute lui aussi dans la sandbox : le jeton bearer y reste et les [règles sortantes](../outbound-rules/) s’y appliquent. La sandbox a donc besoin de `node`, et son bail doit accepter l’entrée en direct des processus, comme tous les fournisseurs intégrés. Sur Vercel et Daytona, chaque message vers un serveur stdio passe par un fichier interrogé dans la sandbox, ce qui ajoute environ une seconde par requête. Un serveur qui s’arrête ou ne s’initialise pas en 60 secondes fait échouer le tour. Les sous-agents démarrent les serveurs de leur propre harness.

Pour la boucle intégrée, déclarez les secrets sur le fournisseur de sandbox ou dans `.outpost/.env` : un harness personnalisé n’a pas de `variables` propres.

API : [McpServers](../../reference/mcpservers/) · [McpStdioServer](../../reference/mcpstdioserver/) · [McpHttpServer](../../reference/mcphttpserver/) · [HarnessOptions](../../reference/customharnessoptions/).
