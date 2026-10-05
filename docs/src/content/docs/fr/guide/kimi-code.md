---
title: "Configurer Kimi Code"
description: "Exécutez Kimi Code avec votre compte ou une clé d’API et choisissez la région du compte."
---

## Installation

<!-- features -->

- [Images d’agent](../agent-images/): Les images générées contiennent déjà `kimi`.
- [Sandboxes cloud](../cloud-sandboxes/): Outpost installe `@moonshot-ai/kimi-code` avec npm quand `kimi` est absent.
- [Exécution sur l’hôte](../host-process/): Installez-la vous-même avec `npm install -g @moonshot-ai/kimi-code`.

L’[image d’agent](../agent-images/) et l’installation dans le cloud utilisent la version indiquée par [`agentVersions.kimi`](../../reference/agentversions/). Outpost désactive les mises à jour automatiques pour conserver cette version pendant les exécutions.

## Se connecter avec son compte

Connectez-vous sur l’hôte avec `kimi login --region global` (`mainland-cn` pour un compte kimi.com), puis sélectionnez `account`. L’exécution utilise votre abonnement Kimi Code.

```ts
import { createAgent, createKimiHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createKimiHarness({ authentication: "account" }),
});
```

Dans un conteneur ou une sandbox cloud, Outpost copie le fichier d’identifiants de la région et `device_id` depuis `~/.kimi-code` (ou `$KIMI_CODE_HOME`) dans le répertoire personnel privé de la sandbox, puis y lance `kimi login --region <region>`. Rien d’autre de votre répertoire personnel Kimi n’est copié. Sur l’[hôte](../host-process/), la CLI utilise votre propre `~/.kimi-code` tel quel.

Un `model` sur `createAgent()` devient `--model` ; sans lui, la CLI choisit son modèle par défaut.

### Choisir la région

Référence API : [KimiSettings](../../reference/kimisettings/).

| `region`                | Compte   | Fichier d’identifiants                            | Endpoints                       |
| ----------------------- | -------- | ------------------------------------------------- | ------------------------------- |
| `"global"` (par défaut) | kimi.ai  | `credentials/kimi-code-env-0e4f99c69cc27850.json` | `auth.kimi.ai`, `api.kimi.ai`   |
| `"mainland-cn"`         | kimi.com | `credentials/kimi-code.json`                      | `auth.kimi.com`, `api.kimi.com` |

Outpost définit `KIMI_CODE_OAUTH_HOST` et `KIMI_CODE_BASE_URL` sur les points d’accès de la région. Voir la [commande de connexion](https://www.kimi.com/code/docs/en/kimi-code-cli/reference/kimi-command.html) de Kimi.

### Utiliser un profil dédié

`{ account: { file } }` désigne un dossier de profil qui contient `credentials/` et `device_id`. Indiquez la `region` du compte connecté dans ce profil.

```ts
import { createAgent, createKimiHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createKimiHarness({
    authentication: { account: { file: "/srv/outpost/kimi-profile" } },
    region: "mainland-cn",
  }),
});
```

## Utiliser une clé d’API

Passez `KIMI_API_KEY` et un modèle : sans modèle, la composition échoue. Les appels relèvent de la facturation API de Kimi, pas de votre abonnement.

```ts
import { createAgent, createKimiHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createKimiHarness({
    authentication: "usage",
    variables: { KIMI_API_KEY: process.env.KIMI_API_KEY ?? "" },
  }),
  model: process.env.KIMI_MODEL ?? "",
});
```

Outpost transmet la clé et le modèle à la CLI dans `KIMI_MODEL_API_KEY` et `KIMI_MODEL_NAME`. Pour un autre point d’accès, ajoutez `KIMI_MODEL_BASE_URL` à `variables` ([variables Kimi](https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/env-vars.html)). Autres formes de clé : [Authentification](../authentication/).

## Fonctions disponibles

[Choisir un agent](../choose-an-agent/) compare les agents.

<!-- features -->

- [Conversations](../conversations/): Capture, reprise à froid et à chaud, et fork avec `kimi fork`. La session parente reste inchangée.
- [Réponses typées](../typed-responses/): Une réponse invalide est réparée en reprenant la session.
- [Réorientation](../steering/): Outpost arrête la CLI dès que sa session est connue, puis la reprend avec votre texte.
- [Serveurs MCP](../mcp-servers/): Fusionnés dans `~/.kimi-code/mcp.json` du répertoire personnel de l’agent. Les serveurs `oauth: "login"` réutilisent votre connexion de l’hôte.
- [Pauses sur quota](../quota-pauses/): Les erreurs de quota et de solde arrêtent le tour avec le code `quota`.
- [Budgets](../budgets/): L’usage des tokens est lu dans la session après la fin de la CLI.

### Usage des tokens

Une fois la CLI terminée, Outpost lit les entrées `usage.record` de la session dans la sandbox, pour l’agent principal et ses sous-agents. Une session reprise ne compte que le nouveau tour.

| Champ Kimi           | Champ Outpost        |
| -------------------- | -------------------- |
| `inputOther`         | `usage.input`        |
| `output`             | `usage.output`       |
| `inputCacheRead`     | `usage.cached`       |
| `inputCacheCreation` | `usage.cacheCreated` |

`usage.complete` vaut `false` après une interruption, sans identifiant de session, avec des entrées absentes, malformées ou trop volumineuses, et au premier tour d’un fork. Les compteurs sont alors une borne inférieure : limitez l’exécution avec `budget.attempts` et un timeout ([Budgets](../budgets/)).

## Limites

- **Réglages du modèle** : `reasoning` et `maxOutputTokens` sont refusés à la composition de l’agent. Seul le nom du modèle s’applique.
- **Région** : `region` ne s’applique qu’à l’accès par compte ; combinée à l’authentification `usage`, elle est refusée.
- **Variables de point d’accès** : avec l’accès par compte, un `KIMI_CODE_OAUTH_HOST`, `KIMI_OAUTH_HOST` ou `KIMI_CODE_BASE_URL` déclaré qui ne correspond pas à la région échoue, y compris avec la région par défaut.
- **Formes de compte** : `{ account: { key } }` et `{ account: { variable } }` ne sont pas prises en charge.
- **Compteurs tardifs** : un budget de tokens ne voit l’usage d’un tour qu’après la fin de la CLI.

API : [createKimiHarness](../../reference/createkimiharness/) · [KimiSettings](../../reference/kimisettings/) · [createKimiConversations](../../reference/createkimiconversations/) · [agentVersions](../../reference/agentversions/).
