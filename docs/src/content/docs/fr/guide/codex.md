---
title: "Codex"
description: "Exécuter OpenAI Codex dans une sandbox avec votre abonnement ChatGPT, une clé API OpenAI ou un endpoint compatible Responses."
---

## Installation

Les images générées par `outpost init` contiennent déjà Codex. Dans votre propre image, installez la CLI avec npm :

```sh
npm install -g @openai/codex
```

Si une sandbox distante (cloud, conteneur isolé ou Firecracker) n’a pas de `codex`, Outpost installe avec npm la version fixée dans [`agentVersions`](../../reference/agentversions/), dans le home de la sandbox, avant le premier tour. Passez `bootstrap: false` à `dispatch()` ou `createSandbox()` quand l’image doit la fournir ([Images d’agent](../agent-images/)).

## Accès par compte

Connectez-vous sur l’hôte avec un stockage des identifiants en fichier, puis sélectionnez `authentication: "account"`.

```sh
codex -c cli_auth_credentials_store='"file"' login
```

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});
```

Outpost copie `~/.codex/auth.json`, ou `auth.json` sous `CODEX_HOME`, dans le home privé de la sandbox. L’usage est décompté de votre abonnement ChatGPT. `{ account: { file: "/path/to/auth.json" } }` sélectionne un autre fichier de connexion. OpenAI documente les deux modes de connexion dans [Authentification Codex](https://developers.openai.com/codex/auth).

## Accès API

`authentication: "usage"` connecte Codex avec `OPENAI_API_KEY` dans la sandbox. La plateforme OpenAI facture cet usage séparément des abonnements ChatGPT.

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createCodexHarness({
    authentication: "usage",
    variables: { OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "" },
  }),
});
```

Autres noms de variable et sources de clé : [Authentification](../authentication/).

### Utiliser un endpoint compatible Responses

`modelProvider` dirige Codex vers un autre endpoint qui implémente l’API Responses d’OpenAI. Il exige un `model` explicite.

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createCodexHarness({
    modelProvider: {
      baseUrl: "https://llm.example.com/v1",
      apiKeyEnvironment: "LLM_API_KEY",
    },
    authentication: "usage",
    variables: { LLM_API_KEY: process.env.LLM_API_KEY ?? "" },
  }),
  model: "my-model",
});
```

<!-- features -->

- `baseUrl` : Une URL HTTP(S) absolue, sans identifiants, requête ni fragment.
- `apiKeyEnvironment` : La variable qui contient la clé, `OPENAI_API_KEY` par défaut.
- `apiKeyEnvironment: false` : Un endpoint sans authentification ; omettez `authentication`.

## Ce qu’il prend en charge

[Choisir un agent](../choose-an-agent/) compare ces capacités entre agents. Avec Codex :

<!-- features -->

- [Conversations](../conversations/) : Chaque session est capturée depuis `~/.codex/sessions`, puis reprise, dérivée ou utilisée pour réparer une réponse typée.
  - `saveConversations`
  - `conversations`
- [Réorientation](../steering/) : Un dispatch réorientable lance `codex app-server` au lieu de `codex exec`, avec les mêmes réglages de modèle, de raisonnement, d’endpoint et d’approbation.
  - `turn/steer`
- [Serveurs MCP](../mcp-servers/) : Les serveurs déclarés deviennent des surcharges `-c mcp_servers.<name>` à chaque exécution ; leurs événements d’outil s’appellent `mcp__<server>__<tool>`.
  - `mcpServers`
- [Connexion MCP](../mcp-oauth/) : `oauth: "login"` réutilise un `codex mcp login` fait sur l’hôte avec un stockage en fichier.
  - `oauth`
- [Suivre la progression](../progress/) : Chaque tour rapporte les tokens d’entrée, en cache et de sortie, les commandes, les modifications de fichiers et les résumés de raisonnement.
  - `usage`
- [Pauses sur quota](../quota-pauses/) : Une limite d’usage termine le dispatch avec le code `quota` ; une connexion perdue ou une erreur serveur, avec `unavailable`.
  - `onQuota`

`saveConversations: false` garde les sessions dans la sandbox. `conversations` remplace le store par défaut, par exemple pour archiver les sessions via un transport.

### Modèle et raisonnement

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
  model: { name: "gpt-5.5", reasoning: "high" },
});
```

Sans `model`, Codex utilise son modèle par défaut. `reasoning` accepte `low`, `medium`, `high`, `xhigh` et `max`.

### Approbations

Les exécutions sans terminal ignorent les demandes d’approbation de Codex et sa propre sandbox : c’est la sandbox Outpost qui isole l’agent. `approvalReviewer: "auto_review"` confie plutôt chaque demande d’approbation au relecteur automatique de Codex. Dans un [terminal interactif](../sandbox-sessions/), la valeur par défaut `"user"` vous laisse approuver.

## Limites

- Outpost ne lit jamais le trousseau du système : une connexion qui y est stockée ne peut pas être copiée. Reconnectez-vous avec un stockage en fichier.
- `maxOutputTokens` et les valeurs de `reasoning` hors de la liste ci-dessus sont refusés à la composition de l’agent.
- Un `modelProvider` personnalisé n’accepte que l’authentification `usage`. Les endpoints Chat Completions ne fonctionnent pas.
- Codex présente `app-server` comme expérimental ; la réorientation dépend de son protocole.
- Avec l’[exécution sur l’hôte](../host-process/), rien n’isole Codex, puisque les exécutions sans terminal contournent sa propre sandbox.

API : [createCodexHarness](../../reference/createcodexharness/) · [CodexSettings](../../reference/codexsettings/) · [CodexModelProvider](../../reference/codexmodelprovider/) · [createCodexConversations](../../reference/createcodexconversations/).
