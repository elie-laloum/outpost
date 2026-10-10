---
title: "Exécuter dans le cloud"
description: "Configurez Vercel ou Daytona et synchronisez le travail de l’agent avec votre dépôt."
---

## Prérequis

Installez le SDK du fournisseur cloud choisi à côté d’Outpost. La sandbox s’exécute à distance : votre machine n’a donc pas besoin de Docker ou de Podman.

```sh
npm install @vercel/sandbox   # Vercel
npm install @daytona/sdk      # Daytona
```

L’hôte a besoin d’identifiants d’allocation pour créer les sandboxes. Ils restent sur l’hôte et sont distincts des [identifiants de l’agent](../authentication/), qu’Outpost installe dans le répertoire personnel privé de la sandbox.

| Fournisseur | Identifiants d’allocation sur l’hôte                                                                      |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| Vercel      | `VERCEL_OIDC_TOKEN` (obtenu par `npx vercel env pull`), ou `token`, `teamId` et `projectId` dans `create` |
| Daytona     | `DAYTONA_API_KEY`, ou `apiKey` dans `connection`                                                          |

L’image de la sandbox doit fournir `sh` et `git` pour synchroniser le dépôt, et `node` pour transmettre des entrées à l’agent en direct.

## Vercel Sandbox

Vercel arrête une sandbox après `create.timeout` millisecondes : choisissez une durée supérieure à celle de votre tâche.

```ts
import { createVercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

export const sandboxProvider = createVercelSandboxProvider({
  repositoryMode: "isolated",
  create: { runtime: "node24", timeout: 30 * 60_000 },
});
```

Référence API : [VercelOptions](../../reference/verceloptions/).

API : [createVercelSandboxProvider](../../reference/createvercelsandboxprovider/) · [VercelOptions](../../reference/verceloptions/).

## Daytona Sandbox

Créez un fournisseur Daytona avec une image Node.js 24. Utilisez ce `sandboxProvider` dans votre configuration ou passez-le directement à la tâche, comme dans l’exemple ci-dessous.

```ts
import { createDaytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";

export const sandboxProvider = createDaytonaSandboxProvider({
  repositoryMode: "isolated",
  connection: { apiKey: process.env.DAYTONA_API_KEY ?? "" },
  create: { image: "node:24" },
});
```

Référence API : [DaytonaOptions](../../reference/daytonaoptions/).

API : [createDaytonaSandboxProvider](../../reference/createdaytonasandboxprovider/) · [DaytonaOptions](../../reference/daytonaoptions/).

Configurez `caches: [{ name: "npm", key: "app-node24", transport: s3 }]` pour restaurer les téléchargements avant la préparation et les sauvegarder avant la destruction du sandbox. Consultez les [caches de dépendances cloud](../environment-setup/#réutiliser-les-téléchargements-dans-le-cloud) pour S3, la compatibilité, la concurrence et la conservation.

## Comparer Vercel et Daytona

|                                              | Vercel                                                    | Daytona                                          |
| -------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| `attach()`                                   | Non : les terminaux interactifs sont refusés              | Oui, via l’API PTY de Daytona                    |
| [Entrées en direct](../steering/)            | Chaque instruction est ajoutée à un fichier de la sandbox | Idem                                             |
| [Règles de sortie](../network-restrictions/) | Pare-feu natif : domaines, CIDR autorisés et refusés      | Confirmées par Daytona : domaines ou CIDR IPv4   |
| Facturation                                  | Jusqu’à l’arrêt de la sandbox par Outpost                 | Jusqu’à la suppression de la sandbox par Outpost |

Chaque instruction en direct coûte une commande du fournisseur : un wrapper lancé avec l’agent lit le fichier et alimente son entrée standard.

## Lancer une tâche

Passez le fournisseur à `dispatch()` ou à `createSandbox()`, comme pour toute sandbox.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { createDaytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";
import { coder, repository } from "./outpost.config.ts";

const result = await dispatch({
  agent: coder,
  repository,
  sandboxProvider: createDaytonaSandboxProvider({
    create: { image: "node:24" },
  }),
  hooks: { sandboxReady: [{ executable: "npm", arguments: ["ci"] }] },
  brief: {
    text: "Fix the failing test in src/date.test.ts and commit the fix.",
  },
});
console.log(result.branch, result.commits.length);
// Example output: outpost/job-… 1
```

Avant le premier tour, Outpost installe la CLI de l’agent, dans sa version épinglée, si l’image ne la contient pas ; c’est le cas sur toute sandbox distante. Définissez `bootstrap: false` quand l’image doit la fournir. Le hook `sandboxReady` installe ensuite les dépendances du projet ([Préparer l’environnement](../environment-setup/)).

`dispatch()` libère la sandbox à son retour. Fermez une sandbox créée par `createSandbox()` dans un `finally`, ou avec `await using` : le fournisseur la facture jusque-là.

## Workspaces de fichiers

Les workspaces copiés et éphémères utilisent les ports de transfert streamé existants. Vercel et Daytona refusent les montages de source. Une fermeture normale settled peut précéder une restauration portable ; les snapshots n’attestent pas la destruction d’une allocation inconnue après arrêt brutal. La validation cloud live des modes de fichiers reste à réaliser. Voir [les capacités fournisseurs](../workspaces/).

## Limites

- **Toutes les références**: Le archive d’historique contient toutes les branches et tous les tags du dépôt, pas seulement la branche de travail.
- **Délai des commandes**: `sandbox.command()` sans `deadlineMs` s’arrête au bout de 10 minutes. Les tours de l’agent suivent leurs propres [limites](../limits-and-cancellation/).
- **Fin de sortie**: Le résultat d’une commande garde les 64 derniers Kio de chaque flux. L’option `retain` du fournisseur le modifie.
- **Installation de la CLI**: Elle demande `npm` (ou `curl` pour Antigravity) et un accès réseau dans la sandbox. Avec un [agent de repli](../fallback-agents/), chaque candidat est préparé lorsqu’il est sélectionné, sauf si l’installation automatique est désactivée.
- **Arrêts imprévus**: Outpost libère les sandboxes sur `SIGINT` et `SIGTERM`. Un processus tué laisse la sandbox tourner jusqu’au délai propre du fournisseur.

Implémenter un autre fournisseur distant : [Ajouter un fournisseur de sandbox](../custom-sandbox-providers/).

API : [SandboxOptions](../../reference/sandboxoptions/) · [EgressPolicy](../../reference/egresspolicy/).

## Pour continuer

- [Comprendre quels fichiers sont synchronisés](../remote-synchronization/)

<span id="accès-au-dépôt"></span>
<span id="choisir-la-branche"></span>
<span id="envoyer-des-fichiers-absents-de-git"></span>
<span id="quand-la-synchronisation-sarrête"></span>
