---
title: "Connecter GitHub Copilot CLI"
description: "Authentifier GitHub Copilot CLI avec une connexion de l’hôte ou un jeton GitHub, et lancer de nouvelles sessions Copilot."
sidebar:
  order: 5.2
---

`agent({ harness: copilotHarness() })` exécute GitHub Copilot CLI, `copilot`, avec les mêmes fournisseurs de sandbox que les autres adaptateurs. Chaque exécution démarre une session neuve, et les requêtes sont décomptées des requêtes premium de votre abonnement GitHub Copilot.

## Installer la CLI

Les images générées par `outpost init` installent le paquet `@github/copilot` à la version fixée, avec Claude Code, Codex, Kimi Code et Antigravity. Les fournisseurs distants installent au besoin la même version dans `~/.outpost-tools`, sauf avec `bootstrap: false`. Pour `localSandboxProvider()`, installez vous-même `@github/copilot` sur l’hôte. `agentVersions.copilot` indique la version de référence fixée.

Outpost définit `COPILOT_AUTO_UPDATE=false` pour chaque commande `copilot`, afin que la CLI ne se remplace pas pendant une exécution. Une valeur fournie dans les `variables` du harness la remplace.

## S’authentifier

Sélectionnez explicitement l’authentification avec l’option `authentication` du harness. Sans elle, Outpost ne prépare rien et `copilot` utilise ce que l’environnement de la sandbox fournit déjà. Copilot accepte `account`, `account.file`, `account.key` et `account.variable`. Consultez le [manuel d’authentification](../../../manual/authentication/) pour les formes communes à tous les agents, et l’[authentification de Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/authenticate-copilot-cli) de GitHub pour les types de jetons.

### Connexion de l’hôte

```ts
import { agent as composeAgent, copilotHarness } from "@elie-laloum/outpost";

const login = composeAgent({
  harness: copilotHarness({ authentication: "account" }),
});
const dedicated = composeAgent({
  harness: copilotHarness({
    authentication: { account: { file: "~/.outpost/accounts/copilot.json" } },
  }),
});
console.log(login.name, dedicated.name);
```

Lancez `copilot login` sur l’hôte. `account` lit `config.json` dans `COPILOT_HOME`, sinon dans `~/.copilot` ; `account.file` lit un autre fichier au même format. Les commentaires et les virgules finales sont acceptés. Outpost extrait uniquement le jeton enregistré dans `authTokens` pour l’hôte et l’identifiant de `lastLoggedInUser`, puis le transmet à chaque commande `copilot` sous `COPILOT_GITHUB_TOKEN` ; aucun fichier n’est copié dans la sandbox. Ce parcours fonctionne avec Docker, Podman, Vercel, Daytona et Firecracker. Outpost ne lit que des fichiers ordinaires d’au plus 1 Mio ; les liens symboliques et les répertoires sont refusés, et le contenu des fichiers n’apparaît jamais dans les erreurs.

Par défaut, Copilot conserve son jeton dans le trousseau système et ne l’écrit en clair dans `config.json` que si aucun trousseau n’est disponible ou si `storeTokenPlaintext` vaut `true`. Outpost ne lit jamais de trousseau système. Si `config.json` ne contient aucun jeton pour le dernier utilisateur connecté, la préparation échoue et propose de passer `{ account: { variable: "COPILOT_GITHUB_TOKEN" } }` à la place.

Avec `localSandboxProvider()`, Outpost ne lit aucun fichier de l’hôte : `copilot` utilise sa propre connexion de l’hôte pour `account` et `account.file`, y compris une connexion conservée dans le trousseau, que la CLI lit elle-même.

### Jeton GitHub

```ts
import { agent as composeAgent, copilotHarness } from "@elie-laloum/outpost";

const declared = composeAgent({
  harness: copilotHarness({
    authentication: { account: { variable: "COPILOT_GITHUB_TOKEN" } },
  }),
});
const team = composeAgent({
  harness: copilotHarness({
    authentication: { account: { variable: "TEAM_COPILOT_TOKEN" } },
  }),
});
console.log(declared.name, team.name);
```

`account.variable` lit la variable nommée dans les variables résolues du workflow : les `variables` du harness, les `variables` du fournisseur de sandbox et les déclarations du fichier `.outpost/.env` du dépôt. `account.key` reçoit un jeton littéral, à garder hors du code versionné. Dans les deux cas, Outpost transmet le jeton sous `COPILOT_GITHUB_TOKEN`, que Copilot consulte avant `GH_TOKEN` et `GITHUB_TOKEN`. Une variable absente échoue lors de la préparation de la sandbox avec `Missing TEAM_COPILOT_TOKEN. Declare the selected credential explicitly.` Avec le fournisseur local, cette variable est transmise et remplace la connexion de l’hôte.

Utilisez un jeton d’accès personnel à granularité fine doté de la permission **Copilot Requests**, ou un jeton OAuth (`gho_` ou `ghu_`). Copilot CLI ne prend pas en charge les jetons d’accès personnels classiques : Outpost refuse un jeton `ghp_` lors de la composition de l’agent pour `account.key`, et lors de la préparation de la sandbox pour `account.variable` ou pour un jeton lu dans `config.json`.

### Formes non prises en charge et durée de vie des jetons

Copilot n’a pas de facturation par clé API : `"usage"`, `{ usage: { key } }` et `{ usage: { variable } }` échouent lors de la composition de l’agent avec `GitHub Copilot CLI does not support usage authentication. Accepted forms: account, account.file, account.key, account.variable`. Les structures invalides, les valeurs vides et les noms de variable invalides échouent de la même façon.

`account` transmet le jeton OAuth actuel de l’hôte ; aucun jeton de rafraîchissement n’est copié. Si vous vous déconnectez sur l’hôte ou si le jeton est révoqué, les sandboxes qui l’utilisent échouent aussi. Pour une automatisation de longue durée, préférez un jeton d’accès personnel à granularité fine dédié à Outpost, que vous pouvez renouveler et révoquer indépendamment de votre connexion interactive.

## Configurer l’exécution

```ts
import {
  agent as composeAgent,
  copilotHarness,
  dispatch,
} from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const token = process.env.COPILOT_GITHUB_TOKEN;
if (!token)
  throw new Error("Supply COPILOT_GITHUB_TOKEN before running this workflow");
const result = await dispatch({
  repository: "/path/to/repository",
  agent: composeAgent({
    harness: copilotHarness({
      authentication: { account: { variable: "COPILOT_GITHUB_TOKEN" } },
      variables: { COPILOT_GITHUB_TOKEN: token },
    }),
  }),
  sandboxProvider: dockerSandboxProvider(),
  branch: { mode: "named", name: "copilot-review" },
  brief: { text: "Review the repository and report your findings." },
});
console.log(result.text);
```

Construisez l’image générée avant cet exemple. `model` sur `agent()` accepte un nom de modèle disponible avec votre abonnement Copilot et le transmet avec `--model` ; `reasoning` et `maxOutputTokens` sont refusés lors de la composition de l’agent.

Une exécution sans interface lance la commande suivante, avec le prompt sur stdin :

```sh
copilot [--model MODEL] --output-format json --allow-all --no-ask-user
```

`--allow-all` autorise tous les outils, chemins et URL dans la sandbox sélectionnée, et `--no-ask-user` empêche les questions qui attendraient une saisie au terminal. Sélectionnez uniquement des dépôts dont la configuration est digne de confiance. Le fournisseur Outpost assure l’isolation ; `localSandboxProvider()` reste sans isolation.

Les sessions interactives lancent `copilot [--model MODEL] [--interactive TEXT]` dans l’interface terminal de la CLI, où Copilot demande ses approbations habituelles. Elles nécessitent un fournisseur prenant en charge les terminaux interactifs, comme Docker, Podman ou l’exécution locale. Consultez les [sessions interactives](../../../environment/commands/).

## Sortie et échecs

Les événements sont décodés selon leur champ `type`. Les enregistrements `assistant.message` deviennent des observations textuelles à partir de `data.content` et des observations d’outils à partir de `data.toolRequests`, avec `name`, `arguments` et `toolCallId`. Les enregistrements `session.error` deviennent des avertissements non fatals. Les autres enregistrements restent disponibles dans les observations brutes.

L’enregistrement final `result` indique l’identifiant de session et détermine l’issue : il réussit avec `exitCode: 0` et échoue avec tout autre code de sortie ou avec `outcome: "blocked"`. Un code de sortie non nul de la CLI fait aussi échouer l’exécution. Un résultat final est obligatoire : un code zéro sans résultat final échoue, si bien qu’une sortie tronquée ne peut pas réussir silencieusement.

## Consommation et limites des sessions

Copilot facture des requêtes premium sur votre abonnement GitHub, et non des tokens, et sa sortie ne communique aucun décompte de tokens : `result.usage` reste à zéro. Suivez la consommation dans les réglages GitHub Copilot.

Les sessions Copilot sont uniquement des sessions neuves. L’identifiant de session émis est informatif : Outpost ne capture, déplace, restaure, reprend ni ne bifurque les conversations Copilot. `result.resume()`, `result.fork()` et les continuations explicites échouent avec `GitHub Copilot CLI does not support continuation or fork in Outpost`, y compris dans une sandbox réutilisée. Les passes supplémentaires démarrent de nouvelles sessions. Les réponses structurées fonctionnent avec `repairs: 0` ; la réparation automatique nécessite une continuation et est refusée. La reprise de session est prévue ; consultez la [feuille de route](../../../../project/roadmap/).

## Diagnostiquer l’installation

Inspectez la CLI installée sans appel au modèle ni identifiants :

```sh
npx @elie-laloum/outpost doctor --sandbox-provider docker --agent copilot
```

La vérification lance `copilot --version`, dont le résultat est présenté à côté de la version de référence fixée, et `copilot --help`, qui doit identifier la commande et déclarer les options utilisées par Outpost. Elle n’authentifie aucun compte et ne prouve pas le comportement d’un modèle réel.
