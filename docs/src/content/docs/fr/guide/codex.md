---
title: "Configurer Codex"
description: "Exécutez Codex avec votre compte ou une clé d’API, y compris sur un service compatible avec l’API Responses."
---

## Installation

L’[image d’agent](../agent-images/) contient déjà Codex. Si vous gérez votre propre image, installez son outil en ligne de commande avec npm :

```sh
npm install -g @openai/codex
```

Si une sandbox distante (cloud, conteneur isolé ou Firecracker) n’a pas de `codex`, Outpost installe avec npm la version fixée dans [`agentVersions`](../../reference/agentversions/), dans le répertoire personnel de la sandbox, avant le premier tour. Passez `bootstrap: false` à `dispatch()` ou `createSandbox()` quand l’image doit la fournir ([Images d’agent](../agent-images/)).

## Se connecter avec son compte

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

Outpost copie `~/.codex/auth.json`, ou `auth.json` sous `CODEX_HOME`, dans le répertoire personnel privé de la sandbox. L’usage est décompté de votre abonnement ChatGPT. `{ account: { file: "/path/to/auth.json" } }` sélectionne un autre fichier de connexion. OpenAI documente les deux modes de connexion dans [Authentification Codex](https://developers.openai.com/codex/auth).

## Utiliser une clé d’API

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

### Utiliser un point d’accès compatible Responses

`modelProvider` dirige Codex vers un autre point d’accès qui implémente l’API Responses d’OpenAI. Il exige un `model` explicite.

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

Référence API : [CodexModelProvider](../../reference/codexmodelprovider/).

## Fonctions disponibles

[Choisir un agent](../choose-an-agent/) compare ces capacités entre agents. Avec Codex :

<!-- features -->

- [Conversations](../conversations/) : Chaque session est capturée depuis `~/.codex/sessions`, puis reprise, dérivée ou utilisée pour réparer une réponse typée.
- [Réorientation](../steering/) : Un dispatch réorientable lance `codex app-server` au lieu de `codex exec`, avec les mêmes réglages de modèle, de raisonnement, de point d’accès et d’approbation.
- [Serveurs MCP](../mcp-servers/) : Les serveurs déclarés deviennent des surcharges `-c mcp_servers.<name>` à chaque exécution ; leurs événements d’outil s’appellent `mcp__<server>__<tool>`.
- [Connexion MCP](../mcp-oauth/) : `oauth: "login"` réutilise un `codex mcp login` fait sur l’hôte avec un stockage en fichier.
- [Suivre la progression](../progress/) : Chaque tour rapporte les tokens d’entrée, en cache et de sortie, les commandes, les modifications de fichiers et les résumés de raisonnement.
- [Pauses sur quota](../quota-pauses/) : Une limite d’usage termine le dispatch avec le code `quota` ; une connexion perdue ou une erreur serveur, avec `unavailable`.

`saveConversations: false` garde les sessions dans la sandbox. `conversations` remplace le stockage par défaut, par exemple pour archiver les sessions via un transport.

### Modèle et raisonnement

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
  model: { name: "gpt-5.5", reasoning: "high" },
});
```

Référence API : [CodexSettings](../../reference/codexsettings/).

### Approbations

Les exécutions sans terminal ignorent les demandes d’approbation de Codex et sa propre sandbox : c’est la sandbox Outpost qui isole l’agent. `approvalReviewer: "auto_review"` confie plutôt chaque demande d’approbation au relecteur automatique de Codex. Dans un [terminal interactif](../sandbox-sessions/), la valeur par défaut `"user"` vous laisse approuver.

## Limites

- Outpost ne lit jamais le trousseau du système : une connexion qui y est stockée ne peut pas être copiée. Reconnectez-vous avec un stockage en fichier.
- `maxOutputTokens` et les valeurs de `reasoning` hors de la liste ci-dessus sont refusés à la composition de l’agent.
- Un `modelProvider` personnalisé n’accepte que l’authentification `usage`. Les points d’accès Chat Completions ne fonctionnent pas.
- Codex présente `app-server` comme expérimental ; la réorientation dépend de son protocole.
- Avec l’[exécution sur l’hôte](../host-process/), rien n’isole Codex, puisque les exécutions sans terminal contournent sa propre sandbox.

API : [createCodexHarness](../../reference/createcodexharness/) · [CodexSettings](../../reference/codexsettings/) · [CodexModelProvider](../../reference/codexmodelprovider/) · [createCodexConversations](../../reference/createcodexconversations/).
