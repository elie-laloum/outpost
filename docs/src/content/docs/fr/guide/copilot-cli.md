---
title: "Configurer Copilot CLI"
description: "Exécutez GitHub Copilot CLI avec votre compte Copilot ou un jeton GitHub."
---

## Installer

L’[image d’agent](../agent-images/) contient `copilot`, issu du paquet `@github/copilot`, à la version fixée par [`agentVersions.copilot`](../../reference/agentversions/). Configurez l’accès au compte dans votre harness TypeScript, comme ci-dessous.

Votre compte GitHub doit avoir accès à Copilot ; voir le [démarrage rapide de la CLI GitHub](https://docs.github.com/en/copilot/get-started/cli-quickstart).

## Se connecter avec son compte

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

## Utiliser une clé d’API

Copilot n’a pas de mode par clé API : `authentication: "usage"` est refusé à la composition de l’agent. Les requêtes sont décomptées de votre abonnement Copilot.

## Fonctions disponibles

<!-- features -->

- [Conversations](../conversations/) : Capturées sous forme de archive de session, puis reprises à chaud ou à froid avec `--resume`.
- [Réponses typées](../typed-responses/) : Une réponse invalide est réparée en reprenant la même conversation.
- [Réorientation](../steering/) : Outpost arrête le processus et reprend la session avec votre texte.
- [Serveurs MCP](../mcp-servers/) : Transmis à chaque exécution avec `--additional-mcp-config`.
- [Consommation](../budgets/) : Tokens lus après l’exécution dans `session-state/<id>/events.jsonl`.
- [Pauses sur quota](../quota-pauses/) : Les messages de limite de débit et de crédits de Copilot échouent avec le code `quota`.

Référence API : [CopilotSettings](../../reference/copilotsettings/) et [createTransportConversations](../../reference/createtransportconversations/).

## Limites

- **Pas de fork automatisé** : Le fork d’une conversation Copilot est refusé ; reprenez-la plutôt.
- Pour les réglages de modèle pris en charge, consultez [CopilotSettings](../../reference/copilotsettings/).
- **Jetons classiques** : Les jetons d’accès personnels `ghp_` sont refusés.
- **Consommation incomplète** : Un fichier de session absent ou illisible met `usage.complete` à `false`, avec un avertissement.
- **Décompte tardif** : Les totaux de tokens peuvent arriver après leur consommation par le modèle. Associez un [budget](../budgets/) à un timeout.
- **Requêtes premium** : Copilot facture des requêtes premium ; `usage` compte des tokens, pas des requêtes premium.
- **Options MCP** : `startupTimeoutMs` et `oauth` sont refusés ; authentifiez les serveurs HTTP avec `bearerTokenVariable`.

API : [createCopilotHarness](../../reference/createcopilotharness/) · [CopilotSettings](../../reference/copilotsettings/) · [createCopilotConversations](../../reference/createcopilotconversations/).
