---
title: "Accès compte et API"
description: "Sélectionner explicitement les identifiants de chaque agent."
---

Définissez `authentication` sur le harness CLI. `account` utilise une connexion CLI ou un jeton d’abonnement. `usage` utilise une clé API avec facturation API. La sélection n’est jamais automatique.

## Utiliser une clé API

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createCodexHarness({
    authentication: "usage",
    variables: { OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "" },
  }),
});
```

Le harness reçoit uniquement les variables fournies. Pour un autre nom de variable, utilisez `authentication: { usage: { variable: "TEAM_OPENAI_KEY" } }` et transmettez cette variable. `{ usage: { key } }` accepte une valeur déjà chargée par votre application.

## Utiliser un compte

`authentication: "account"` sélectionne le fichier de connexion propre à l’agent sur l’hôte. `{ account: { file: "/absolute/profile/path" } }` sélectionne un fichier dédié ; Kimi attend un dossier de profil. [Claude](../claude-code/) et [Copilot](../copilot-cli/) acceptent aussi `{ account: { variable: "TOKEN_NAME" } }`.

Outpost ne lit jamais un trousseau système. Une sandbox isolée reçoit une copie privée des identifiants ; l’exécution locale utilise la session de l’hôte et reçoit uniquement les variables d’authentification. Un rafraîchissement de jeton dans la sandbox peut invalider la connexion initiale : utilisez un profil séparé pour l’automatisation si nécessaire.

## Séparer les identifiants

Les identifiants d’allocation cloud appartiennent au client du fournisseur sur l’hôte. Ceux de l’agent appartiennent au harness. Ceux du stockage appartiennent au client du transport. Un identifiant Vercel ou S3 n’authentifie pas Codex.

Dans un projet généré, déclarez les variables autorisées dans le fichier `.env` ignoré par Git. Une déclaration vide hérite de la variable du processus ; les secrets non déclarés de l’hôte ne sont pas transmis. Voir [Valeurs d’environnement](../environment-values/).

API : [AgentAuthentication](../../reference/agentauthentication/).
