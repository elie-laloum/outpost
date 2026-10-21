---
title: "Exécuter sur votre machine"
description: "Exécutez directement l’agent installé sur votre machine avec le fournisseur local."
---

## Prérequis

Installez l’outil de l’agent et les outils du projet sur votre machine. Rendez l’agent accessible dans `PATH`, puis connectez-vous ou configurez son accès API. Le fournisseur local utilise directement ces outils ; aucune image n’est nécessaire.

:::caution
Rien n’est isolé. L’agent et chaque commande qu’il lance agissent sous votre utilisateur, avec vos fichiers, vos variables d’environnement et votre réseau. Réservez ce fournisseur au code de confiance ; voir [Sécurité](../security/).
:::

## Configurer

Créez le fournisseur avec `createLocalSandboxProvider()` et passez-le à `dispatch()`, comme tout autre fournisseur de sandbox.

```ts title="host.ts"
import { dispatch } from "@elie-laloum/outpost/core";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";
import { coder, repository } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider: createLocalSandboxProvider(),
  agent: coder,
  branch: { mode: "named", name: "outpost/host-fix" },
  brief: { text: "Fix the failing unit test and commit the fix." },
});
console.log(result.commits);
// Example output: [ { oid: '8f3a21c…', subject: 'Fix the failing test' } ]
```

L’agent lance votre CLI installée dans un worktree de `outpost/host-fix`. `variables` ajoute des [variables d’environnement](../environment-variables/) à l’environnement de votre processus.

## Ce qui change par rapport à un conteneur

| Aspect                          | [Docker et Podman](../containers/)                     | Exécution sur l’hôte                                                                            |
| ------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Isolation                       | Conteneur aux privilèges réduits                       | Aucune                                                                                          |
| CLI de l’agent et outils        | Fournis par l’[image d’agent](../agent-images/)        | Installés par vous ; Outpost n’installe rien                                                    |
| Environnement                   | Variables déclarées uniquement                         | Environnement de votre processus, plus les variables déclarées                                  |
| Authentification par compte     | Connexion de l’hôte copiée dans la sandbox             | La connexion de la CLI elle-même ; Outpost transmet des variables, aucun fichier d’identifiants |
| Répertoire personnel de l’agent | Privé et éphémère                                      | Votre propre répertoire personnel                                                               |
| Conversations natives           | Capturées depuis le répertoire personnel de la sandbox | Conservées dans les stockages de votre CLI                                                      |
| `attach()` interactif           | Pris en charge                                         | Pris en charge                                                                                  |
| Règles sortantes (`egress`)     | `deny-all`                                             | Non prises en charge                                                                            |

## Accès au dépôt

L’agent travaille dans le répertoire fixé par votre [politique de branche](../workspaces/). Sans `branch`, c’est votre checkout tel quel ; avec `named` ou `integrate`, un worktree sous `.outpost/workspaces/`.

Les workflows, les conversations et les [sessions de sandbox](../sandbox-sessions/) fonctionnent sans changement.

## Transférer des fichiers

Les transferts locaux, Docker et Podman suivent les mêmes règles de chemins : une destination d’upload ou une source de download relative est résolue depuis la racine de la sandbox. Les chemins côté hôte sont relatifs au répertoire courant de l’appelant. Un répertoire de destination existant reçoit la source sous son nom ; utilisez `source/.` pour y copier directement le contenu d’un répertoire. Une destination absente devient elle-même le fichier ou répertoire copié.

Les fichiers conservent leurs octets binaires et permissions ; les liens symboliques sources restent des liens. Les transferts locaux et les downloads conteneurs refusent les chemins de destination qui traversent des liens symboliques. Les transferts locaux respectent aussi `signal` et `deadlineMs`. Le fournisseur local reste sans isolation : ces contrôles ne limitent pas l’accès hôte au workspace.

## Limites

- Passer `egress` lève une erreur : utilisez un conteneur ou une sandbox cloud pour les [restrictions réseau](../network-restrictions/).
- Les [serveurs MCP](../mcp-servers/) déclarés pour Kimi Code ou Antigravity sont fusionnés dans `~/.kimi-code/mcp.json` ou `~/.gemini/config/mcp_config.json` de votre répertoire personnel, et y restent après l’exécution.
- `{ account: { file } }` est ignoré : la CLI utilise la connexion enregistrée dans votre répertoire personnel.

API : [createLocalSandboxProvider](../../reference/createlocalsandboxprovider/) · [LocalOptions](../../reference/support-localoptions/).
