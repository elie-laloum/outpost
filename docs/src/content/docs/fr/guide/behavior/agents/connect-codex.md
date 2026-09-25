---
title: "Connecter son compte Codex"
description: "Connecter son compte Codex — Outpost"
sidebar:
  order: 4
---

Choisissez le compte ChatGPT ou une clé API. Outpost ne transmet ni la session du navigateur ni le trousseau système. Installez la CLI native sur l'hôte pour la connexion locale ; les images générées la contiennent déjà.

## Se connecter sur son ordinateur

Lancez `codex login`, terminez la connexion dans le navigateur, puis lancez `codex login status`. Sans navigateur, `codex login --device-auth` est disponible si le compte ou l'administrateur l'autorise. Voir [l'authentification OpenAI](https://developers.openai.com/codex/auth).

Avec `localSandboxProvider()`, Codex utilise les identifiants de l'hôte. Docker/Podman démarrent avec un home privé : la connexion locale ne suffit pas.

## Générer un workflow avec son abonnement

Sélectionnez la connexion au compte lors de l’initialisation :

```sh
outpost init --agent codex --sandbox-provider docker --authentication login --repository /path/to/repository
```

Connectez-vous sur l’hôte avec le stockage des identifiants dans un fichier, comme indiqué ci-dessous. Le workflow généré lit `auth.json` dans `CODEX_HOME` (ou `~/.codex`) et transmet une copie par stdin dans le home privé de la sandbox avec le mode `0600`. Ce parcours fonctionne avec Docker, Podman, Vercel et Daytona ; adaptez `--sandbox-provider`. Il utilise votre accès par compte ChatGPT et ne nécessite pas de clé API OpenAI. Les identifiants d’allocation cloud restent nécessaires pour Vercel et Daytona.

Avec `--sandbox-provider local`, le workflow utilise directement la connexion existante sur l’hôte. Les limites du compte et l’accès aux modèles restent applicables. Le workflow généré n’exporte ni le trousseau système ni les autres réglages Codex de l’hôte.

## Utiliser son compte ChatGPT dans un conteneur

Cette recette nécessite `~/.codex/auth.json`. Si les identifiants sont dans le trousseau, sélectionnez `cli_auth_credentials_store = "file"` dans `~/.codex/config.toml` et reconnectez-vous, si la politique l'autorise. Voir le [stockage des identifiants](https://developers.openai.com/codex/auth#credential-storage).

Montez une source d'identifiants en lecture seule, puis copiez-la dans le home éphémère inscriptible :

```ts
import {
  agent as composeAgent,
  createSandbox,
  codex,
} from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

await using sandbox = await createSandbox({
  agent: composeAgent({ harness: codex.harness({}) }),
  sandboxProvider: dockerSandboxProvider({
    volumes: [
      {
        source: "~/.codex/auth.json",
        target: "~/.outpost-auth/codex.json",
        readOnly: true,
      },
    ],
  }),
  hooks: {
    sandboxReady: [
      {
        executable: "sh",
        arguments: [
          "-c",
          'mkdir -p "$HOME/.codex" && cp "$HOME/.outpost-auth/codex.json" "$HOME/.codex/auth.json" && chmod 600 "$HOME/.codex/auth.json"',
        ],
      },
    ],
  },
});
const status = await sandbox.command({
  executable: "codex",
  arguments: ["login", "status"],
});
if (status.status !== 0) throw new Error(status.stderr);
console.log("Codex authentication is ready");
```

Remplacez le provider et son import par Podman si nécessaire. Adaptez la source pour un `CODEX_HOME` local personnalisé ; conservez les chemins par défaut dans la sandbox pour la capture native. Ajoutez `sandbox.dispatch(...)` après la vérification pour lancer un agent.

Le rafraîchissement modifie la copie dans la sandbox, pas la source locale. Reconnectez la source si elle expire. Ne partagez pas un fichier d'authentification inscriptible entre sandboxes parallèles. Protégez-le comme un mot de passe, hors de Git et des logs.

## Alternative avec une clé API

Déclarez `OPENAI_API_KEY=` dans `.outpost/.env` et fournissez sa valeur par le processus parent ou le gestionnaire de secrets. Initialisez la CLI native par stdin :

```ts
import {
  agent as composeAgent,
  createSandbox,
  codex,
} from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: composeAgent({ harness: codex.harness({}) }),
  hooks: {
    sandboxReady: [
      {
        executable: "sh",
        arguments: [
          "-c",
          'test -n "$OPENAI_API_KEY" && printenv OPENAI_API_KEY | codex login --with-api-key',
        ],
      },
    ],
  },
});
console.log(
  (
    await sandbox.command({
      executable: "codex",
      arguments: ["login", "status"],
    })
  ).status,
);
```

Le hook s'exécute une fois par sandbox. Gardez les étapes dépendantes dans la même commande : les hooks s'exécutent en parallèle. La clé utilise une facturation API distincte. Voir les [commandes de connexion](https://developers.openai.com/codex/cli/reference).

## Dépannage

Lancez `codex login status` dans la sandbox. Vérifiez les fichiers absents ou expirés, le stockage uniquement dans le trousseau et les variables non déclarées. Ces exemples vérifient la connexion ; un dispatch appelle le modèle. Pour les providers cloud, générez un workflow avec `--authentication login` afin de copier la source d’identifiants du compte, ou utilisez le hook de clé API avec des variables explicites. Les montages locaux concernent Docker/Podman. Les identifiants du provider ne connectent pas Codex.

Suite : [priorité des variables](../../../agents/environment/) ou [cookbooks](../../../cookbook/).

## Fournisseurs de modèles compatibles OpenAI

Utilisez un fournisseur personnalisé pour un service implémentant l’API OpenAI Responses, avec les réponses en streaming et les appels d’outils Codex. Les endpoints limités à Chat Completions ne sont pas pris en charge. Indiquez explicitement le modèle ; son nom et sa disponibilité dépendent du service.

```ts
import { agent as composeAgent, codex, dispatch } from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const result = await dispatch({
  agent: composeAgent({
    harness: codex.harness({
      modelProvider: {
        baseUrl: "https://models.example.com/v1",
        apiKeyEnvironment: "MODEL_API_KEY",
      },
      variables: { MODEL_API_KEY: process.env.MODEL_API_KEY! },
    }),
    model: "vendor/model",
  }),
  sandboxProvider: dockerSandboxProvider(),
  brief: {
    text: "Inspect the repository and describe the next useful change.",
  },
});
console.log(result.text);
```

`apiKeyEnvironment` vaut `OPENAI_API_KEY` par défaut ; utilisez `false` uniquement pour un endpoint sans authentification. Définissez le secret dans le processus parent et transmettez-le explicitement, ou déclarez-le dans `.outpost/.env` du dépôt. Outpost transmet le nom de variable à la configuration Codex, jamais la clé dans les arguments. Ce fournisseur ne nécessite pas `codex login` ; la facturation relève du service choisi. Les URL ne peuvent contenir de credentials, paramètres de requête ou fragments. `localhost` désigne le sandbox : un serveur local doit être accessible depuis celui-ci.

Consultez les [fournisseurs personnalisés Codex](https://developers.openai.com/codex/config-advanced/#custom-model-providers). Les contrats de conversation native Codex et de sandbox restent applicables. Validez la compatibilité avec le service choisi ; la mention « compatible OpenAI » ne garantit pas Responses ni les outils.
