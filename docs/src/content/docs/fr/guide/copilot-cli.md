---
title: "GitHub Copilot CLI"
description: "Exécuter la CLI copilot avec votre abonnement Copilot, via une connexion enregistrée ou un jeton GitHub à permissions fines."
---

## Installer

Les [images d’agent](../agent-images/) générées installent la CLI `copilot` (`@github/copilot`) dans la version épinglée par [`agentVersions.copilot`](../../reference/agentversions/). Pour générer un projet Copilot qui lit un jeton depuis `.env` :

```sh
npx outpost init --yes --agent copilot --authentication account-token --image outpost:dev
```

Votre compte GitHub doit avoir accès à Copilot ; voir le [démarrage rapide de la CLI GitHub](https://docs.github.com/en/copilot/get-started/cli-quickstart).

## Accès par compte

Copilot s’exécute toujours sur votre abonnement Copilot. Fournissez un jeton GitHub à permissions fines disposant de la permission **Copilot Requests** :

```ts
import { createAgent, createCopilotHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createCopilotHarness({
    authentication: { account: { variable: "COPILOT_GITHUB_TOKEN" } },
    variables: { COPILOT_GITHUB_TOKEN: process.env.COPILOT_GITHUB_TOKEN ?? "" },
  }),
});
```

Pour réutiliser plutôt une connexion de l’hôte, lancez `copilot login` et indiquez `authentication: "account"`. Outpost lit le jeton du dernier utilisateur connecté dans `~/.copilot/config.json` (ou `$COPILOT_HOME/config.json`) et le transmet à la sandbox sous le nom `COPILOT_GITHUB_TOKEN`.

:::caution
Par défaut, Copilot enregistre sa connexion dans le trousseau système, qu’Outpost ne lit jamais. Si `config.json` ne contient aucun jeton, utilisez la forme par jeton ci-dessus.
:::

Autres formes d’identifiants et emplacement des secrets : [Authentification](../authentication/).

## Accès API

Copilot n’a pas de mode par clé API : `authentication: "usage"` est refusé à la composition de l’agent. Les requêtes sont décomptées de votre abonnement Copilot.

## Ce qu’il prend en charge

<!-- features -->

- [Conversations](../conversations/) : Capturées sous forme de bundle de session, puis reprises à chaud ou à froid avec `--resume`.
  - `conversations`
  - `createCopilotConversations()`
- [Réponses typées](../typed-responses/) : Une réponse invalide est réparée en reprenant la même conversation.
  - `response`
- [Réorientation](../steering/) : Outpost arrête le processus et reprend la session avec votre texte.
  - `resumed`
- [Serveurs MCP](../mcp-servers/) : Transmis à chaque exécution avec `--additional-mcp-config`.
  - `mcpServers`
- [Consommation](../budgets/) : Tokens lus après l’exécution dans `session-state/<id>/events.jsonl`.
  - `usage.complete`
- [Pauses sur quota](../quota-pauses/) : Les messages de limite de débit et de crédits de Copilot échouent avec le code `quota`.
  - `onQuota`

`conversations` accepte un store au format `"copilot"`, par exemple `createTransportConversations(createCopilotConversations(), …)`. [Choisir un agent](../choose-an-agent/) compare ces capacités d’un agent à l’autre.

## Limites

- **Pas de fork automatisé** : Le fork d’une conversation Copilot est refusé ; reprenez-la plutôt.
- **Réglages du modèle** : `model` n’accepte qu’un nom. `reasoning` et `maxOutputTokens` sont refusés.
- **Jetons classiques** : Les jetons d’accès personnels `ghp_` sont refusés.
- **Consommation incomplète** : Un fichier de session absent ou illisible met `usage.complete` à `false`, avec un avertissement.
- **Décompte tardif** : Les totaux de tokens peuvent arriver après leur consommation par le modèle. Associez un [budget](../budgets/) à un timeout.
- **Requêtes premium** : Copilot facture des requêtes premium ; `usage` compte des tokens, pas des requêtes premium.
- **Options MCP** : `startupTimeoutMs` et `oauth` sont refusés ; authentifiez les serveurs HTTP avec `bearerTokenVariable`.

API : [createCopilotHarness](../../reference/createcopilotharness/) · [CopilotSettings](../../reference/copilotsettings/) · [createCopilotConversations](../../reference/createcopilotconversations/).
