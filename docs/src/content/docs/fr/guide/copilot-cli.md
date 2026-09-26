---
title: "GitHub Copilot CLI"
description: "Utiliser un compte ou un jeton Copilot."
---

Utilisez `copilotHarness()` pour exécuter la CLI `copilot`. Cet adaptateur utilise l’accès au compte Copilot ; `authentication: "usage"` n’est pas pris en charge.

## Fournir un jeton

Utilisez un jeton à permissions fines avec la permission Copilot Requests. Les jetons classiques `ghp_` sont rejetés.

```ts
import { agent, copilotHarness } from "@elie-laloum/outpost";

const coder = agent({
  harness: copilotHarness({
    authentication: { account: { variable: "COPILOT_GITHUB_TOKEN" } },
    variables: { COPILOT_GITHUB_TOKEN: process.env.COPILOT_GITHUB_TOKEN ?? "" },
  }),
});
```

## Utiliser une connexion enregistrée

Lancez `copilot login` sur l’hôte et sélectionnez `authentication: "account"`. Outpost lit le jeton du dernier utilisateur connecté dans `~/.copilot/config.json`, ou sous `COPILOT_HOME`. Si le jeton est stocké uniquement dans un trousseau système, utilisez la variable explicite ci-dessus.

## Gestion des sessions

Chaque requête démarre une session neuve. La capture native des conversations, la reprise, le fork et les réparations automatiques ne sont pas disponibles. Plusieurs requêtes peuvent partager les fichiers d’une sandbox sans partager une conversation.

Voir le [démarrage CLI GitHub](https://docs.github.com/en/copilot/get-started/cli-quickstart) pour les conditions d’accès et de connexion Copilot.

API : [copilotHarness](../../reference/copilotharness/).
