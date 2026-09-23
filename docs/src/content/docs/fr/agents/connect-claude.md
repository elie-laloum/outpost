---
title: "Connecter son compte Claude Code"
description: "Connecter son compte Claude Code — Outpost"
sidebar:
  order: 5
---

Outpost lance la CLI native Claude Code et ne crée pas de compte supplémentaire. Installez-la sur l'hôte pour préparer la connexion ; les images générées l'incluent.

## Connexion locale

Lancez `claude` et suivez la connexion ; `/login` change de compte. Avec `local()`, les identifiants de l'hôte sont disponibles. Les conteneurs n'héritent pas du trousseau. Voir [l'authentification Claude](https://code.claude.com/docs/en/authentication).

## Jeton d'abonnement pour les sandboxes

Lancez `claude setup-token` sur votre ordinateur et terminez l'autorisation dans le navigateur. Stockez le résultat sous `CLAUDE_CODE_OAUTH_TOKEN` dans le gestionnaire de secrets ou le processus parent. Déclarez dans `.outpost/.env` :

```dotenv
CLAUDE_CODE_OAUTH_TOKEN=
```

La déclaration vide importe la variable du processus. Cette connexion native nécessite un abonnement éligible ; consultez la [référence CLI](https://code.claude.com/docs/en/cli-reference). Ne placez jamais le jeton dans un Dockerfile, un prompt, un argument ou un script versionné.

## Alternative avec une clé API

Déclarez plutôt `ANTHROPIC_API_KEY=` et fournissez cette variable. Choisissez une méthode : une clé API laissée définie peut sélectionner la facturation API au lieu de l'abonnement. Retirez les déclarations et variables inutilisées lors du changement.

## Vérifier et exécuter

```ts
import { createSandbox, claude } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({ agent: claude() });
const check = await sandbox.command({
  executable: "sh",
  arguments: [
    "-c",
    'test -n "$CLAUDE_CODE_OAUTH_TOKEN" || test -n "$ANTHROPIC_API_KEY"',
  ],
});
if (check.status !== 0)
  throw new Error("Declare a Claude credential in .outpost/.env");
const result = await sandbox.dispatch({
  brief: { text: "Summarize the repository without changing files." },
  deadlineMs: 120_000,
});
console.log(result.text);
```

Le premier contrôle vérifie seulement la présence. Le dispatch appelle réellement le modèle, avec ses limites ou sa facturation, et remonte un identifiant refusé comme erreur de CLI.

## Garder un home cohérent

Le home est entièrement éphémère par défaut : `~/.claude.json` et `~/.claude/` partagent sa durée de vie. Préférez le jeton au montage d'un seul `~/.claude` persistant dans un home vide, qui sépare configuration, sauvegardes et sessions.

La [capture des conversations](../conversations/) conserve les transcriptions, pas tout le home ni la connexion. Les identifiants Vercel/Daytona créent une sandbox sans connecter Claude.

## Dépannage

Si l'hôte fonctionne mais pas la sandbox, vérifiez `.outpost/.env`, les surcharges provider/adapter, la connectivité et l'expiration des identifiants. N'affichez pas les secrets pour déboguer. Recréez les sandboxes après modification de l'authentification. Suite : [priorité des variables](../environment/) ou [cookbooks](../../cookbooks/).
