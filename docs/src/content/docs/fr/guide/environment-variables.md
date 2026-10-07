---
title: "Transmettre des variables d’environnement"
description: "Déclarez les variables transmises à la sandbox, à l’agent et aux commandes."
---

## Choisir où déclarer une variable

Déclarez chaque variable là où elle est utile : sur le fournisseur de sandbox, sur le harness d’un agent ou sur une commande. Outpost transmet les noms déclarés ; choisissez le périmètre qui couvre les processus ayant besoin de la valeur.

| Où                                    | Atteint                                                         | Pour                                                 |
| ------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------- |
| `variables` du fournisseur de sandbox | Toutes les commandes de la sandbox, agent compris               | Réglages d’outils comme `CI` ou `NODE_ENV`           |
| `variables` du harness (agents CLI)   | Les processus de l’agent uniquement                             | Clés d’API, réglages de l’agent, secrets MCP         |
| `variables` d’une commande            | Cette seule commande                                            | Une surcharge ponctuelle                             |
| `.outpost/.env` dans le dépôt cible   | Toutes les commandes de la sandbox, comme celles du fournisseur | Des valeurs gardées hors du code, propres à un dépôt |

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  variables: { CI: "true", NODE_ENV: "test" },
});

export const coder = createAgent({
  harness: createClaudeHarness({
    authentication: "usage",
    variables: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "" },
  }),
});
```

Les valeurs sont des chaînes. Sélectionnez chaque nom dans `process.env` explicitement : recopier tout `process.env` enverrait chaque secret de l’hôte dans la sandbox. Les `variables` par commande sont présentées dans [Sessions de sandbox](../sandbox-sessions/).

Chargez les noms déclarés depuis un [gestionnaire de secrets](../secret-sources/) avec `fromSecrets()` avant de composer l’agent ou la sandbox. Les adapters Vault/OpenBao, 1Password, Infisical, AWS, Google Cloud et Azure renvoient des variables sans fichier d’environnement.

## Comprendre la priorité des valeurs

Quand un nom apparaît à plusieurs endroits, la source la plus spécifique l’emporte :

`.outpost/.env` → fournisseur de sandbox → harness → commande

Outpost définit aussi `GIT_AUTHOR_*` et `GIT_COMMITTER_*` d’après la configuration Git du dépôt ; toute source déclarée les remplace.

:::caution
Un même nom ne peut pas être déclaré à la fois sur le harness et sur le fournisseur de sandbox. Le dispatch échoue avant le démarrage de l’agent avec `Agent and sandbox variables overlap: NAME` (code `configuration`).
:::

## Garder des valeurs dans `.outpost/.env`

Outpost lit `.outpost/.env` à la racine du dépôt cible quand il prépare une sandbox. Un fichier absent est ignoré.

```sh title=".outpost/.env"
NODE_ENV=test
LINEAR_API_KEY=
```

Une valeur non vide est utilisée telle quelle. Une déclaration vide comme `LINEAR_API_KEY=` prend la valeur dans l’environnement du processus qui exécute Outpost. Les lignes acceptent `export`, les guillemets et les commentaires `#` en fin de ligne.

:::caution
Gardez ce fichier hors de Git. Une ligne `.env` dans `.gitignore` le couvre.
:::

## Charger un fichier dans votre script

Node.js peut charger un fichier d’environnement avant d’exécuter votre script :

```sh
node --env-file=.env run.ts
```

Votre code choisit ensuite les valeurs à transmettre avec `variables`. Charger le fichier dans Node.js ne transmet pas automatiquement son contenu à la sandbox. Le chemin `.env` est relatif au dossier depuis lequel vous lancez la commande.

## Secrets des serveurs MCP et du harness intégré

Les [serveurs MCP](../mcp-servers/) nomment leurs secrets ; Outpost n’écrit jamais les valeurs dans leur configuration.

<!-- features -->

- [Agents CLI](../choose-an-agent/): Déclarez le secret dans les `variables` du harness, sur le fournisseur de sandbox ou dans `.outpost/.env`.
- [Harness intégré](../harness/): `createHarness()` n’a pas de `variables`. Déclarez le secret sur le fournisseur de sandbox ou dans `.outpost/.env`.
- [Fournisseurs de modèle](../model-providers/): L’`apiKey` reste sur l’hôte, dans votre code. Ne la transmettez pas à la sandbox.

Un secret manquant échoue avant le démarrage du serveur, avec `Missing NAME`.

## Hôte ou sandbox

Déclarez uniquement ce dont le code de la sandbox a besoin. Les clés d’allocation de sandbox et de stockage restent sur l’hôte avec leurs clients : voir [Authentification](../authentication/).

## Limites

- Avec l’[exécution sur l’hôte](../host-process/), les commandes héritent aussi de tout l’environnement du processus Outpost.
- Un `process.env.NAME ?? ""` non défini transmet une chaîne vide, pas une variable absente.

API : [Variables](../../reference/variables/) · [Command](../../reference/command/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createClaudeHarness](../../reference/createclaudeharness/) · [createHarness](../../reference/createharness/).
