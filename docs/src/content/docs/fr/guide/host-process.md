---
title: "Exécution sur l’hôte"
description: "Exécuter les agents directement sur votre machine, avec vos outils et vos connexions, quand vous faites confiance au code qu’ils exécutent."
---

## Prérequis

Installez la CLI de l’agent dans votre `PATH` et connectez-vous avec elle, ou définissez sa clé d’API pour l’[accès par API](../authentication/). Installez vous-même les dépendances et les outils du projet : aucune image n’intervient.

:::caution
Rien n’est isolé. L’agent et chaque commande qu’il lance agissent sous votre utilisateur, avec vos fichiers, vos variables d’environnement et votre réseau. Réservez ce provider au code de confiance ; voir [Sécurité](../security/).
:::

## Configurer

Créez le provider avec `createLocalSandboxProvider()` et passez-le à `dispatch()`, comme tout autre provider de sandbox.

```ts title="host.mts"
import { dispatch } from "@elie-laloum/outpost";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";
import { coder, repository } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider: createLocalSandboxProvider(),
  agent: coder,
  branch: { mode: "named", name: "outpost/host-fix" },
  brief: { text: "Fix the failing unit test and commit the fix." },
});
console.log(result.commits);
```

L’agent lance votre CLI installée dans un worktree de `outpost/host-fix`. `variables` ajoute des [variables d’environnement](../environment-variables/) à l’environnement de votre processus.

## Ce qui change par rapport à un conteneur

| Aspect                      | [Docker et Podman](../containers/)              | Exécution sur l’hôte                                                                            |
| --------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Isolation                   | Conteneur aux privilèges réduits                | Aucune                                                                                          |
| CLI de l’agent et outils    | Fournis par l’[image d’agent](../agent-images/) | Installés par vous ; Outpost n’installe rien                                                    |
| Environnement               | Variables déclarées uniquement                  | Environnement de votre processus, plus les variables déclarées                                  |
| Authentification par compte | Connexion de l’hôte copiée dans la sandbox      | La connexion de la CLI elle-même ; Outpost transmet des variables, aucun fichier d’identifiants |
| Home de l’agent             | Privé et éphémère                               | Votre propre répertoire personnel                                                               |
| Conversations natives       | Capturées depuis le home de la sandbox          | Conservées dans les stockages de votre CLI                                                      |
| `attach()` interactif       | Pris en charge                                  | Pris en charge                                                                                  |
| Règles sortantes (`egress`) | `deny-all`                                      | Non prises en charge                                                                            |

## Accès au dépôt

L’agent travaille dans le répertoire fixé par votre [politique de branche](../repository-and-branch/). Sans `branch`, c’est votre checkout tel quel ; avec `named` ou `integrate`, un worktree sous `.outpost/workspaces/`.

Les workflows, les conversations et les [sessions de sandbox](../sandbox-sessions/) fonctionnent sans changement.

## Limites

- Passer `egress` lève une erreur : utilisez un conteneur ou une sandbox cloud pour les [restrictions réseau](../network-restrictions/).
- Les [serveurs MCP](../mcp-servers/) déclarés pour Kimi Code ou Antigravity sont fusionnés dans `~/.kimi-code/mcp.json` ou `~/.gemini/config/mcp_config.json` de votre répertoire personnel, et y restent après l’exécution.
- `{ account: { file } }` est ignoré : la CLI utilise la connexion enregistrée dans votre répertoire personnel.

API : [createLocalSandboxProvider](../../reference/createlocalsandboxprovider/) · [LocalOptions](../../reference/support-localoptions/).
