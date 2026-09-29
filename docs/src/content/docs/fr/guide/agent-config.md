---
title: "Configuration des agents"
description: "Choisir le protocole CLI et le modèle indépendamment de la sandbox."
---

Composez un agent avec `agent({ harness, model })`. Le harness pilote le protocole CLI ; `sandboxProvider` choisit où les commandes s’exécutent.

```ts
import { agent, claudeHarness } from "@elie-laloum/outpost";

const reviewer = agent({
  harness: claudeHarness({ authentication: "account" }),
});
```

## Choisir un harness

| Harness                               | Continuation et fork natifs | Accès                                     |
| ------------------------------------- | --------------------------- | ----------------------------------------- |
| [Codex](../codex/)                    | Oui                         | Compte ou clé API                         |
| [Claude Code](../claude-code/)        | Oui                         | Compte, jeton d’abonnement ou clé API     |
| [Antigravity](../antigravity/)        | Reprise à chaud seule       | Compte ou clé API                         |
| [GitHub Copilot CLI](../copilot-cli/) | Reprise seule               | Compte ou jeton Copilot                   |
| [Kimi Code](../kimi-code/)            | Oui                         | Compte ou clé API ; l’API exige un modèle |

Kimi permet continuation et fork. Copilot permet uniquement la continuation. Antigravity permet la continuation dans la même sandbox ouverte. Les trois peuvent réparer les réponses structurées avec leur mode de continuation pris en charge.

## Sélectionner un modèle

Omettez `model` pour utiliser le modèle par défaut de la CLI. Fournissez un nom ou `{ name, reasoning, maxOutputTokens }` si ces réglages sont pris en charge. Le harness valide les options à la composition de l’agent ; le service détermine si votre compte peut utiliser le modèle. Les réglages de raisonnement ou de sortie non pris en charge sont rejetés.

La [boucle de modèle](../model-loop/) personnalisée exige un modèle explicite et un fournisseur de modèle. Elle n’installe pas de CLI d’agent de code.

## Donner des outils MCP aux agents

Chaque harness accepte `mcpServers`. Voir [Serveurs MCP](../mcp-servers/).

## Se replier sur un autre agent ou modèle

Enveloppez plusieurs agents dans `fallbackAgent([...], { on })` pour confier un dispatch au suivant quand une limite ou une panne arrête l’agent courant. Voir [Agents de secours](../agent-fallback/).

API : [agent](../../reference/agent/) · [AgentOptions](../../reference/agentoptions/).
