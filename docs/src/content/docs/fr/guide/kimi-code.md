---
title: "Kimi Code"
description: "Connecter Kimi Code à une sandbox Outpost."
---

Utilisez `kimiHarness()` avec un [environnement d’exécution](../execution-backends/) pris en charge. Installez la CLI dans votre image ou autorisez le bootstrap chez les fournisseurs distants.

## Accès par compte

Connectez-vous avec `kimi login --region global` pour un compte `kimi.ai`, ou `kimi login --region mainland-cn` pour un compte `kimi.com`. Outpost utilise `global` par défaut ; définissez explicitement `region: "mainland-cn"` pour un compte chinois :

```ts
import { agent, kimiHarness } from "@elie-laloum/outpost";

const coder = agent({
  harness: kimiHarness({ authentication: "account" }),
});
```

Outpost lit le fichier OAuth de la région et `device_id` sous `~/.kimi-code` (ou `KIMI_CODE_HOME`), les installe dans le home privé de la sandbox, puis lance `kimi login --region global` pour configurer le service international. Le reste de la configuration et des identifiants n’est pas copié. Le fichier international est `credentials/kimi-code-env-0e4f99c69cc27850.json` ; la Chine utilise `credentials/kimi-code.json`. Ces noms correspondent aux emplacements régionaux de la CLI épinglée.

Pour un profil dédié, utilisez `authentication: { account: { file: "/chemin/du/profil" } }` avec la `region` correspondante. Le chemin désigne le dossier contenant `credentials/` et `device_id`. Omettre `region` sélectionne `global`, comme `region: "global"`. Définissez `region: "mainland-cn"` pour utiliser le fichier d’identifiants et le service chinois. Les variables déclarées pour les endpoints OAuth/API doivent correspondre à la région sélectionnée, y compris par défaut. Le provider local transmet les variables de région mais ne copie aucun fichier et ne lance aucune commande de connexion.

Consultez la [commande de connexion Kimi](https://www.kimi.com/code/docs/en/kimi-code-cli/reference/kimi-command.html) et les [variables d’environnement OAuth](https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/env-vars.html).

## Accès API

Fournissez explicitement `KIMI_API_KEY`. L’usage API suit la facturation API du fournisseur.

```ts
import { agent, kimiHarness } from "@elie-laloum/outpost";

const coder = agent({
  harness: kimiHarness({
    authentication: "usage",
    variables: { KIMI_API_KEY: process.env.KIMI_API_KEY ?? "" },
  }),
  model: process.env.KIMI_MODEL ?? "",
});
```

## Comportement

L’authentification API exige un modèle explicite sur `agent()`. L’option `region` est réservée à l’authentification par compte ; configurez les endpoints API via les variables de modèle de la CLI si nécessaire. Définissez `KIMI_MODEL` dans l’environnement de votre application pour le snippet ci-dessus ; cette variable appartient à l’exemple, pas aux réglages d’Outpost. L’authentification par compte peut utiliser le modèle par défaut de la CLI.

Cet adaptateur démarre uniquement des sessions neuves. La capture native des conversations, la reprise, le fork et la réparation automatique des réponses ne sont pas disponibles.

API : [kimiHarness](../../reference/kimiharness/).
