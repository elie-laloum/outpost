---
title: Exécuter Gemini CLI
description: Exécuter Gemini dans un bac à sable avec sortie en flux et limites explicites des sessions.
sidebar:
  order: 7
---

`gemini()` exécute Gemini CLI natif avec les mêmes fournisseurs de bacs à sable que les autres adaptateurs. Les recettes Docker/Podman générées installent Gemini avec Claude Code et Codex ; les fournisseurs distants installent au besoin la version fixée, sauf avec `bootstrap: false`. Pour `local()`, installez vous-même `@google/gemini-cli` ; ce fournisseur s'exécute directement sur l'hôte.

## Créer un workflow

Prérequis : Node.js 24+, Git, Docker et un dépôt contenant un premier commit :

```sh
mkdir gemini-workflow
cd gemini-workflow
npx @elie-laloum/outpost init --yes --agent gemini --provider docker \
  --repository /path/to/repository --install --build
```

Copiez `.env.example` vers `.env` et laissez la déclaration `GEMINI_API_KEY=` vide pour hériter d'une clé fournie par le processus parent ou votre gestionnaire de secrets. Exécutez le script généré avec `node run.ts "Votre tâche"`. Cela effectue de véritables appels au modèle, susceptibles d'être facturés. Ne placez jamais d'identifiants dans l'image, le prompt ou les fichiers versionnés.

Une clé API Gemini utilise les quotas et la facturation du compte API Gemini. La connexion avec un compte Google est un autre mode d'authentification du CLI, avec ses propres conditions et limites ; un abonnement Google AI ne transforme pas une clé API en authentification par abonnement. Pour une connexion locale par compte, lancez `gemini` en mode interactif et suivez le parcours dans le navigateur. `local()` peut utiliser la connexion de l'hôte ; un conteneur dispose de son propre répertoire personnel privé et éphémère, sans hériter de cette connexion. Outpost ne déplace pas les identifiants Gemini et ne persiste pas un répertoire personnel partiel. Consultez les [instructions d'authentification Gemini](https://geminicli.com/docs/get-started/authentication/) à jour pour choisir entre connexion Google, clé API et Vertex AI.

## Configurer l'exécution

```ts
import { dispatch, gemini } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error("Supply GEMINI_API_KEY before running this workflow");
const result = await dispatch({
  repository: "/path/to/repository",
  agent: gemini({ model: "flash", variables: { GEMINI_API_KEY: key } }),
  provider: docker(),
  branch: { mode: "named", name: "gemini-review" },
  brief: { text: "Review the repository and report your findings." },
});
console.log(result.text, result.usage);
```

Construisez l'image générée avant cet exemple. `model` accepte un nom de modèle ou un alias Gemini CLI. Les commandes sans interface transmettent le prompt sur stdin et demandent `stream-json`. Leur `approvalMode` par défaut est `yolo`, qui autorise l'exécution autonome des outils dans l'environnement choisi. Définissez explicitement `approvalMode` à `default`, `auto_edit` ou `plan` selon le besoin ; les approbations nécessitant une saisie au terminal ne conviennent pas à une exécution autonome. Le fournisseur Outpost assure l'isolation ; `local()` reste sans isolation.

Les sessions interactives utilisent l'interface terminal du CLI et `approvalMode: "default"` par défaut. Elles nécessitent un fournisseur prenant en charge les terminaux interactifs, comme Docker, Podman ou l'exécution locale. Un prompt initial utilise `--prompt-interactive`. Consultez les [sessions interactives](../../sandboxes/commands/) et les [options officielles du CLI](https://geminicli.com/docs/cli/cli-reference/).

## Sortie et limites des sessions

Les fragments de messages assistant deviennent des observations textuelles, les appels d'outils des observations d'outils, et les avertissements restent non fatals. Les résultats d'outils et les événements inconnus restent disponibles dans les observations brutes. L'agent peut traiter une erreur d'outil ; celle-ci ne fait pas échouer à elle seule l'exécution. Une erreur du protocole, un résultat final en échec ou un code de sortie non nul font échouer l'exécution. Un code zéro sans résultat final réussi échoue également : une sortie tronquée ne peut donc pas réussir silencieusement. Les marqueurs de fin attendent le résultat final avant de démarrer le délai de stabilisation.

Les statistiques finales agrégées alimentent une seule fois les compteurs de tokens d'entrée, en cache et de sortie. Les détails par modèle restent dans les événements bruts. L'identifiant de session émis est informatif : Outpost ne capture, déplace, restaure, reprend ni ne bifurque les transcriptions natives Gemini. `result.resume()`, `result.fork()` et les continuations explicites échouent clairement, y compris dans un bac à sable réutilisé. Les passes supplémentaires démarrent de nouvelles sessions. Les réponses structurées fonctionnent avec `repairs: 0` ; la réparation automatique nécessite une continuation et est refusée.

L'adaptateur et la version d'image fixée sont testés avec des événements déterministes et des vérifications de l'aide du CLI sans identifiants. Ces vérifications ne prouvent pas le comportement d'un modèle réel et n'authentifient aucun compte. Inspectez les capacités du CLI installé sans appel au modèle :

```sh
npx @elie-laloum/outpost doctor --provider docker --agent gemini
```

Le protocole sans interface suit la [documentation de sortie en flux de Gemini](https://geminicli.com/docs/cli/headless/). `agentVersions.gemini` indique la version de référence fixée.
