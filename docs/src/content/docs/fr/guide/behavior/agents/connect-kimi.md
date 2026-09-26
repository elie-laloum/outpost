---
title: "Connecter Kimi Code"
description: "Authentifier Kimi Code avec une connexion de l’hôte ou une clé API Moonshot, et lancer de nouvelles sessions Kimi."
sidebar:
  order: 5.3
---

`agent({ harness: kimiHarness() })` exécute Kimi Code, `kimi`, avec les mêmes fournisseurs de sandbox que les autres adaptateurs. Chaque exécution démarre une session neuve.

## Installer la CLI

Les images générées par `outpost init` installent le paquet `@moonshot-ai/kimi-code` à la version fixée, avec Claude Code, Codex et Copilot. Les fournisseurs distants installent au besoin la même version dans `~/.outpost-tools`, sauf avec `bootstrap: false`. Pour `localSandboxProvider()`, installez vous-même `@moonshot-ai/kimi-code` sur l’hôte. `agentVersions.kimi` indique la version de référence fixée.

Outpost définit `KIMI_CODE_NO_AUTO_UPDATE=1` pour chaque commande `kimi`, afin que la CLI ne se remplace pas pendant une exécution. Une valeur fournie dans les `variables` du harness la remplace.

## S’authentifier

Sélectionnez explicitement l’authentification avec l’option `authentication` du harness. Sans elle, Outpost ne prépare rien et `kimi` utilise ce que l’environnement de la sandbox fournit déjà. Kimi Code accepte `account`, `account.file`, `usage`, `usage.key` et `usage.variable`. Consultez le [manuel d’authentification](../../../manual/authentication/) pour les formes communes à tous les agents.

### Compte Kimi Code

```ts
import { agent as composeAgent, kimiHarness } from "@elie-laloum/outpost";

const login = composeAgent({
  harness: kimiHarness({ authentication: "account" }),
});
const dedicated = composeAgent({
  harness: kimiHarness({
    authentication: { account: { file: "~/.outpost/accounts/kimi" } },
  }),
});
console.log(login.name, dedicated.name);
```

Lancez `kimi login` sur l’hôte et terminez son parcours par code d’appareil. `account` lit le profil situé dans `KIMI_CODE_HOME`, sinon dans `~/.kimi-code`. Contrairement aux autres agents, `account.file` désigne un **répertoire** de profil, et non un fichier unique. Outpost lit deux fichiers du profil, `credentials/kimi-code.json` et `device_id`, chacun devant être un fichier ordinaire d’au plus 1 Mio ; les liens symboliques et les répertoires sont refusés, et le contenu des fichiers n’apparaît jamais dans les erreurs. Un fichier absent échoue avec son chemin et suggère `kimi login` ou `usage` avec `KIMI_API_KEY` et un modèle.

Avec Docker, Podman, Vercel, Daytona et Firecracker, Outpost écrit les deux fichiers dans `~/.kimi-code` du home privé de la sandbox avec le mode `0600`, puis lance `kimi login` dans la sandbox, avec une limite de 120 secondes. Comme un jeton existe déjà, cette connexion le rafraîchit si nécessaire et régénère `config.toml` avec le fournisseur Kimi Code géré, son catalogue de modèles et son modèle par défaut, comme le ferait une connexion sur l’hôte. La connexion dans la sandbox utilise la région par défaut de la CLI. Les comptes connectés avec `kimi login --region global` n’ont pas été validés en sandbox.

Avec `localSandboxProvider()`, Outpost ne copie rien et ne lance aucune commande de connexion : `kimi` utilise son propre profil de l’hôte pour `account` et `account.file`.

En mode compte, `model` sur `agent()` est facultatif et transmis avec `--model`. Il doit s’agir d’un alias de modèle de votre configuration Kimi, comme `kimi-code/<id>`.

### Clé API Moonshot

```ts
import { agent as composeAgent, kimiHarness } from "@elie-laloum/outpost";

const model = process.env.KIMI_MODEL;
if (!model) throw new Error("Set KIMI_MODEL to a Moonshot platform model");
const declared = composeAgent({
  harness: kimiHarness({ authentication: "usage" }),
  model,
});
const team = composeAgent({
  harness: kimiHarness({
    authentication: { usage: { variable: "TEAM_KIMI_API_KEY" } },
  }),
  model,
});
console.log(declared.name, team.name);
```

`usage` lit `KIMI_API_KEY` dans les variables résolues du workflow : les `variables` du harness, les `variables` du fournisseur de sandbox et les déclarations du fichier `.outpost/.env` du dépôt. `usage.variable` lit une autre variable déclarée, et `usage.key` reçoit une clé littérale, à garder hors du code versionné. Une variable absente échoue lors de la préparation de la sandbox avec `Missing KIMI_API_KEY. Declare the selected credential explicitly.`

L’authentification par clé API **exige** un modèle sur `agent()` ; sans modèle, la composition échoue avec `Kimi Code usage authentication requires a model name on agent()`. Outpost configure Kimi uniquement par variables d’environnement : `KIMI_MODEL_API_KEY` reçoit la clé, `KIMI_MODEL_PROVIDER_TYPE` vaut `kimi` et `KIMI_MODEL_NAME` contient le nom du modèle. `--model` n’est pas transmis dans ce mode. Kimi utilise alors le point d’accès de la plateforme Moonshot, `https://api.moonshot.ai/v1` ; définissez `KIMI_MODEL_BASE_URL` dans les `variables` du harness pour en utiliser un autre. Les mêmes variables sont transmises avec le fournisseur local. La consommation API est facturée au compte de la plateforme Moonshot, indépendamment des abonnements Kimi Code.

### Formes non prises en charge et rotation des jetons

Kimi Code n’a pas de jeton de compte à longue durée de vie : `{ account: { key } }` et `{ account: { variable } }` échouent lors de la composition de l’agent avec `Kimi Code does not support account.key authentication. Accepted forms: account, account.file, usage, usage.key, usage.variable`. Les structures invalides, les valeurs vides et les noms de variable invalides échouent de la même façon.

La connexion dans la sandbox peut rafraîchir la session et faire tourner son jeton de rafraîchissement, ce qui peut invalider la copie de l’hôte et déconnecter l’hôte. Conservez un profil dédié, utilisé uniquement par Outpost, connectez-le avec `KIMI_CODE_HOME` pointant vers lui, et sélectionnez-le avec `account.file`, par exemple `~/.outpost/accounts/kimi`. Ne partagez pas un même profil entre des sandboxes parallèles qui le rafraîchissent indépendamment.

## Configurer l’exécution

```ts
import {
  agent as composeAgent,
  dispatch,
  kimiHarness,
} from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const key = process.env.KIMI_API_KEY;
const model = process.env.KIMI_MODEL;
if (!key || !model)
  throw new Error("Supply KIMI_API_KEY and KIMI_MODEL before running");
const result = await dispatch({
  repository: "/path/to/repository",
  agent: composeAgent({
    harness: kimiHarness({
      authentication: "usage",
      variables: { KIMI_API_KEY: key },
    }),
    model,
  }),
  sandboxProvider: dockerSandboxProvider(),
  branch: { mode: "named", name: "kimi-review" },
  brief: { text: "Review the repository and report your findings." },
});
console.log(result.text);
```

Construisez l’image générée avant cet exemple. `model` n’accepte qu’un nom de modèle ; `reasoning` et `maxOutputTokens` sont refusés lors de la composition de l’agent.

Une exécution sans interface lance :

```sh
kimi [--model MODEL] --prompt TEXT --output-format stream-json
```

Kimi n’a pas de canal stdin pour le prompt : le prompt est donc un argument de commande. Les systèmes d’exploitation limitent la taille des arguments, à environ 128 Kio pour un argument unique sous Linux, et un prompt plus grand empêche le démarrage : gardez le contexte volumineux dans des fichiers du dépôt que l’agent lit. Comme tout argument, le prompt est visible par les processus capables de lister ceux de la sandbox. `--yolo` n’est pas transmis, car Kimi le refuse avec `--prompt` ; le mode prompt s’exécute déjà sans demander d’approbation, si bien que les outils s’exécutent de façon autonome dans la sandbox sélectionnée. Sélectionnez uniquement des dépôts dont la configuration est digne de confiance. Le fournisseur Outpost assure l’isolation ; `localSandboxProvider()` reste sans isolation.

Les sessions interactives lancent `kimi [--model MODEL]` dans l’interface terminal de la CLI. Kimi n’y accepte aucun prompt initial : une requête interactive avec un texte initial échoue avec `Kimi Code starts interactive sessions without an initial prompt`. Elles nécessitent un fournisseur prenant en charge les terminaux interactifs, comme Docker, Podman ou l’exécution locale. Consultez les [sessions interactives](../../../environment/commands/).

## Sortie et échecs

Les événements sont décodés selon leur champ `role`. Les enregistrements `assistant` deviennent des observations textuelles à partir de `content` et des observations d’outils à partir de `tool_calls`, avec le nom de la fonction, ses `arguments` interprétés en JSON lorsque c’est possible et l’`id` de l’appel. Les enregistrements `meta` de type `session.resume_hint` indiquent l’identifiant de session, et ceux de type `turn.step.retrying` deviennent des avertissements non fatals. Les autres enregistrements restent disponibles dans les observations brutes.

Kimi n’émet aucun événement de résultat final : le code de sortie de la CLI détermine donc l’issue. Un code zéro réussit, un code non nul fait échouer l’exécution.

## Consommation et limites des sessions

La sortie de Kimi ne communique aucun décompte de tokens : `result.usage` reste à zéro. Suivez la consommation dans votre compte Kimi Code ou de la plateforme Moonshot.

Les sessions Kimi sont uniquement des sessions neuves. L’identifiant de session émis est informatif : Outpost ne capture, déplace, restaure, reprend ni ne bifurque les conversations Kimi. `result.resume()`, `result.fork()` et les continuations explicites échouent avec `Kimi Code does not support continuation or fork in Outpost`, y compris dans une sandbox réutilisée. Les passes supplémentaires démarrent de nouvelles sessions. Les réponses structurées fonctionnent avec `repairs: 0` ; la réparation automatique nécessite une continuation et est refusée. La reprise de session est prévue ; consultez la [feuille de route](../../../../project/roadmap/).

## Diagnostiquer l’installation

Inspectez la CLI installée sans appel au modèle ni identifiants :

```sh
npx @elie-laloum/outpost doctor --sandbox-provider docker --agent kimi
```

La vérification lance `kimi --version`, dont le résultat est présenté à côté de la version de référence fixée, et `kimi --help`, qui doit identifier la commande et déclarer les options utilisées par Outpost. Elle n’authentifie aucun compte et ne prouve pas le comportement d’un modèle réel.
