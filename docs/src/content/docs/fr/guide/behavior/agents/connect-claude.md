---
title: "Connecter son compte Claude Code"
description: "Connecter son compte Claude Code — Outpost"
sidebar:
  order: 5
---

Outpost lance la CLI native Claude Code et ne crée pas de compte supplémentaire. Choisissez un identifiant avec l’option `authentication` de `claudeHarness()` : les formes `account` utilisent votre abonnement Claude, les formes `usage` facturent une clé API Anthropic. Installez la CLI sur l’hôte pour préparer la connexion ; les images générées l’incluent. Le [manuel d’authentification](../../../manual/authentication/) donne le contrat complet.

## Connexion locale

Lancez `claude` et suivez la connexion ; `/login` change de compte. Avec `localSandboxProvider()`, Claude utilise directement cette connexion de l’hôte et Outpost n’écrit rien sur l’hôte. Voir [l’authentification Claude](https://code.claude.com/docs/en/authentication).

Sous Linux et Windows, la connexion est enregistrée dans `~/.claude/.credentials.json` (ou `$CLAUDE_CONFIG_DIR/.credentials.json`). Choisissez `claudeHarness({ authentication: "account" })` : Outpost en installe une copie privée dans le home de la sandbox avant le premier dispatch, en ne conservant que l’entrée d’abonnement `claudeAiOauth` ; les autres entrées, comme les jetons OAuth MCP, restent sur l’hôte. `{ account: { file } }` lit le même format depuis un autre chemin.

Sur macOS, Claude Code conserve sa connexion dans le trousseau, qu’Outpost ne lit jamais. Utilisez alors le jeton d’abonnement ci-dessous. Les conteneurs n’héritent jamais d’un trousseau de l’hôte.

Claude peut renouveler son jeton de rafraîchissement lorsque la copie de la sandbox se rafraîchit, ce qui peut déconnecter l’hôte. Gardez une connexion dédiée à Outpost là où le stockage fichier est disponible : `CLAUDE_CONFIG_DIR=~/.outpost/accounts/claude claude`, puis `/login`, et choisissez `{ account: { file: "~/.outpost/accounts/claude/.credentials.json" } }`.

## Jeton d'abonnement pour les sandboxes

Lancez `claude setup-token` sur votre ordinateur et terminez l’autorisation dans le navigateur. Stockez le résultat sous `CLAUDE_CODE_OAUTH_TOKEN` dans le gestionnaire de secrets ou le processus parent. Déclarez dans `.outpost/.env` :

```dotenv
CLAUDE_CODE_OAUTH_TOKEN=
```

La déclaration vide importe la variable du processus. Choisissez `{ account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } }`, ou un autre nom de variable contenant le jeton ; Outpost transmet sa valeur à Claude sous `CLAUDE_CODE_OAUTH_TOKEN`. Cette connexion native nécessite un abonnement éligible ; consultez la [référence CLI](https://code.claude.com/docs/en/cli-reference). Ne placez jamais le jeton dans un Dockerfile, un prompt, un argument ou un script versionné.

## Alternative avec une clé API

Déclarez plutôt `ANTHROPIC_API_KEY=`, fournissez cette variable et choisissez `usage`, ou `{ usage: { variable: "TEAM_ANTHROPIC_KEY" } }` pour un autre nom. Claude Code donne priorité à une clé API sur un abonnement ; Outpost rejette donc la combinaison : une forme de compte échoue tant que `ANTHROPIC_API_KEY` est déclarée, et une forme d’usage échoue tant que `CLAUDE_CODE_OAUTH_TOKEN` est déclarée. Retirez les déclarations et variables inutilisées lors du changement.

## Vérifier et exécuter

```ts
import { agent, claudeHarness, createSandbox } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: agent({
    harness: claudeHarness({
      authentication: { account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } },
    }),
  }),
});
const result = await sandbox.dispatch({
  brief: { text: "Summarize the repository without changing files." },
  deadlineMs: 120_000,
});
console.log(result.text);
```

Avant le démarrage de la CLI, Outpost vérifie l’identifiant choisi : un jeton non déclaré échoue avec `Missing CLAUDE_CODE_OAUTH_TOKEN. Declare the selected credential explicitly.`, et une `ANTHROPIC_API_KEY` déclarée échoue comme conflit. Le dispatch appelle ensuite réellement le modèle, avec ses limites ou sa facturation, et remonte un identifiant refusé comme erreur de CLI.

## Garder un home cohérent

Le home est entièrement éphémère par défaut : `~/.claude.json` et `~/.claude/` partagent sa durée de vie. Préférez l’option intégrée `authentication` au montage d’un seul `~/.claude` persistant dans un home vide, qui sépare configuration, sauvegardes et sessions.

La [capture des conversations](../../../agents/conversations/) conserve les transcriptions, pas tout le home ni la connexion. Les identifiants Vercel/Daytona créent une sandbox sans connecter Claude.

## Dépannage

Si l’hôte fonctionne mais pas la sandbox, lisez l’erreur : elle cite une variable manquante, un chemin `.credentials.json` absent avec la commande de connexion, un fichier sans `claudeAiOauth` ou des identifiants concurrents. Vérifiez ensuite `.outpost/.env`, les variables du provider et du harness, une connexion conservée uniquement dans le trousseau, la connectivité et l’expiration des identifiants. N’affichez pas les secrets pour déboguer. Recréez les sandboxes après modification de l’authentification. Suite : [priorité des variables](../../../agents/environment/) ou [cookbooks](../../../cookbook/).
