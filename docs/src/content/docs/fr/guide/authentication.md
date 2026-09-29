---
title: "Authentification"
description: "Faire tourner chaque agent CLI sur votre connexion d’abonnement ou sur une clé API, et savoir quel identifiant atteint la sandbox."
---

## Compte ou clé API

Chaque harness CLI prend un mode `authentication`. Outpost ne le choisit jamais à votre place.

|                 | `"account"`                                                      | `"usage"`                                                       |
| --------------- | ---------------------------------------------------------------- | --------------------------------------------------------------- |
| Utilise         | Votre connexion CLI ou un jeton d’abonnement                     | Une clé API                                                     |
| Facturation     | Votre abonnement ChatGPT, Claude, Copilot, Google ou Kimi        | Au jeton, sur le compte API de l’éditeur                        |
| Sur l’hôte      | Le fichier de connexion du CLI, par exemple `~/.codex/auth.json` | Une variable que vous déclarez                                  |
| Dans la sandbox | Une copie de la connexion dans le home privé de la sandbox       | La clé, dans la variable standard du CLI                        |
| Adapté à        | Vos propres exécutions, dans les conditions de votre abonnement  | La CI, les services et l’automatisation partagée par une équipe |

```ts
import {
  createAgent,
  createClaudeHarness,
  createCodexHarness,
} from "@elie-laloum/outpost";

// Votre abonnement ChatGPT, depuis ~/.codex/auth.json
export const planCoder = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});

// Facturation API, depuis une variable transmise au harness
export const apiCoder = createAgent({
  harness: createClaudeHarness({
    authentication: "usage",
    variables: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "" },
  }),
});
```

Sans `authentication`, Outpost ne prépare rien : le CLI utilise l’accès dont la sandbox dispose déjà. Provenance des variables déclarées : [Variables d’environnement](../environment-variables/).

## Choisir une forme pour votre agent

Les formes courtes lisent l’emplacement par défaut. Les formes objet pointent ailleurs : `file` vers un autre fichier de connexion, `variable` vers une variable d’un autre nom, `key` vers une valeur que votre code détient déjà.

| Agent                          | `"account"` lit                                     | `{ account: { file } }` | `{ account: { key \| variable } }` | `"usage"` définit   |
| ------------------------------ | --------------------------------------------------- | ----------------------- | ---------------------------------- | ------------------- |
| [Claude Code](../claude-code/) | `~/.claude/.credentials.json`                       | Un fichier              | `CLAUDE_CODE_OAUTH_TOKEN`          | `ANTHROPIC_API_KEY` |
| [Codex](../codex/)             | `~/.codex/auth.json`                                | Un fichier              | Non                                | `OPENAI_API_KEY`    |
| [Copilot CLI](../copilot-cli/) | `~/.copilot/config.json`                            | Un fichier              | `COPILOT_GITHUB_TOKEN`             | Non                 |
| [Kimi Code](../kimi-code/)     | `~/.kimi-code/`                                     | Un dossier de profil    | Non                                | `KIMI_API_KEY`      |
| [Antigravity](../antigravity/) | `~/.gemini/antigravity-cli/antigravity-oauth-token` | Un fichier              | Non                                | `GEMINI_API_KEY`    |

Tout agent qui accepte `"usage"` accepte aussi `{ usage: { key | variable } }`. Sur l’hôte, `CLAUDE_CONFIG_DIR`, `CODEX_HOME`, `COPILOT_HOME` et `KIMI_CODE_HOME` déplacent le fichier par défaut. Chaque page d’agent donne sa commande de connexion.

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

export const teamCoder = createAgent({
  harness: createCodexHarness({
    // Transmise à Codex sous le nom OPENAI_API_KEY
    authentication: { usage: { variable: "TEAM_OPENAI_KEY" } },
    variables: { TEAM_OPENAI_KEY: process.env.TEAM_OPENAI_KEY ?? "" },
  }),
});
```

## Ce qui atteint la sandbox

Outpost lit uniquement le fichier sélectionné, jamais un trousseau système. La suite dépend de l’endroit où l’agent s’exécute.

|                            | Sandbox isolée                                                                                  | [Exécution sur l’hôte](../host-process/)   |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Fichier de connexion       | Copié dans un home privé, supprimé avec la sandbox ; le jeton de Copilot passe par une variable | Non lu : le CLI utilise votre session hôte |
| Variables d’identification | Transmises aux commandes de l’agent                                                             | Transmises aux commandes de l’agent        |
| Commandes de connexion     | Exécutées dans la sandbox, par exemple `codex login --with-api-key`                             | Non exécutées                              |

:::caution
Un CLI qui rafraîchit son jeton dans la sandbox peut invalider la connexion de l’hôte dont il provient. Pour les exécutions sans surveillance, connectez-vous à un profil dédié et sélectionnez-le avec `{ account: { file } }`.
:::

## Séparer les identifiants

Trois types d’identifiants servent trois clients distincts. Une clé Vercel ou S3 n’authentifie jamais l’agent.

<!-- features -->

- [Provider de sandbox](../cloud-sandboxes/) : Les identifiants d’allocation restent au client du provider, sur l’hôte.
- [Agent](../choose-an-agent/) : `authentication` et les `variables` du harness connectent le CLI.
- [Stockage](../object-storage/) : Les clés de bucket restent au client du transport, sur l’hôte.

## Limites

- Claude rejette les variables contradictoires : les formes compte échouent si `ANTHROPIC_API_KEY` est déclarée, les formes `usage` si `CLAUDE_CODE_OAUTH_TOKEN` l’est.
- Les formes compte de Kimi rejettent des valeurs de `KIMI_CODE_OAUTH_HOST`, `KIMI_OAUTH_HOST` ou `KIMI_CODE_BASE_URL` qui contredisent la région choisie. Le mode `usage` de Kimi exige un nom de modèle dans `createAgent()`.
- Copilot n’a pas de mode `usage` et refuse les jetons classiques `ghp_`. Une connexion conservée dans le trousseau système est illisible : transmettez le jeton avec `{ account: { variable } }`.
- Codex avec un `modelProvider` personnalisé n’accepte que les formes `usage`.
- Un fichier de connexion doit être un fichier ordinaire d’au plus 1 Mio, pas un lien symbolique.
- Une forme non prise en charge échoue dès l’appel à `createAgent()`. Un fichier ou une variable manquants échouent au dispatch avec le code `configuration`, en indiquant la commande de connexion.

API : [AgentAuthentication](../../reference/agentauthentication/) · [AccountCredential](../../reference/accountcredential/) · [UsageCredential](../../reference/usagecredential/).
