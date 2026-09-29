---
title: "Antigravity"
description: "Exécuter la CLI Antigravity de Google (agy) dans une sandbox, connectée avec votre compte Google ou une clé API Gemini."
---

## Installer

Les [images d’agent](../agent-images/) générées contiennent l’exécutable `agy`. Les [sandboxes cloud](../cloud-sandboxes/) l’installent à la première utilisation s’il manque, sauf avec `bootstrap: false`.

<!-- features -->

- **Version épinglée** : `agentVersions.antigravity`, téléchargée depuis les archives versionnées de Google.
- **Contrôle SHA-512** : Chaque archive est vérifiée avant extraction ; une empreinte incorrecte interrompt l’installation.
- **Pas de mise à jour automatique** : Les images, les exécutions et `doctor` définissent `AGY_CLI_DISABLE_AUTO_UPDATE=true`.

L’installateur prend en charge Linux amd64 et arm64 (glibc et musl) ainsi que macOS Intel et Apple Silicon. Les autres plateformes échouent.

Comparez la version installée à la version épinglée :

```sh
npx outpost doctor --agent antigravity --image outpost:dev
npx outpost doctor --agent antigravity --sandbox-provider local
```

`doctor` avertit quand les versions diffèrent. Il ne vérifie ni l’empreinte du binaire ni la connexion.

## Accès par compte

Lancez `agy` sur l’hôte et connectez-vous avec votre compte Google.

```ts
import { createAgent, createAntigravityHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createAntigravityHarness({ authentication: "account" }),
});
```

Outpost copie `~/.gemini/antigravity-cli/antigravity-oauth-token` dans le home privé de la sandbox. Pour un jeton rangé ailleurs, passez `{ account: { file: "/path/to/token" } }`. Voir [Authentification](../authentication/).

## Accès API

Déclarez `GEMINI_API_KEY`. L’usage de l’API Gemini est facturé séparément des forfaits Google AI.

```ts
import { createAgent, createAntigravityHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createAntigravityHarness({
    authentication: "usage",
    variables: { GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "" },
  }),
});
```

Outpost écrit aussi `~/.gemini/antigravity-cli/settings.json` dans le home de la sandbox pour sélectionner le fournisseur Gemini. `{ usage: { variable: "NAME" } }` lit la clé dans une autre variable déclarée.

## Ce qu’il prend en charge

<!-- features -->

- [Conversations](../conversations/) : Reprise dans la même [session de sandbox](../sandbox-sessions/) avec `sandbox.resume(id, options)` ou `resume()` sur un résultat à chaud.
- [Réparations de réponse](../typed-responses/) : Une réponse typée invalide est réparée dans cette même conversation.
- [Réorientation](../steering/) : Livrée en mode `resumed` : Outpost arrête `agy`, puis reprend la conversation avec votre texte.
- [Serveurs MCP](../mcp-servers/) : Fusionnés dans `~/.gemini/config/mcp_config.json` du home de l’agent.
- **Consommation** : Jetons d’entrée, en cache et de sortie par tour ; les jetons de réflexion comptent en sortie.
- **Modèle et mode** : Le `model` de l’agent devient `--model` ; `mode` passe `--mode accept-edits` ou `plan`.

Sans `mode`, les exécutions non interactives passent `--dangerously-skip-permissions` : c’est la sandbox qui borne ce que l’agent peut faire. Les terminaux interactifs conservent les demandes d’approbation de la CLI. [Choisir un agent](../choose-an-agent/) compare tous les agents.

## Limites

- Les conversations ne sont pas capturées : elles disparaissent avec la sandbox. La reprise à froid et `fork()` sont refusés, et `createAntigravityHarness()` refuse un store `conversations`.
- Un modèle avec `reasoning` ou `maxOutputTokens` est refusé à la composition de l’agent.
- Les options MCP `tools.include`, `startupTimeoutMs` et `oauth: "login"` sont refusées.
- Le bootstrap réutilise un `agy` déjà présent dans le PATH sans vérifier sa version ni son empreinte.

API : [createAntigravityHarness](../../reference/createantigravityharness/) · [AntigravitySettings](../../reference/antigravitysettings/) · [agentVersions](../../reference/agentversions/).
