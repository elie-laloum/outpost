---
title: "Sandboxes cloud"
description: "Exécuter les agents dans des sandboxes Vercel ou Daytona : Outpost téléverse le dépôt, exécute l’agent à distance et rapatrie ses commits sur votre machine."
---

## Prérequis

Installez le SDK de votre provider à côté d’Outpost. Aucun moteur de conteneurs local n’est nécessaire.

```sh
npm install @vercel/sandbox   # Vercel
npm install @daytona/sdk      # Daytona
```

L’hôte a besoin d’identifiants d’allocation pour créer les sandboxes. Ils restent sur l’hôte et sont distincts des [identifiants de l’agent](../authentication/), qu’Outpost installe dans le home privé de la sandbox.

| Provider | Identifiants d’allocation sur l’hôte                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------- |
| Vercel   | `VERCEL_OIDC_TOKEN` (obtenu par `npx vercel env pull`), ou `token`, `teamId` et `projectId` dans `create` |
| Daytona  | `DAYTONA_API_KEY`, ou `apiKey` dans `connection`                                                          |

L’image de la sandbox doit fournir `sh` et `git` pour synchroniser le dépôt, et `node` pour transmettre des entrées à l’agent en direct.

## Vercel Sandbox

```ts
import { createVercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

export const sandboxProvider = createVercelSandboxProvider({
  create: { runtime: "node24", timeout: 30 * 60_000 },
});
```

Vercel arrête une sandbox après `create.timeout` millisecondes : choisissez une durée supérieure à celle de votre tâche.

<!-- features -->

- `create`: Transmet les réglages de création au SDK Vercel : runtime, image ou `source` de snapshot, `resources`, `timeout`.
  - `runtime`
  - `timeout`
- `root`: Fixe l’emplacement du dépôt dans la sandbox. Par défaut, `/vercel/sandbox/outpost`.
  - `root`
- `variables`: Déclare les [variables](../environment-variables/) que reçoit chaque commande de la sandbox.
  - `variables`

API : [createVercelSandboxProvider](../../reference/createvercelsandboxprovider/) · [VercelOptions](../../reference/verceloptions/).

## Daytona Sandbox

```ts
import { createDaytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";

export const sandboxProvider = createDaytonaSandboxProvider({
  connection: { apiKey: process.env.DAYTONA_API_KEY ?? "" },
  create: { image: "node:24" },
});
```

<!-- features -->

- `connection`: Configure le client Daytona : clé d’API, URL de l’API, région cible.
  - `apiKey`
  - `target`
- `create`: Choisit une `image` ou un `snapshot`, avec les ressources et l’arrêt automatique.
  - `image`
  - `snapshot`
- `root`: Fixe l’emplacement du dépôt dans la sandbox. Par défaut, `outpost` dans le home de l’utilisateur de la sandbox.
  - `root`
- `variables`: Déclare les [variables](../environment-variables/) que reçoit chaque commande de la sandbox.
  - `variables`

API : [createDaytonaSandboxProvider](../../reference/createdaytonasandboxprovider/) · [DaytonaOptions](../../reference/daytonaoptions/).

## Comparer Vercel et Daytona

|                                              | Vercel                                                    | Daytona                                          |
| -------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| `attach()`                                   | Non : les terminaux interactifs sont refusés              | Oui, via l’API PTY de Daytona                    |
| [Entrées en direct](../steering/)            | Chaque instruction est ajoutée à un fichier de la sandbox | Idem                                             |
| [Règles de sortie](../network-restrictions/) | Pare-feu natif : domaines, CIDR autorisés et refusés      | Confirmées par Daytona : domaines ou CIDR IPv4   |
| Facturation                                  | Jusqu’à l’arrêt de la sandbox par Outpost                 | Jusqu’à la suppression de la sandbox par Outpost |

Chaque instruction en direct coûte une commande du provider : un wrapper lancé avec l’agent lit le fichier et alimente son entrée standard.

## Lancer une tâche

Passez le provider à `dispatch()` ou à `createSandbox()`, comme pour toute sandbox.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { createDaytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";
import { coder, repository } from "./outpost.config.mts";

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
```

Avant le premier tour, Outpost installe la CLI de l’agent, dans sa version épinglée, si l’image ne la contient pas ; c’est le cas sur toute sandbox distante. Définissez `bootstrap: false` quand l’image doit la fournir. Le hook `sandboxReady` installe ensuite les dépendances du projet ([Préparer l’environnement](../environment-setup/)).

`dispatch()` libère la sandbox à son retour. Fermez une sandbox créée par `createSandbox()` dans un `finally`, ou avec `await using` : le provider la facture jusque-là.

## Accès au dépôt

La sandbox travaille sur sa propre copie du dépôt. Outpost la maintient alignée sur le worktree géré de votre machine. Les sandboxes [Firecracker](../firecracker/) et les conteneurs en [Git privé](../private-git/) se synchronisent de la même façon.

<!-- flow -->

1. **Téléverser**: Au démarrage de la sandbox.
   - **Envoyer l’historique**: Un bundle Git du dépôt, extrait sur la branche de travail.
     - hôte
     - sandbox
   - **Envoyer les fichiers choisis**: Les `copies`, et le travail non commité quand `includeUncommitted` est activé.
     - hôte
     - sandbox
2. **Exécuter**: L’agent travaille et commite dans la sandbox.
   - **Exécuter l’opération**: `dispatch()`, `command()` ou `attach()`.
     - sandbox
3. **Rapatrier**: Après chaque opération.
   - **Télécharger**: Les nouveaux commits, les modifications non commitées et les nouveaux fichiers non suivis.
     - sandbox
   - **Valider**: Vérifier les commits et que le worktree n’a pas changé entre-temps.
     - hôte
   - **Sauvegarder**: Enregistrer l’état du worktree sous `.outpost/recovery`.
     - hôte
   - **Appliquer**: Avancer la branche de travail en fast-forward et appliquer les modifications.
     - hôte

## Choisir la branche

Sans `branch`, une sandbox cloud utilise `integrate` : une nouvelle branche `outpost/job-…`, fusionnée dans votre branche courante à la fin. `named` garde le travail sur une branche que vous nommez. `current` est refusé, car la sandbox ne peut pas modifier votre checkout sur place. Voir [Dépôt et branche](../repository-and-branch/).

## Envoyer des fichiers absents de Git

La sandbox ne reçoit que les fichiers commités. Deux options en ajoutent d’autres.

<!-- features -->

- `copies`: Copie des chemins de votre checkout dans le worktree, puis les téléverse. Pour des entrées ignorées comme `.env.test`.
  - votre checkout
- `includeUncommitted`: Envoie les modifications non commitées du worktree géré et ses fichiers non suivis et non ignorés.
  - worktree géré
- **Commiter d’abord**: Les commits de la branche de travail voyagent avec l’historique.
  - Git

:::caution
`includeUncommitted` lit le worktree géré sous `.outpost/workspaces`, pas votre checkout. Les modifications non commitées de votre checkout n’atteignent la sandbox que par `copies`.
:::

Une copie exclue par `.gitignore` voyage dans un seul sens : les modifications que l’agent y apporte restent dans la sandbox. Toute autre copie devient du travail non commité dans le worktree : passez alors `includeUncommitted: true`.

## Quand la synchronisation s’arrête

Outpost n’écrase jamais un travail qu’il ne peut pas sauvegarder. Il s’arrête sur une erreur de code `workspace` dont `details.recovery` désigne le dossier de `.outpost/recovery` qui contient les changements téléchargés et la sauvegarde. Inspectez-le avec [Récupérer du travail](../recovery/).

| Cause                                                                             | Solution                                                                   |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Le worktree géré a changé pendant que la sandbox était ouverte                    | Ne touchez pas à `.outpost/workspaces` pendant l’exécution                 |
| L’agent a modifié un fichier non commité dans le worktree                         | Commitez d’abord le fichier, ou passez `includeUncommitted: true`          |
| Une copie n’est pas exclue par le `.gitignore` commité (première synchronisation) | Passez `includeUncommitted: true`, ou ignorez le fichier dans `.gitignore` |
| L’agent a créé un fichier que votre hôte ignore hors de `.gitignore`              | Déplacez la règle d’exclusion dans le `.gitignore` commité                 |
| L’agent a réécrit un commit déjà synchronisé                                      | Demandez de nouveaux commits plutôt qu’un amend ou un rebase               |

`recoveryTransport` sur `dispatch()` ou `createSandbox()` archive aussi chaque sauvegarde dans un [stockage objet](../object-storage/).

## Limites

- **Toutes les références**: Le bundle d’historique contient toutes les branches et tous les tags du dépôt, pas seulement la branche de travail.
- **Délai des commandes**: `sandbox.command()` sans `deadlineMs` s’arrête au bout de 10 minutes. Les tours de l’agent suivent leurs propres [limites](../limits-and-cancellation/).
- **Fin de sortie**: Le résultat d’une commande garde les 64 derniers Kio de chaque flux. L’option `retain` du provider le modifie.
- **Installation de la CLI**: Elle demande `npm` (ou `curl` pour Antigravity) et un accès réseau dans la sandbox. Avec un [agent de repli](../fallback-agents/), seul le premier candidat est installé.
- **Arrêts imprévus**: Outpost libère les sandboxes sur `SIGINT` et `SIGTERM`. Un processus tué laisse la sandbox tourner jusqu’au délai propre du provider.

Implémenter un autre provider distant : [Ajouter un provider de sandbox](../custom-sandbox-providers/).

API : [SandboxOptions](../../reference/sandboxoptions/) · [EgressPolicy](../../reference/egresspolicy/).
