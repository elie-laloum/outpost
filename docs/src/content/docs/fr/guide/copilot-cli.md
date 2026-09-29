---
title: "GitHub Copilot CLI"
description: "Utiliser un compte ou un jeton Copilot."
---

Utilisez `createCopilotHarness()` pour exécuter la CLI `copilot`. Cet adaptateur utilise l’accès au compte Copilot ; `authentication: "usage"` n’est pas pris en charge.

## Fournir un jeton

Utilisez un jeton à permissions fines avec la permission Copilot Requests. Les jetons classiques `ghp_` sont rejetés.

```ts
import { createAgent, createCopilotHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createCopilotHarness({
    authentication: { account: { variable: "COPILOT_GITHUB_TOKEN" } },
    variables: { COPILOT_GITHUB_TOKEN: process.env.COPILOT_GITHUB_TOKEN ?? "" },
  }),
});
```

## Utiliser une connexion enregistrée

Lancez `copilot login` sur l’hôte et sélectionnez `authentication: "account"`. Outpost lit le jeton du dernier utilisateur connecté dans `~/.copilot/config.json`, ou sous `COPILOT_HOME`. Si le jeton est stocké uniquement dans un trousseau système, utilisez la variable explicite ci-dessus.

## Gestion des sessions

La capture native, la reprise à chaud et à froid et les réparations automatiques sont prises en charge. Outpost reprend l’identifiant exact avec `--resume` et conserve historique, métadonnées, plans, checkpoints et fichiers persistants dans un bundle borné. Le fork automatisé est explicitement refusé : la commande interactive `/fork` ne constitue pas un contrat de fork headless pris en charge. `conversations` stocke les sessions capturées dans un [store de conversations](../conversations/#stockage) au format `"copilot"`, par exemple `createTransportConversations(createCopilotConversations(), …)`. Voir [l’historique](../conversations/) et [le stockage des sessions GitHub](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-best-practices).

Voir le [démarrage CLI GitHub](https://docs.github.com/en/copilot/get-started/cli-quickstart) pour les conditions d’accès et de connexion Copilot.

## Comptabilité des tokens

Outpost lit `session.shutdown.modelMetrics` dans `COPILOT_HOME/session-state/<id>/events.jsonl` (par défaut : `~/.copilot`), à l’intérieur de la sandbox après la fin de la commande. Les événements `assistant.usage` disponibles sont comptés pendant l’exécution ; le total final de session les réconcilie sans les ajouter deux fois. Les requêtes premium et crédits de facturation ne sont pas des tokens.

La CLI Copilot épinglée est 1.0.88. Entrée, sortie, lectures et écritures de cache conservent les compteurs rapportés par la CLI ; n’ajoutez pas le cache à l’entrée pour estimer une facture. Des champs manquants, fichiers illisibles ou une collecte interrompue produisent `usage.complete === false` et un avertissement explicite.

La collecte est bornée et peut se terminer après la consommation des tokens. Combinez un budget de tentatives avec un timeout de tâche ou un délai de dispatch ; voir [Budgets de consommation](../budgets/).

`mcpServers` transmet des [serveurs MCP](../mcp-servers/) avec `--additional-mcp-config` à chaque exécution.

API : [createCopilotHarness](../../reference/createcopilotharness/).
