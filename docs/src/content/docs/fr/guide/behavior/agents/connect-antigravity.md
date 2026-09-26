---
title: "Connecter Antigravity CLI"
description: "Installer agy, choisir l’authentification par compte Google ou par clé API Gemini, et lancer de nouvelles sessions Antigravity."
sidebar:
  order: 5.1
---

`agent({ harness: antigravityHarness() })` exécute la CLI Antigravity de Google, `agy`, avec les mêmes fournisseurs de sandbox que les autres adaptateurs. Antigravity succède à Gemini CLI chez Google pour le travail agentique en ligne de commande ; Outpost ne fournit plus d’adaptateur Gemini CLI. Chaque exécution démarre une session neuve.

## Installer agy

Outpost installe `agy` avec le script d’installation officiel de Google, `https://antigravity.google/cli/install.sh`, là où il installe les autres CLI :

- **Images de conteneur générées.** La recette écrite par `outpost init` exécute l’installateur pendant la construction avec un `HOME` temporaire, puis installe le binaire sous `/usr/local/bin/agy`. L’installateur place `agy` dans `~/.local/bin`, mais Outpost monte à l’exécution un home privé vide sur `/home/agent`, qui masquerait un binaire laissé dans le home de l’utilisateur de l’image. La recette de l’[image d’agents préconstruite](../../../environment/providers/agent-images/) conserve la même étape. Une image personnalisée doit de même fournir `agy` dans le `PATH`, hors du home ; consultez les [instructions d’installation officielles](https://antigravity.google/docs/cli/install/).
- **Fournisseurs distants.** Avec l’installation automatique activée, par défaut, une sandbox distante sans `agy` dans le `PATH` exécute `curl -fsSL https://antigravity.google/cli/install.sh | bash` lors de la préparation de l’agent, ce qui installe `~/.local/bin/agy` dans le home de la sandbox. Cela nécessite `curl`, `bash` et un accès réseau à `antigravity.google` dans la sandbox. `bootstrap: false` désactive cette installation ; l’environnement doit alors déjà fournir `agy`. Les versions fixées de Claude Code, Codex, Copilot et Kimi sont, elles, installées avec npm dans `~/.outpost-tools`.
- **Exécution locale.** Avec `localSandboxProvider()`, installez `agy` sur l’hôte en suivant les [instructions d’installation officielles](https://antigravity.google/docs/cli/install/). Ce fournisseur s’exécute directement sur l’hôte, sans isolation.

Antigravity n’a pas de version fixée : `agentVersions` ne contient pas d’entrée `antigravity`, et l’installateur récupère la version courante (1.2.11 lors des tests de cette intégration). Reconstruire une image ou préparer une nouvelle sandbox distante peut donc installer un `agy` plus récent. L’installateur est un script shell distant téléchargé pendant la construction ou l’installation automatique ; si votre politique exige un binaire relu, installez `agy` dans votre propre image et désactivez l’installation automatique distante. Outpost définit `AGY_CLI_DISABLE_AUTO_UPDATE=true` pour chaque commande `agy`, afin que la CLI ne se remplace pas pendant une exécution. Une valeur fournie dans les `variables` du harness la remplace.

## S’authentifier

Sélectionnez explicitement l’authentification avec l’option `authentication` du harness. Sans elle, Outpost ne prépare rien et `agy` utilise ce que l’environnement de la sandbox fournit déjà. Antigravity accepte `account`, `account.file`, `usage`, `usage.key` et `usage.variable`. Consultez le [manuel d’authentification](../../../manual/authentication/) pour les formes communes à tous les agents.

### Compte Google

```ts
import {
  agent as composeAgent,
  antigravityHarness,
} from "@elie-laloum/outpost";

const google = composeAgent({
  harness: antigravityHarness({ authentication: "account" }),
});
const dedicated = composeAgent({
  harness: antigravityHarness({
    authentication: {
      account: { file: "~/.outpost/accounts/antigravity-oauth-token" },
    },
  }),
});
console.log(google.name, dedicated.name);
```

Lancez `agy` sur l’hôte et connectez-vous avec votre compte Google. `account` lit `~/.gemini/antigravity-cli/antigravity-oauth-token` ; `account.file` lit un autre fichier au même format. Avec Docker, Podman, Vercel, Daytona et Firecracker, Outpost lit ce fichier sur l’hôte et l’écrit dans `~/.gemini/antigravity-cli/antigravity-oauth-token` du home privé de la sandbox, avec le mode `0600`. Outpost ne lit que des fichiers ordinaires d’au plus 1 Mio ; les liens symboliques et les répertoires sont refusés. Si le fichier est absent, l’erreur indique son chemin, demande de lancer `agy` sur l’hôte et suggère `usage` avec `GEMINI_API_KEY`. Le contenu des fichiers n’apparaît jamais dans les erreurs.

`agy` conserve sa connexion OAuth dans le trousseau système lorsqu’une session D-Bus est disponible, et n’écrit le fichier de jeton que dans le cas contraire. Outpost ne lit jamais de trousseau système : une connexion conservée uniquement dans le trousseau ne peut pas être copiée. Reconnectez-vous là où aucun trousseau n’est disponible, ou utilisez une clé API Gemini. Le ticket amont [google-antigravity/antigravity-cli#479](https://github.com/google-antigravity/antigravity-cli/issues/479) signale qu’un nouveau processus `agy` peut ne pas relire une connexion enregistrée dans un fichier ; ce comportement n’a pas été vérifié en conditions réelles avec `agy` 1.2.x : vérifiez une petite requête avant de vous appuyer sur l’authentification par compte.

Avec `localSandboxProvider()`, Outpost ne copie ni n’écrit rien sur l’hôte : `agy` utilise sa propre connexion de l’hôte pour `account` et `account.file`.

### Clé API Gemini

```ts
import {
  agent as composeAgent,
  antigravityHarness,
} from "@elie-laloum/outpost";

const declared = composeAgent({
  harness: antigravityHarness({ authentication: "usage" }),
});
const team = composeAgent({
  harness: antigravityHarness({
    authentication: { usage: { variable: "TEAM_GEMINI_API_KEY" } },
  }),
});
console.log(declared.name, team.name);
```

`usage` lit `GEMINI_API_KEY` dans les variables résolues du workflow : les `variables` du harness, les `variables` du fournisseur de sandbox et les déclarations du fichier `.outpost/.env` du dépôt. `usage.variable` lit une autre variable déclarée, et `usage.key` reçoit une clé littérale, à garder hors du code versionné. Une variable absente échoue lors de la préparation de la sandbox avec `Missing GEMINI_API_KEY. Declare the selected credential explicitly.`

`agy` 1.1.13 et suivants exigent à la fois la clé et un réglage de fournisseur de modèles Gemini. Avec les fournisseurs isolés, Outpost transmet la clé sous `GEMINI_API_KEY` à chaque commande `agy` et écrit `~/.gemini/antigravity-cli/settings.json`, contenant `{"modelProvider":"gemini"}`, dans le home privé de la sandbox. Avec `localSandboxProvider()`, seule la variable est transmise ; le fichier de réglages de l’hôte n’est ni lu ni écrit : configurez-le vous-même. Si `GOOGLE_API_KEY` est également présente, `agy` lui donne la priorité. Les requêtes Gemini API sont facturées au projet Gemini API, indépendamment des abonnements Google AI.

### Formes non prises en charge et rotation des jetons

Antigravity n’a pas de jeton de compte à longue durée de vie : `{ account: { key } }` et `{ account: { variable } }` échouent lors de la composition de l’agent avec `Antigravity does not support account.key authentication. Accepted forms: account, account.file, usage, usage.key, usage.variable`. Les structures invalides, les valeurs vides et les noms de variable invalides échouent de la même façon.

La copie d’une connexion par compte dans la sandbox peut rafraîchir son jeton OAuth et faire tourner le jeton de rafraîchissement, ce qui peut invalider la copie de l’hôte et déconnecter l’hôte. Conservez un fichier de connexion dédié, utilisé uniquement par Outpost, et sélectionnez-le avec `account.file`, par exemple `~/.outpost/accounts/antigravity-oauth-token`. Ne partagez pas une même connexion entre des sandboxes parallèles qui la rafraîchissent indépendamment.

## Configurer l’exécution

```ts
import {
  agent as composeAgent,
  antigravityHarness,
  dispatch,
} from "@elie-laloum/outpost";
import { localSandboxProvider } from "@elie-laloum/outpost/providers/local";

const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error("Supply GEMINI_API_KEY before running this workflow");
const result = await dispatch({
  repository: "/path/to/repository",
  agent: composeAgent({
    harness: antigravityHarness({
      authentication: "usage",
      variables: { GEMINI_API_KEY: key },
      mode: "plan",
    }),
  }),
  sandboxProvider: localSandboxProvider(),
  branch: { mode: "named", name: "antigravity-review" },
  brief: { text: "Review the repository and report your findings." },
});
console.log(result.text, result.usage);
```

Cet exemple exécute `agy` installé sur l’hôte. Pour l’isoler, utilisez `dockerSandboxProvider({ image })` depuis `@elie-laloum/outpost/providers/docker` avec une image générée par `outpost init`, qui contient `agy`, ou une autre image qui le fournit. `model` sur `agent()` accepte un nom de modèle pris en charge par `agy` et le transmet avec `--model` ; `reasoning` et `maxOutputTokens` sont refusés lors de la composition de l’agent.

Une exécution sans interface lance :

```sh
agy [--model MODEL] [--mode accept-edits|plan | --dangerously-skip-permissions] \
  --input-format stream-json --output-format stream-json
```

Le prompt est écrit sur stdin en une ligne, `{"event":"user","message":{"content":"…"}}`, le canal d’entrée documenté d’`agy` depuis la version 1.1.15. Sans `mode`, Outpost transmet `--dangerously-skip-permissions`, qui autorise l’exécution autonome de tous les outils dans la sandbox sélectionnée ; sélectionnez uniquement des dépôts dont la configuration est digne de confiance. `mode: "accept-edits"` ou `mode: "plan"` transmet `--mode` à la place et applique cette politique d’autorisation ; les approbations nécessitant une saisie au terminal ne conviennent pas à une exécution autonome. Le fournisseur Outpost assure l’isolation ; `localSandboxProvider()` reste sans isolation. Consultez la [documentation du mode sans interface](https://antigravity.google/docs/cli/headless/).

Les sessions interactives lancent `agy [--model MODEL] [--mode MODE] [--prompt-interactive TEXT]` dans l’interface terminal de la CLI, sans `--dangerously-skip-permissions`. Elles nécessitent un fournisseur prenant en charge les terminaux interactifs, comme Docker, Podman ou l’exécution locale. Consultez les [sessions interactives](../../../environment/commands/).

## Sortie et échecs

Les événements sont décodés selon leur champ `event`. `init` indique l’identifiant de conversation. Les enregistrements `step_update` avec `step_type: "agent_response"` deviennent des observations textuelles à partir de `text_delta` ; les enregistrements `step_type: "tool"` à l’état `DONE` ou `ERROR` deviennent des observations d’outils avec `tool_name` et `tool_info.parameters`. Les autres enregistrements restent disponibles dans les observations brutes. L’agent peut traiter une erreur d’outil ; celle-ci ne fait pas échouer à elle seule l’exécution.

L’événement final `result` détermine l’issue. Il ne réussit qu’avec `status: "SUCCESS"` et une `response` non vide, qui devient le texte du résultat. Tout autre statut, comme `CANCELED`, `ERROR` ou `INTERRUPTED`, une réponse vide ou un code de sortie non nul font échouer l’exécution. Un résultat final est obligatoire : un code zéro sans résultat final échoue également, si bien qu’une sortie tronquée ne peut pas réussir silencieusement.

## Consommation et limites des sessions

Le résultat final alimente une seule fois la consommation de tokens : `input_tokens` en entrée, `cache_read_tokens` en cache, et `output_tokens` plus `thinking_tokens` en sortie.

Les sessions Antigravity sont uniquement des sessions neuves. L’identifiant de conversation émis est informatif : Outpost ne capture, déplace, restaure, reprend ni ne bifurque les conversations `agy`. `result.resume()`, `result.fork()` et les continuations explicites échouent avec `Antigravity does not support continuation or fork in Outpost`, y compris dans une sandbox réutilisée. Les passes supplémentaires démarrent de nouvelles sessions. Les réponses structurées fonctionnent avec `repairs: 0` ; la réparation automatique nécessite une continuation et est refusée. La reprise de session est prévue ; consultez la [feuille de route](../../../../project/roadmap/).

## Diagnostiquer l’installation

Inspectez la CLI installée sans appel au modèle ni identifiants. Indiquez l’image construite par `outpost init`, ou utilisez `--sandbox-provider local` pour une installation sur l’hôte :

```sh
npx @elie-laloum/outpost doctor --sandbox-provider docker --agent antigravity --image outpost:mon-workflow
```

La vérification lance `agy --version` et `agy --help`, qui doit afficher `Usage of agy:` et déclarer les options utilisées par Outpost. La version est signalée sans comparaison, faute de version fixée. Elle n’authentifie aucun compte et ne prouve pas le comportement d’un modèle réel.
