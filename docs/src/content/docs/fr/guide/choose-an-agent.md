---
title: "Choisir un agent"
description: "Configurez un agent de code et comparez les réglages et les fonctions de conversation disponibles."
---

## Les agents

Un agent associe un harness à un choix de modèle facultatif. Le harness pilote les échanges : il peut s’appuyer sur un outil installé, comme Codex ou Claude Code, ou sur la boucle intégrée d’Outpost. Choisissez d’abord l’agent, puis configurez son accès et son modèle.

<!-- features -->

- [Claude Code](../claude-code/): La CLI de code d’Anthropic, avec réorientation en direct et les réglages de modèle les plus complets.
  - compte
  - jeton
  - clé d’API
- [Codex](../codex/): La CLI de code d’OpenAI, avec réorientation en direct et fournisseurs personnalisés compatibles Responses.
  - compte
  - clé d’API
- [GitHub Copilot CLI](../copilot-cli/): La CLI de code de GitHub, facturée sur votre forfait Copilot ; elle reprend une conversation mais sans fork.
  - compte
  - jeton
- [Kimi Code](../kimi-code/): La CLI de code de Moonshot AI ; avec une clé d’API, vous devez nommer le modèle.
  - compte
  - clé d’API
  - modèle requis avec clé d’API
- [Antigravity](../antigravity/): La CLI `agy` de Google ; ses conversations ne continuent que dans leur sandbox ouverte.
  - compte
  - clé d’API
- [Harness intégré](../harness/): La boucle propre à Outpost, qui exécute vos outils sur une API OpenAI ou Anthropic.
  - clé d’API
  - modèle requis

## Composer un agent

`createAgent()` prend un harness et un modèle facultatif. Chaque CLI a sa configuration prédéfinie : `createClaudeHarness()`, `createCodexHarness()`, `createCopilotHarness()`, `createKimiHarness()` et `createAntigravityHarness()`.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

export const reviewer = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
  model: { name: "opus", reasoning: "high" },
});
```

Passez l’agent à `dispatch()` dans `agent`. `authentication` choisit entre votre compte et une clé d’API ; voir [Authentification](../authentication/).

## Sélectionner un modèle

Référence API : [ModelSpec](../../reference/modelspec/) et [AgentModel](../../reference/agentmodel/).

`createAgent()` refuse les réglages que le harness ne peut pas appliquer, notamment les niveaux `reasoning` ou les valeurs `maxOutputTokens` non pris en charge. Cette vérification a lieu avant l’exécution. Le service du modèle vérifie l’accès de votre compte lors de la requête ; la référence API ci-dessous décrit les réglages pris en charge.

Référence API : [ModelSpec](../../reference/modelspec/) et [AgentModel](../../reference/agentmodel/).

## Comparer les capacités

### Se connecter

Choisissez les identifiants dont vous disposez. La page [Authentification](../authentication/) explique comment les transmettre à la sandbox et distingue la facturation par compte de celle par API.

| Agent                          | Connexion au compte | Jeton de compte dans une variable | Clé d’API                     |
| ------------------------------ | ------------------- | --------------------------------- | ----------------------------- |
| [Claude Code](../claude-code/) | Oui                 | Oui                               | Oui                           |
| [Codex](../codex/)             | Oui                 | Non                               | Oui                           |
| [Copilot CLI](../copilot-cli/) | Oui                 | Oui                               | Non                           |
| [Kimi Code](../kimi-code/)     | Oui                 | Non                               | Oui, avec un modèle explicite |
| [Antigravity](../antigravity/) | Oui                 | Non                               | Oui                           |
| [Harness intégré](../harness/) | Non                 | Non                               | Oui                           |

### Poursuivre le travail

Tous les agents peuvent poursuivre une conversation tant que leur sandbox reste ouverte. Pour reprendre dans une nouvelle sandbox, Outpost doit aussi pouvoir enregistrer et restaurer la conversation. Un fork crée une conversation distincte à partir du même contexte.

| Agent           | Reprise dans une nouvelle sandbox | Fork | Mode de réorientation |
| --------------- | --------------------------------- | ---- | --------------------- |
| Claude Code     | Oui                               | Oui  | `injected`            |
| Codex           | Oui                               | Oui  | `injected`            |
| Copilot CLI     | Oui                               | Non  | `resumed`             |
| Kimi Code       | Oui                               | Oui  | `resumed`             |
| Antigravity     | Non                               | Non  | `resumed`             |
| Harness intégré | Oui                               | Oui  | `injected`            |

Avec `injected`, les nouvelles consignes arrivent pendant l’échange en cours. Avec `resumed`, Outpost arrête l’échange puis reprend sa conversation. La page [Réorienter un agent](../steering/) montre comment envoyer ces consignes ; [Poursuivre une conversation](../conversations/) explique la reprise et le fork.

Tous ces agents acceptent les [réparations de réponse](../typed-responses/) lorsque la poursuite de conversation est activée. Avec `saveConversations: false`, Claude Code et Codex ne peuvent reprendre que dans leur sandbox ouverte. Avec `conversations: false`, le harness intégré désactive la reprise, le fork et les réparations.

Pour suivre les événements et les tokens, consultez [Suivre la progression](../progress/) et [Limiter les tentatives et les tokens](../budgets/). La possibilité de connaître l’heure de réinitialisation d’un quota dépend de l’agent ou du fournisseur de modèle ; [Attendre après une erreur de quota](../quota-pauses/) précise quand le workflow peut attendre automatiquement.

## Donner des outils MCP aux agents

Chaque harness accepte `mcpServers` : des commandes stdio ou des points d’accès HTTP, avec des secrets transmis par nom de variable. La page [Serveurs MCP](../mcp-servers/) montre comment les déclarer.

Pour OAuth, Claude Code, Codex et Kimi peuvent utiliser une connexion enregistrée sur l’hôte ; le harness intégré utilise des identifiants client. Copilot CLI et Antigravity ne prennent pas en charge cette configuration OAuth. Voir [Connexion aux serveurs MCP](../mcp-oauth/).

## Se replier sur un autre agent

`createFallbackAgent([...], { on })` confie un dispatch au candidat suivant quand une limite d’usage ou une panne arrête l’agent courant. Voir [Agents de secours](../fallback-agents/).

## Travailler sans CLI

`createHarness()` pilote directement l’API d’un modèle, avec les outils, permissions et sous-agents que vous déclarez. Il n’installe aucune CLI et exige un [fournisseur de modèle](../model-providers/). Voir [Harness intégré](../harness/).

API : [createAgent](../../reference/createagent/) · [AgentOptions](../../reference/agentoptions/) · [ModelSpec](../../reference/modelspec/) · [AgentModel](../../reference/agentmodel/) · [createClaudeHarness](../../reference/createclaudeharness/) · [createCodexHarness](../../reference/createcodexharness/) · [createCopilotHarness](../../reference/createcopilotharness/) · [createKimiHarness](../../reference/createkimiharness/) · [createAntigravityHarness](../../reference/createantigravityharness/) · [createHarness](../../reference/createharness/) · [createFallbackAgent](../../reference/createfallbackagent/).
