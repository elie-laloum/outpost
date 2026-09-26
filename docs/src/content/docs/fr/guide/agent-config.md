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
| [Antigravity](../antigravity/)        | Non                         | Compte ou clé API                         |
| [GitHub Copilot CLI](../copilot-cli/) | Non                         | Compte ou jeton Copilot                   |
| [Kimi Code](../kimi-code/)            | Non                         | Compte ou clé API ; l’API exige un modèle |

Antigravity, Copilot et Kimi démarrent des sessions neuves. Ils ne peuvent pas utiliser les réparations automatiques de réponse qui nécessitent une continuation.

## Sélectionner un modèle

Omettez `model` pour utiliser le modèle par défaut de la CLI. Fournissez un nom ou `{ name, reasoning, maxOutputTokens }` si ces réglages sont pris en charge. Le harness valide les options à la composition de l’agent ; le service détermine si votre compte peut utiliser le modèle. Les réglages de raisonnement ou de sortie non pris en charge sont rejetés.

La [boucle de modèle](../model-loop/) personnalisée exige un modèle explicite et un fournisseur de modèle. Elle n’installe pas de CLI d’agent de code.

API : [agent](../../reference/agent/) · [AgentOptions](../../reference/agentoptions/).
