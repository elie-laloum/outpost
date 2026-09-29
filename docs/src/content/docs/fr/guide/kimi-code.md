---
title: "Kimi Code"
description: "Connecter Kimi Code à une sandbox Outpost."
---

Utilisez `createKimiHarness()` avec un [environnement d’exécution](../execution-backends/) pris en charge. Installez la CLI dans votre image ou autorisez le bootstrap chez les fournisseurs distants.

## Accès par compte

Connectez-vous avec `kimi login --region global` pour un compte `kimi.ai`, ou `kimi login --region mainland-cn` pour un compte `kimi.com`. Outpost utilise `global` par défaut ; définissez explicitement `region: "mainland-cn"` pour un compte chinois :

```ts
import { createAgent, createKimiHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createKimiHarness({ authentication: "account" }),
});
```

Outpost lit le fichier OAuth de la région et `device_id` sous `~/.kimi-code` (ou `KIMI_CODE_HOME`), les installe dans le home privé de la sandbox, puis lance `kimi login --region global` pour configurer le service international. Le reste de la configuration et des identifiants n’est pas copié. Le fichier international est `credentials/kimi-code-env-0e4f99c69cc27850.json` ; la Chine utilise `credentials/kimi-code.json`. Ces noms correspondent aux emplacements régionaux de la CLI épinglée.

Pour un profil dédié, utilisez `authentication: { account: { file: "/chemin/du/profil" } }` avec la `region` correspondante. Le chemin désigne le dossier contenant `credentials/` et `device_id`. Omettre `region` sélectionne `global`, comme `region: "global"`. Définissez `region: "mainland-cn"` pour utiliser le fichier d’identifiants et le service chinois. Les variables déclarées pour les endpoints OAuth/API doivent correspondre à la région sélectionnée, y compris par défaut. Le provider local transmet les variables de région mais ne copie aucun fichier et ne lance aucune commande de connexion.

Consultez la [commande de connexion Kimi](https://www.kimi.com/code/docs/en/kimi-code-cli/reference/kimi-command.html) et les [variables d’environnement OAuth](https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/env-vars.html).

## Accès API

Fournissez explicitement `KIMI_API_KEY`. L’usage API suit la facturation API du fournisseur.

```ts
import { createAgent, createKimiHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createKimiHarness({
    authentication: "usage",
    variables: { KIMI_API_KEY: process.env.KIMI_API_KEY ?? "" },
  }),
  model: process.env.KIMI_MODEL ?? "",
});
```

## Comportement

L’authentification API exige un modèle explicite sur `createAgent()`. L’option `region` est réservée à l’authentification par compte ; configurez les endpoints API via les variables de modèle de la CLI si nécessaire. Définissez `KIMI_MODEL` dans l’environnement de votre application pour le snippet ci-dessus ; cette variable appartient à l’exemple, pas aux réglages d’Outpost. L’authentification par compte peut utiliser le modèle par défaut de la CLI.

La capture native, la reprise à chaud et à froid, le fork et les réparations automatiques sont pris en charge pour Kimi Code 2.1.1. Outpost reprend avec `--session` et exécute `kimi fork <id> --yes` avant de continuer le nouvel identifiant. Le parent reste indépendant. La capture conserve les métadonnées et fichiers des agents, dont l’historique natif et les plans. `conversations` stocke les sessions capturées dans un [store de conversations](../chat-history/#stockage) au format `"kimi"`, par exemple `createTransportConversations(createKimiConversations(), …)`. Voir [l’historique](../chat-history/) et [la documentation des sessions Kimi](https://www.kimi.com/code/docs/en/kimi-code-cli/guides/sessions.html).

## Comptabilité des tokens

La CLI épinglée `@moonshot-ai/kimi-code` 2.1.1 omet l’usage dans `stream-json`. Après la fin de la commande, Outpost utilise l’identifiant de session pour lire les entrées `usage.record` sous `KIMI_CODE_HOME/sessions/<workspace>/<id>/agents/*/wire.jsonl` (home par défaut : `~/.kimi-code`), dans la sandbox. Les entrées de l’agent principal et des sous-agents sont additionnées une seule fois ; tailles de contexte et résumés d’étape ne sont pas ajoutés à nouveau.

`inputOther` devient `usage.input`, `output` devient `usage.output`, `inputCacheRead` devient `usage.cached` et `inputCacheCreation` devient `usage.cacheCreated`. L’entrée exclut les lectures et écritures de cache. Seul l’usage rapporté est disponible ; un zéro fourni par la CLI ne prouve pas qu’un appel modèle non rapporté était gratuit.

Un identifiant absent, des entrées manquantes ou malformées, une interruption ou le dépassement des limites de lecture produisent `usage.complete === false` ; les compteurs mesurés restent une borne inférieure. Un avertissement au démarrage précise que la collecte intervient après l’exécution. Combinez `budget.attempts` avec un timeout de tâche ou un délai de dispatch ; voir [Budgets de consommation](../token-budgets/).

`mcpServers` fusionne des [serveurs MCP](../mcp-servers/) dans `~/.kimi-code/mcp.json` du home de l’agent, qui est votre propre home avec le fournisseur local.

API : [createKimiHarness](../../reference/createkimiharness/).
