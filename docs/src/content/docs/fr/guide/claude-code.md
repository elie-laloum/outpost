---
title: "Claude Code"
description: "Connecter Claude Code à une sandbox Outpost."
---

Utilisez `createClaudeHarness()` avec un [environnement d’exécution](../execution-backends/) pris en charge. Installez la CLI dans votre image ou autorisez le bootstrap chez les fournisseurs distants.

## Accès par compte

Lancez `claude` puis `/login` sur l’hôte. Outpost lit l’entrée d’abonnement dans `~/.claude/.credentials.json`, ou sous `CLAUDE_CONFIG_DIR`. Outpost ne peut pas copier une connexion du trousseau macOS. Utilisez `claude setup-token`, puis `{ account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } }` en fournissant explicitement ce jeton.

## Accès API

Fournissez explicitement `ANTHROPIC_API_KEY`. L’usage API suit la facturation API du fournisseur.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createClaudeHarness({
    authentication: "usage",
    variables: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "" },
  }),
});
```

## Comportement

Claude prend en charge les conversations natives, la reprise, le fork et la réparation des réponses. `conversations` stocke les sessions capturées dans un [store de conversations](../chat-history/#stockage) au format `"claude"`, par exemple `createTransportConversations(createClaudeConversations(), …)`. Avec le [pilotage](../steering/), Claude reçoit les consignes sur son entrée stream-json pendant le tour, quel que soit le fournisseur de sandbox. `permissions` configure le mode de permissions CLI ; il ne remplace pas l’isolation de la sandbox. Ne fournissez pas `ANTHROPIC_API_KEY` avec des identifiants de compte, ni `CLAUDE_CODE_OAUTH_TOKEN` avec l’authentification API : Outpost rejette ces conflits.

Voir [Authentification Claude Code](https://code.claude.com/docs/en/authentication) pour les conditions d’accès du fournisseur.

`mcpServers` transmet des [serveurs MCP](../mcp-servers/) avec `--mcp-config` à chaque exécution.

API : [createClaudeHarness](../../reference/createclaudeharness/).
