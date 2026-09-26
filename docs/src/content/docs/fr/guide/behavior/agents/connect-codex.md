---
title: "Connecter son compte Codex"
description: "Connecter son compte Codex — Outpost"
sidebar:
  order: 4
---

Choisissez l’accès par compte ChatGPT (`account`) ou une clé API OpenAI (`usage`) avec l’option `authentication` de `codexHarness()`. Outpost ne transmet jamais la session du navigateur et ne lit jamais le trousseau système. Installez la CLI native sur l’hôte pour la connexion au compte ; les images générées la contiennent déjà. Le [manuel d’authentification](../../../manual/authentication/) donne le contrat complet pour chaque agent.

## Se connecter sur son ordinateur

Lancez `codex login`, terminez la connexion dans le navigateur, puis lancez `codex login status`. Sans navigateur, `codex login --device-auth` est disponible si le compte ou l’administrateur l’autorise. Voir [l’authentification OpenAI](https://developers.openai.com/codex/auth).

Pour les sandboxes, la connexion doit être enregistrée dans un fichier. Connectez-vous avec `codex -c cli_auth_credentials_store='"file"' login`, ou définissez `cli_auth_credentials_store = "file"` dans `~/.codex/config.toml` puis reconnectez-vous, si la politique l’autorise. Voir le [stockage des identifiants](https://developers.openai.com/codex/auth#credential-storage). La connexion se trouve alors dans `~/.codex/auth.json`, ou dans `$CODEX_HOME/auth.json` si `CODEX_HOME` est défini.

Avec `localSandboxProvider()`, Codex utilise directement la connexion de l’hôte et Outpost n’écrit rien sur l’hôte. Docker, Podman, Vercel, Daytona et Firecracker démarrent avec un home privé : la connexion de l’hôte n’y est visible qu’une fois préparée par `authentication`.

## Générer un workflow avec son abonnement

La connexion au compte est le choix par défaut lors de l’initialisation :

```sh
outpost init --agent codex --sandbox-provider docker --authentication account --repository /path/to/repository
```

Le `run.ts` généré contient `codexHarness({ authentication: "account" })` et ne lit lui-même aucun fichier d’identifiants. Avant le premier dispatch, Outpost lit le `auth.json` de l’hôte et en installe une copie privée dans le home de la sandbox avec le mode `0600`, via un installateur qui la reçoit sur stdin. Ce parcours fonctionne avec Docker, Podman, Vercel, Daytona et Firecracker ; adaptez `--sandbox-provider`. Il utilise votre forfait ChatGPT et ne nécessite pas de clé API OpenAI. Les identifiants d’allocation cloud restent nécessaires pour Vercel et Daytona.

Avec `--sandbox-provider local`, le workflow utilise directement la connexion existante sur l’hôte. Les limites du compte et l’accès aux modèles restent applicables. Outpost n’exporte jamais le trousseau système et ne copie pas les autres réglages Codex de l’hôte.

## Utiliser son compte ChatGPT dans un conteneur

Choisissez `account` sur le harness ; aucun volume ni hook n’est nécessaire :

```ts
import { agent, codexHarness, createSandbox } from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

await using sandbox = await createSandbox({
  agent: agent({ harness: codexHarness({ authentication: "account" }) }),
  sandboxProvider: dockerSandboxProvider(),
});
const result = await sandbox.dispatch({
  brief: { text: "Summarize the repository without changing files." },
  deadlineMs: 120_000,
});
console.log(result.text);
```

Remplacez le provider et son import par Podman ou un provider cloud si nécessaire. Pour une connexion conservée ailleurs, passez `{ account: { file: "/path/to/auth.json" } }`. Outpost prépare la connexion une fois par sandbox, avant le premier dispatch ou attachement de Codex ; les chemins de la sandbox restent ceux par défaut pour la capture native des conversations. Le dispatch appelle réellement le modèle.

Le rafraîchissement modifie la copie dans la sandbox, pas le fichier de l’hôte. Comme Codex peut renouveler son jeton de rafraîchissement, la connexion de l’hôte peut alors être révoquée. Donnez à Outpost une connexion dédiée, par exemple `CODEX_HOME=~/.outpost/accounts/codex codex -c cli_auth_credentials_store='"file"' login`, et choisissez `{ account: { file: "~/.outpost/accounts/codex/auth.json" } }`. Reconnectez-la si elle devient obsolète. Protégez le fichier comme un mot de passe, hors de Git et des logs.

## Alternative avec une clé API

Déclarez `OPENAI_API_KEY=` dans `.outpost/.env` et fournissez sa valeur par le processus parent ou le gestionnaire de secrets. Choisissez `usage` :

```ts
import { agent, codexHarness, createSandbox } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: agent({ harness: codexHarness({ authentication: "usage" }) }),
});
const result = await sandbox.dispatch({
  brief: { text: "Summarize the repository without changing files." },
  deadlineMs: 120_000,
});
console.log(result.text);
```

Avant le premier dispatch, Outpost lance `codex login --with-api-key` dans la sandbox avec la clé sur stdin, puis transmet `OPENAI_API_KEY` à chaque commande Codex. Pour lire la clé sous un autre nom, choisissez `{ usage: { variable: "TEAM_OPENAI_KEY" } }`. Avec le provider local, la commande de connexion n’est pas lancée : le `~/.codex/auth.json` de l’hôte n’est jamais écrasé. La clé utilise une facturation API distincte. Voir les [commandes de connexion](https://developers.openai.com/codex/cli/reference).

Un hook `sandboxReady` écrit à la main qui copie `auth.json` ou lance `codex login` n’est plus nécessaire ; supprimez-le lorsque vous choisissez `authentication`, pour ne pas préparer la connexion deux fois.

## Dépannage

Lisez d’abord l’erreur : un `auth.json` absent indique le chemin et la commande de connexion, et une clé absente produit `Missing OPENAI_API_KEY. Declare the selected credential explicitly.` Vérifiez une connexion conservée uniquement dans le trousseau, un `auth.json` invalide et les variables non déclarées. Codex n’a pas de forme à jeton de compte : `{ account: { key } }` et `{ account: { variable } }` sont rejetées dès la composition de l’agent. Une allocation réussie ne prouve pas que le modèle accepte l’identifiant ; seul un dispatch le vérifie. Les identifiants du provider ne connectent pas Codex.

Suite : [priorité des variables](../../../agents/environment/) ou [cookbooks](../../../cookbook/).

## Fournisseurs de modèles compatibles OpenAI

Utilisez un fournisseur personnalisé pour un service implémentant l’API OpenAI Responses, avec les réponses en streaming et les appels d’outils Codex. Les endpoints limités à Chat Completions ne sont pas pris en charge. Indiquez explicitement le modèle ; son nom et sa disponibilité dépendent du service.

```ts
import { agent, codexHarness, dispatch } from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const result = await dispatch({
  agent: agent({
    harness: codexHarness({
      modelProvider: {
        baseUrl: "https://models.example.com/v1",
        apiKeyEnvironment: "MODEL_API_KEY",
      },
      authentication: "usage",
    }),
    model: "vendor/model",
  }),
  sandboxProvider: dockerSandboxProvider({
    variables: { MODEL_API_KEY: process.env.MODEL_API_KEY ?? "" },
  }),
  brief: {
    text: "Inspect the repository and describe the next useful change.",
  },
});
console.log(result.text);
```

`apiKeyEnvironment` vaut `OPENAI_API_KEY` par défaut ; utilisez `false` uniquement pour un endpoint sans authentification, auquel cas aucune forme d’`authentication` n’est acceptée. Avec un fournisseur de modèles, seules `usage`, `usage.key` et `usage.variable` sont acceptées : elles renseignent la variable `apiKeyEnvironment` sans lancer `codex login`. Définissez le secret dans le processus parent et transmettez-le explicitement, ou déclarez-le dans `.outpost/.env` du dépôt. Outpost transmet le nom de variable à la configuration Codex, jamais la clé dans les arguments. La facturation relève du service choisi. Les URL ne peuvent contenir de credentials, paramètres de requête ou fragments. `localhost` désigne la sandbox : un serveur local doit être accessible depuis celle-ci.

Consultez les [fournisseurs personnalisés Codex](https://developers.openai.com/codex/config-advanced/#custom-model-providers). Les contrats de conversation native Codex et de sandbox restent applicables. Validez la compatibilité avec le service choisi ; la mention « compatible OpenAI » ne garantit pas Responses ni les outils.
