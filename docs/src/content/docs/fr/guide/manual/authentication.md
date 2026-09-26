---
title: Authentification
description: Identifiants de compte et d’usage pour chaque agent, où Outpost les lit et comment il les installe dans une sandbox.
---

Un harness CLI ne s’authentifie que si vous choisissez un identifiant avec son option `authentication`, ou avec `outpost init --authentication`. Outpost prépare alors cet identifiant dans la sandbox avant la première exécution de l’agent. Sans `authentication`, Outpost ne prépare rien et la CLI utilise ce que son environnement fournit déjà.

Commencez par le [premier lancement complet](../../start/quickstart/) pour obtenir une configuration qui fonctionne, puis revenez ici pour le contrat exact.

## Deux familles

| Famille   | Ce qu’elle utilise                                                                                         | Facturation                                                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `account` | La connexion de votre forfait ou abonnement : ChatGPT, Claude, compte Google, GitHub Copilot ou Kimi Code. | Consomme les quotas et limites du forfait. GitHub Copilot décompte des requêtes premium sur votre forfait GitHub.                    |
| `usage`   | Une clé API de la plateforme développeur de l’éditeur.                                                     | Facturée à l’usage par cette plateforme, indépendamment de tout abonnement. Un abonnement ne couvre pas l’usage API, et inversement. |

Choisissez une seule famille par agent. Claude Code donne priorité à une clé API sur une connexion d’abonnement ; Outpost rejette donc une configuration Claude qui déclare les deux plutôt que de facturer l’API sans le dire.

## Les sept formes

| Forme                       | Lecture                                                                                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"account"`                 | Le fichier de connexion par défaut de la CLI sur l’hôte (voir la [matrice par agent](#matrice-par-agent)).                                                                    |
| `{ account: { file } }`     | Ce fichier de connexion à un chemin hôte explicite ; Kimi Code attend un dossier de profil. `~` est développé et un chemin relatif est résolu depuis le dossier du processus. |
| `{ account: { key } }`      | Un jeton de compte littéral. À éviter dans du code versionné.                                                                                                                 |
| `{ account: { variable } }` | Un jeton de compte lu dans la variable de workflow nommée.                                                                                                                    |
| `"usage"`                   | La variable de clé API par défaut de l’agent, qui doit être déclarée.                                                                                                         |
| `{ usage: { key } }`        | Une clé API littérale. À éviter dans du code versionné.                                                                                                                       |
| `{ usage: { variable } }`   | Une clé API lue dans la variable de workflow nommée.                                                                                                                          |

L’option a le type `AgentAuthentication` ; ses objets internes sont `AccountCredential` et `UsageCredential`. La même option existe sur `claudeHarness()`, `codexHarness()`, `antigravityHarness()`, `copilotHarness()` et `kimiHarness()`.

```ts
import {
  agent,
  claudeHarness,
  codexHarness,
  copilotHarness,
  kimiHarness,
  type AccountCredential,
  type AgentAuthentication,
  type UsageCredential,
} from "@elie-laloum/outpost";

// Connexion d’abonnement enregistrée par la CLI sur l’hôte.
const claude = agent({ harness: claudeHarness({ authentication: "account" }) });

// Facturation API avec une clé déclarée sous un autre nom.
const teamKey: UsageCredential = { variable: "TEAM_OPENAI_KEY" };
const codex = agent({
  harness: codexHarness({ authentication: { usage: teamKey } }),
});

// Un fichier de connexion dédié, utilisé uniquement par Outpost.
const dedicated: AccountCredential = {
  file: "~/.outpost/accounts/codex/auth.json",
};
const codexAccount = agent({
  harness: codexHarness({ authentication: { account: dedicated } }),
});

// Un jeton GitHub lu dans les variables du workflow.
const copilot = agent({
  harness: copilotHarness({
    authentication: { account: { variable: "COPILOT_GITHUB_TOKEN" } },
  }),
});

// Les clés API Kimi exigent un nom de modèle sur agent().
const usage: AgentAuthentication = "usage";
const kimi = agent({
  harness: kimiHarness({ authentication: usage }),
  model: "moonshot-model-id",
});
console.log([claude, codex, codexAccount, copilot, kimi].map((a) => a.name));
```

Remplacez `moonshot-model-id` par un identifiant de modèle disponible sur votre compte de la plateforme Moonshot.

## Matrice par agent

### Formes prises en charge

| Agent                                     | `account` | `account.file`   | `account.key`, `account.variable` | `usage`, `usage.key`, `usage.variable`   |
| ----------------------------------------- | --------- | ---------------- | --------------------------------- | ---------------------------------------- |
| Claude Code (`claudeHarness`)             | Oui       | Oui              | Oui : `CLAUDE_CODE_OAUTH_TOKEN`   | Oui : `ANTHROPIC_API_KEY`                |
| Codex (`codexHarness`)                    | Oui       | Oui              | Non                               | Oui : `OPENAI_API_KEY`                   |
| Antigravity (`antigravityHarness`, `agy`) | Oui       | Oui              | Non                               | Oui : `GEMINI_API_KEY`                   |
| GitHub Copilot (`copilotHarness`)         | Oui       | Oui              | Oui : `COPILOT_GITHUB_TOKEN`      | Non : les requêtes relèvent du forfait   |
| Kimi Code (`kimiHarness`)                 | Oui       | Oui : un dossier | Non                               | Oui : `KIMI_API_KEY`, modèle obligatoire |

La variable indiquée est celle que la CLI reçoit dans la sandbox. `"usage"` la lit dans les variables du workflow ; une forme `variable` lit un autre nom et transmet sa valeur sous celui-ci ; une forme `key` transmet la valeur littérale.

### Fichiers de compte

| Agent          | Source sur l’hôte (variable de relocalisation)                                              | Destination dans la sandbox                                                             | Connexion sur l’hôte                                            |
| -------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Claude Code    | `~/.claude/.credentials.json` (`$CLAUDE_CONFIG_DIR/.credentials.json`)                      | `~/.claude/.credentials.json`, réduit à l’entrée `claudeAiOauth`                        | `claude`, puis `/login`                                         |
| Codex          | `~/.codex/auth.json` (`$CODEX_HOME/auth.json`)                                              | `~/.codex/auth.json`                                                                    | `codex -c cli_auth_credentials_store='"file"' login`            |
| Antigravity    | `~/.gemini/antigravity-cli/antigravity-oauth-token` (aucune relocalisation)                 | Le même chemin dans le home de la sandbox                                               | `agy`, puis connexion avec votre compte Google                  |
| GitHub Copilot | `~/.copilot/config.json` (`$COPILOT_HOME/config.json`)                                      | Aucun fichier : le jeton du dernier utilisateur connecté devient `COPILOT_GITHUB_TOKEN` | `copilot login`                                                 |
| Kimi Code      | `~/.kimi-code/credentials/kimi-code.json` et `~/.kimi-code/device_id` (`$KIMI_CODE_HOME/…`) | Les mêmes fichiers sous `~/.kimi-code`, puis Outpost lance `kimi login` dans la sandbox | `kimi login` (ajoutez `--region global` pour un compte kimi.ai) |

Règles propres à chaque agent :

- **Claude Code** ne copie que la connexion d’abonnement ; les autres entrées de `.credentials.json`, comme les jetons OAuth MCP, restent sur l’hôte. Une variable `ANTHROPIC_API_KEY` déclarée fait échouer toutes les formes de compte, et une variable `CLAUDE_CODE_OAUTH_TOKEN` déclarée fait échouer toutes les formes d’usage. `claude setup-token` crée un jeton d’abonnement de longue durée pour les formes à jeton.
- **Codex** exige un `auth.json` au format JSON valide et n’a pas de forme à jeton de compte. `usage` transmet `OPENAI_API_KEY` à la CLI et lance `codex login --with-api-key` dans la sandbox, avec la clé sur stdin. Avec un `modelProvider` personnalisé, Codex n’accepte que `usage`, `usage.key` et `usage.variable` : elles renseignent la variable `modelProvider.apiKeyEnvironment` (par défaut `OPENAI_API_KEY`) sans lancer de connexion. Avec `apiKeyEnvironment: false`, aucune forme d’authentification n’est acceptée.
- **Antigravity** en `usage` écrit aussi dans la sandbox `~/.gemini/antigravity-cli/settings.json` avec `{"modelProvider":"gemini"}` ; `agy` a besoin de la clé et de ce réglage. Une variable `GOOGLE_API_KEY` présente dans la sandbox est prioritaire dans `agy`.
- **GitHub Copilot** lit `config.json` comme du JSON avec commentaires, en extrait `authTokens["<host>:<login>"]` pour `lastLoggedInUser` et ne copie aucun fichier. Un jeton doit être un jeton d’accès personnel à granularité fine doté de la permission « Copilot Requests » ou un jeton OAuth (`gho_`, `ghu_`) ; les jetons classiques `ghp_` sont rejetés.
- **Kimi Code** en `account.file` désigne le dossier de profil qui contient `credentials/kimi-code.json` et `device_id`. Le `kimi login` lancé dans la sandbox, limité à 120 secondes, rafraîchit le jeton si nécessaire et régénère `config.toml` avec le catalogue de modèles géré, comme la connexion sur l’hôte. Seule la région par défaut est exercée par cette connexion en sandbox. `usage` traduit `KIMI_API_KEY` en `KIMI_MODEL_API_KEY`, `KIMI_MODEL_PROVIDER_TYPE=kimi` et `KIMI_MODEL_NAME` (le modèle de l’agent), et Outpost ne transmet pas `--model`. L’URL de base par défaut de Kimi pour cette configuration est la plateforme Moonshot, `https://api.moonshot.ai/v1` ; définissez `KIMI_MODEL_BASE_URL` dans les variables du workflow pour la changer. En mode compte, les noms de modèles sont des alias de configuration Kimi comme `kimi-code/<id>`.

Les adapters Antigravity, Copilot et Kimi désactivent aussi les mises à jour automatiques des CLI par des variables par défaut (`AGY_CLI_DISABLE_AUTO_UPDATE=true`, `COPILOT_AUTO_UPDATE=false`, `KIMI_CODE_NO_AUTO_UPDATE=1`). Une entrée du même nom dans les `variables` du harness les remplace.

## Emplacements sur l’hôte et dans la sandbox

Outpost lit les fichiers de compte **sur l’hôte**, dans le processus qui exécute votre workflow. Il ne lit que des fichiers ordinaires d’au plus 1 Mio et refuse les liens symboliques et les dossiers ; un dossier de profil Kimi sert seulement à localiser ses deux fichiers. Le contenu des fichiers n’apparaît jamais dans les messages d’erreur.

Les formes à variable lisent les **variables résolues du workflow** : les `variables` du harness, les `variables` du provider de sandbox et les déclarations du `.outpost/.env` du dépôt cible. Une déclaration vide hérite de la variable du processus hôte de même nom. Une variable hôte déclarée nulle part reste invisible : `"usage"` échoue avec `Missing OPENAI_API_KEY` même si votre shell l’exporte. Le script généré déclare automatiquement la variable par défaut de la forme choisie ; voir la [priorité des configurations](../configuration/).

Dans la sandbox, les identifiants résident dans le **home privé**. Il est éphémère : détruire la sandbox supprime la connexion copiée, et la [capture des conversations](../../agents/conversations/) conserve les transcriptions, pas l’authentification.

## Sandboxes isolées

Les sandboxes Docker, Podman, Vercel, Daytona et Firecracker reçoivent les identifiants de la même façon. Au premier dispatch ou attachement interactif d’un agent dans une sandbox, Outpost :

1. Lit les fichiers hôtes choisis et résout les variables choisies.
2. Écrit les fichiers dans le home de la sandbox avec **un seul** installateur `node -e` qui reçoit un document JSON sur stdin ; aucun secret n’apparaît dans un argument de commande. L’installateur refuse les chemins absolus et les segments `..`, vides ou `.`, crée les dossiers manquants en mode `0700` et écrit chaque fichier en mode `0600` via un fichier temporaire renommé en place.
3. Lance la commande de connexion de l’agent, s’il y en a une : `codex login --with-api-key` pour Codex en usage, `kimi login` pour un compte Kimi. Les secrets passent par stdin.
4. Ajoute les variables d’identifiants à chaque commande de cet agent dans cette sandbox.

Cette préparation a lieu une fois par agent et par sandbox ; une sandbox chaude réutilise le home préparé. L’installateur utilise le `node` de la sandbox, fourni par les images générées et par l’amorçage distant.

## Provider local

`localSandboxProvider()` exécute la CLI sur l’hôte. Outpost n’y copie ni n’écrit aucun fichier et n’y lance aucune commande de connexion ; il transmet seulement les variables d’identifiants. Par conséquent :

- `account` et `account.file` s’appuient sur la connexion de la CLI sur l’hôte ; le fichier désigné par `account.file` n’est pas lu.
- Copilot utilise sa propre connexion sur l’hôte, y compris celle conservée dans le trousseau.
- Codex en `usage` transmet `OPENAI_API_KEY` sans lancer `codex login --with-api-key` : votre `~/.codex/auth.json` sur l’hôte n’est jamais écrasé.
- Antigravity en `usage` n’écrit pas `settings.json` ; vos réglages `agy` de l’hôte s’appliquent.

## Trousseaux système

Outpost ne lit jamais de trousseau système : trousseau macOS, libsecret ou Gestionnaire d’identification Windows. Une CLI qui y conserve sa connexion ne laisse aucun fichier à copier pour `account`, et l’erreur l’indique. Utilisez l’une de ces voies :

- **Claude Code sur macOS** garde sa connexion dans le trousseau. Créez un jeton avec `claude setup-token` et choisissez `{ account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } }`.
- **Codex** n’enregistre sa connexion dans un fichier qu’avec `cli_auth_credentials_store = "file"` ; reconnectez-vous avec `codex -c cli_auth_credentials_store='"file"' login`.
- **GitHub Copilot** utilise le trousseau par défaut et n’écrit un jeton en clair dans `config.json` qu’en l’absence de trousseau ou avec `storeTokenPlaintext: true`. Sinon, choisissez `{ account: { variable: "COPILOT_GITHUB_TOKEN" } }` avec un jeton à granularité fine.
- **Antigravity** utilise le trousseau du système lorsqu’une session D-Bus existe et se replie sinon sur le fichier de jeton. Connectez-vous là où aucun trousseau n’est disponible, ou utilisez `usage`. Un ticket amont (google-antigravity/antigravity-cli#479) signale qu’une connexion enregistrée dans un fichier n’est pas relue par un nouveau processus ; Outpost ne l’a pas vérifié en conditions réelles avec `agy` 1.2.x.

## Jetons de rafraîchissement et profils dédiés

Les sessions Claude Code, Codex, Kimi Code et Antigravity peuvent renouveler leur jeton de rafraîchissement lorsque la copie de la sandbox se rafraîchit. La copie de l’hôte contient alors un jeton révoqué, et votre CLI habituelle peut se retrouver déconnectée.

Donnez à Outpost un profil dédié que vous n’utilisez pas en interactif, et faites pointer `account.file` vers lui :

```sh
mkdir -p ~/.outpost/accounts/codex ~/.outpost/accounts/claude ~/.outpost/accounts/copilot ~/.outpost/accounts/kimi
CODEX_HOME=~/.outpost/accounts/codex codex -c cli_auth_credentials_store='"file"' login
CLAUDE_CONFIG_DIR=~/.outpost/accounts/claude claude # puis /login ; pas sur macOS
COPILOT_HOME=~/.outpost/accounts/copilot copilot login
KIMI_CODE_HOME=~/.outpost/accounts/kimi kimi login
```

Pour Antigravity, connectez-vous avec un `HOME` distinct, par exemple `HOME=~/.outpost/accounts/antigravity agy`, là où aucun trousseau n’est disponible, puis faites pointer `account.file` vers `.gemini/antigravity-cli/antigravity-oauth-token` dans ce dossier.

```ts
import {
  agent,
  claudeHarness,
  codexHarness,
  copilotHarness,
  kimiHarness,
} from "@elie-laloum/outpost";

const accounts = "~/.outpost/accounts";
const agents = [
  agent({
    harness: codexHarness({
      authentication: { account: { file: `${accounts}/codex/auth.json` } },
    }),
  }),
  agent({
    harness: claudeHarness({
      authentication: {
        account: { file: `${accounts}/claude/.credentials.json` },
      },
    }),
  }),
  agent({
    harness: copilotHarness({
      authentication: { account: { file: `${accounts}/copilot/config.json` } },
    }),
  }),
  agent({
    harness: kimiHarness({
      authentication: { account: { file: `${accounts}/kimi` } },
    }),
  }),
];
console.log(agents.map((selected) => selected.name));
```

Le profil dédié protège votre connexion habituelle, mais il peut lui-même devenir obsolète après un rafraîchissement dans une sandbox : reconnectez-le lorsqu’une exécution signale des identifiants rejetés, et ne le partagez pas entre des workflows concurrents. Lorsqu’un jeton de longue durée existe, préférez-le : `claude setup-token` pour Claude Code, un jeton à granularité fine pour Copilot.

## Quand les erreurs apparaissent

**Quand `agent()` compose le harness**, ainsi que pendant `outpost init`, qui le compose pour valider le projet généré :

- Une forme invalide : plus d’une clé, une clé inconnue, une chaîne vide ou un nom de variable invalide.
- Une forme que l’agent n’accepte pas. Le message liste les formes acceptées, par exemple `Codex does not support account.key authentication. Accepted forms: account, account.file, usage, usage.key, usage.variable`.
- Un jeton classique `ghp_` donné à Copilot avec `account.key`.
- Kimi en `usage` sans modèle sur `agent()`.

**Quand la sandbox est préparée** pour le premier dispatch ou attachement de l’agent :

- Une variable manquante : `Missing NAME. Declare the selected credential explicitly.`
- Un fichier hôte manquant. Le message indique le chemin, la commande de connexion à lancer et l’alternative `key` ou `variable`, et précise que le trousseau n’est jamais lu.
- Un lien, un dossier ou un fichier de plus de 1 Mio ; un `auth.json` Codex invalide ; un fichier Claude sans `claudeAiOauth` ; un `config.json` Copilot sans jeton pour le dernier utilisateur.
- Des identifiants Claude concurrents, ou un jeton classique `ghp_` lu par Copilot dans une variable.
- Une commande de connexion qui échoue dans la sandbox.

**Quand le modèle est appelé**, un identifiant expiré, révoqué ou non éligible apparaît comme une erreur de la CLI de l’agent. Ni `outpost doctor` ni une allocation de sandbox réussie ne prouvent qu’un modèle accepte l’identifiant.

## Workflows générés

`outpost init --agent <agent> --authentication account|account-token|usage` écrit la forme choisie dans le `run.ts` généré, qui ne lit lui-même aucun fichier d’identifiants.

| Choix           | Réglage généré                                                                                          | `.env.example`                                |
| --------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `account`       | `authentication: "account"`                                                                             | Aucune variable d’identifiant.                |
| `account-token` | `{ account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } }` pour Claude, `COPILOT_GITHUB_TOKEN` pour Copilot | Cette variable.                               |
| `usage`         | `authentication: "usage"`                                                                               | La variable de clé API par défaut de l’agent. |

`account` est la valeur par défaut, ou `usage` avec `--base-url`. Kimi en `usage` exige `--model`. Voir le [contrat CLI](../cli/).

## Migrer depuis les modes supprimés

Les formes `{ mode: "api-key" | "oauth-token" | "login" }`, leurs champs `environment` et `credentials`, ainsi que `--authentication api-key|oauth-token|login`, n’existent plus et n’ont pas d’alias.

| Supprimé                                                       | Remplacement                                                                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `{ mode: "api-key" }`                                          | `"usage"`                                                                                                          |
| `{ mode: "api-key", environment: "TEAM_KEY" }`                 | `{ usage: { variable: "TEAM_KEY" } }`                                                                              |
| `{ mode: "oauth-token" }` (Claude)                             | `{ account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } }`                                                             |
| `{ mode: "login" }`                                            | `"account"`                                                                                                        |
| `{ mode: "login", credentials: await readFile(path, "utf8") }` | `{ account: { file: path } }` : Outpost lit désormais le fichier lui-même                                          |
| Hooks qui copient `auth.json` ou lancent `codex login`         | `"account"`, `{ account: { file } }` ou `"usage"` ; supprimez le hook pour ne pas préparer la connexion deux fois. |
| `--authentication api-key`, `oauth-token`, `login`             | `--authentication usage`, `account-token`, `account`                                                               |
| `geminiHarness()`                                              | `antigravityHarness()` : Gemini CLI ne sert plus les comptes gratuits, Google AI Pro et Ultra.                     |

## L’allocation cloud utilise un accès séparé

Les identifiants Vercel et Daytona autorisent l’allocation de sandbox, indépendamment des identifiants de l’agent. Utilisez les réglages de connexion ou variables d’environnement déclarés par le provider ; n’ajoutez pas les secrets d’allocation aux variables de l’agent sauf s’il en a effectivement besoin. La [recette distante](../../cookbook/remote/) fournit toute la préparation SDK et environnement.

## Diagnostiquer une connexion en échec

Vérifiez dans l’ordre : la forme choisie, la variable déclarée ou le fichier hôte cité par l’erreur, une connexion conservée uniquement dans un trousseau, une variable Claude concurrente, puis l’accès de votre forfait ou compte API au modèle. Recréez la sandbox après avoir changé l’authentification. N’affichez pas de secrets pour déboguer.

Guides des agents : [Codex](../../agents/connect-codex/), [Claude Code](../../agents/connect-claude/), [Antigravity](../../agents/connect-antigravity/), [GitHub Copilot](../../agents/connect-copilot/) et [Kimi Code](../../agents/connect-kimi/). Les providers de modèle Codex personnalisés nécessitent un endpoint compatible Responses ; voir le [contrat du provider](../../behavior/agents/connect-codex/#fournisseurs-de-modèles-compatibles-openai).

Sources des éditeurs : [authentification Claude](https://code.claude.com/docs/en/authentication), [authentification Codex](https://developers.openai.com/codex/auth/), [installation de la CLI Antigravity](https://antigravity.google/docs/cli/install/) et [mode headless](https://antigravity.google/docs/cli/headless/), [dossier de configuration de la CLI Copilot](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference).
