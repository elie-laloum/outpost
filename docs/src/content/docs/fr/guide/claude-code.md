---
title: "Configurer Claude Code"
description: "Exécutez Claude Code avec votre compte ou une clé d’API et choisissez les réglages du modèle."
---

## Installer

L’[image d’agent](../agent-images/) contient Claude Code. Les sandboxes distantes installent `claude` s’il est absent avant le premier échange ; l’[exécution locale](../host-process/) utilise l’exécutable déjà présent dans votre `PATH`.

<!-- features -->

- **Version épinglée** : L’image et l’installation distante utilisent `@anthropic-ai/claude-code` à la version de [`agentVersions.claude`](../../reference/agentversions/).
- **Installation distante** : npm l’installe sous `~/.outpost-tools` dans la sandbox.
- **Image seule** : `bootstrap: false` sur `dispatch()` ou `createSandbox()` désactive l’installation ; l’image doit fournir `claude`.

## Se connecter avec son compte

Lancez `claude`, puis `/login`, sur l’hôte. `authentication: "account"` copie la connexion d’abonnement de `~/.claude/.credentials.json` (ou `$CLAUDE_CONFIG_DIR/.credentials.json`) dans le répertoire personnel privé de la sandbox.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
```

Sur macOS, Claude Code range sa connexion dans le trousseau par défaut, et Outpost ne lit jamais de trousseau. Lancez plutôt `claude setup-token` et transmettez le jeton affiché dans une variable. Il utilise votre forfait Pro, Max, Team ou Enterprise.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createClaudeHarness({
    authentication: { account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } },
    variables: {
      CLAUDE_CODE_OAUTH_TOKEN: process.env.CLAUDE_CODE_OAUTH_TOKEN ?? "",
    },
  }),
});
```

Choisir entre compte et API, et savoir où vont les identifiants : [Authentification](../authentication/). Conditions de l’éditeur : [Claude Code authentication](https://code.claude.com/docs/en/authentication).

## Utiliser une clé d’API

`authentication: "usage"` transmet `ANTHROPIC_API_KEY`. Les requêtes sont facturées sur votre compte API Anthropic, pas sur un abonnement.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createClaudeHarness({
    authentication: "usage",
    variables: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "" },
  }),
});
```

## Choisir un modèle et des options

Sans `model`, Claude Code utilise son modèle par défaut. Un objet modèle ajoute un niveau d’effort et une limite de sortie.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createClaudeHarness({
    authentication: "account",
    partialMessages: true,
  }),
  model: { name: "sonnet", reasoning: "high", maxOutputTokens: 32_000 },
});
```

Référence API : [ClaudeSettings](../../reference/claudesettings/) et [AgentModel](../../reference/agentmodel/).

## Fonctions disponibles

[Choisir un agent](../choose-an-agent/) compare ces capacités d’un agent à l’autre.

<!-- features -->

- [Conversations](../conversations/) : Capturées après chaque tour, puis reprises ou dérivées dans une nouvelle sandbox.
  - reprise
  - fork
  - réparation des réponses
- [Réorientation](../steering/) : Les consignes rejoignent le tour en cours par son entrée stream-json, sur tous les fournisseurs de sandbox.
- [Pauses sur quota](../quota-pauses/) : Une limite d’usage échoue avec le code `quota`, avec l’heure de réinitialisation quand Claude la fournit.
- [Agents de secours](../fallback-agents/) : Les erreurs API 5xx, les surcharges et les échecs de connexion sont classés `unavailable`.
- [Progression](../progress/) : Appels d’outils, réflexion et usage de tokens par message, tokens de cache compris.
- [Serveurs MCP](../mcp-servers/) : Serveurs stdio et HTTP, outils exclus et connexions OAuth de l’hôte.

## Limites

- **Un seul identifiant** : Déclarer `ANTHROPIC_API_KEY` avec l’accès par compte, ou `CLAUDE_CODE_OAUTH_TOKEN` avec l’accès par API, échoue avant le début du tour.
- **Permissions** : Sans `permissions`, les tours non interactifs s’exécutent avec `--dangerously-skip-permissions`. La frontière d’isolation est la sandbox, pas le mode de permissions.
- **Réglages en double** : Définissez `maxOutputTokens` ou une variable `CLAUDE_CODE_MAX_OUTPUT_TOKENS`, pas les deux.

API : [createClaudeHarness](../../reference/createclaudeharness/) · [ClaudeSettings](../../reference/claudesettings/) · [createClaudeConversations](../../reference/createclaudeconversations/) · [AgentAuthentication](../../reference/agentauthentication/).
