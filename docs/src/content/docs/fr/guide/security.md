---
title: "Comprendre les limites de sécurité"
description: "Examinez les fichiers, les identifiants et les accès réseau disponibles pour les agents et le code hôte."
---

## Ce que l’agent peut atteindre

Un agent peut exécuter les commandes du projet avec les accès fournis par sa sandbox. Examinez l’environnement, les fichiers montés et les identifiants avant de lancer une tâche ; le fournisseur de sandbox détermine ces limites.

| Sandbox                                  | L’agent atteint                                                                                                                         | Frontière                                                                                     |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [Docker et Podman](../containers/)       | Le worktree et les métadonnées Git du dépôt, tous deux modifiables ; un répertoire personnel privé ; les variables déclarées.           | Un conteneur aux capacités retirées. Pas une frontière contre un agent hostile.               |
| [Git privé](../private-git/)             | Un checkout et un répertoire Git privés dans le conteneur ; un répertoire personnel privé ; les variables déclarées.                    | Vos métadonnées Git restent hors du conteneur. Les commits ne reviennent qu’après validation. |
| [Sandboxes cloud](../cloud-sandboxes/)   | Une copie de l’historique avec toutes les branches et tous les tags, les fichiers choisis, les identifiants et les variables déclarées. | Une sandbox hébergée dans votre compte cloud. Les commits ne reviennent qu’après validation.  |
| [Firecracker](../firecracker/)           | La même copie dans une microVM dotée de son propre noyau invité, jointe par SSH.                                                        | La VM, plus le jailer si vous l’activez. Vous exploitez l’hôte.                               |
| [Exécution sur l’hôte](../host-process/) | Tout ce que votre utilisateur atteint : fichiers, réseau, votre répertoire personnel et tout l’environnement de votre processus.        | Aucune.                                                                                       |

:::caution
Chaque volume, périphérique, réseau ou cache partagé ajouté élargit ces accès ; un montage en lecture seule expose malgré tout son contenu. Aucune de ces sandboxes n’est certifiée contre une évasion de conteneur ou du noyau.
:::

## Identifiants et données

Chaque donnée ne va que là où votre configuration l’envoie.

| Donnée                                               | Destination                                                                                                                                                                                                      |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Connexion de l’agent](../authentication/)           | Outpost lit sur l’hôte le fichier de connexion de la CLI choisie, jamais un trousseau système, et le copie dans le répertoire personnel privé de la sandbox. L’exécution sur l’hôte ne reçoit que des variables. |
| Clés d’API et [variables](../environment-variables/) | Dans l’environnement de la sandbox. L’agent peut toutes les lire.                                                                                                                                                |
| Clés du fournisseur et du stockage                   | Restent sur l’hôte, avec le client du [fournisseur cloud](../cloud-sandboxes/) ou du [transport](../storage/). Les agents ne les reçoivent jamais.                                                               |
| Dépôt et entrées                                     | Les sandboxes cloud et Firecracker reçoivent l’historique Git, les `copies` et, sur demande, le travail non commité.                                                                                             |
| Objets persistés                                     | Un transport reçoit les artefacts, journaux, checkpoints, transcriptions et données de reprise que vous lui confiez.                                                                                             |
| Transcriptions, logs et lots de reprise              | Conservés sur l’hôte ou dans votre transport. Ils peuvent contenir tout secret passé par l’agent.                                                                                                                |

Les [serveurs MCP](../mcp-servers/) agissent avec l’autorité de l’agent et reçoivent les variables que vous nommez. Leur configuration contient des noms de variables, jamais de valeurs. Une [connexion MCP](../mcp-oauth/) copiée dans une sandbox peut renouveler son refresh token et déconnecter l’hôte.

## Le code qui s’exécute sur votre hôte

La sandbox confine les commandes de l’agent, pas votre propre code. Ces éléments s’exécutent dans le processus Outpost ou sur l’hôte, avec vos droits.

<!-- features -->

- [Outils du harness](../harness-tools/): `execute` s’exécute dans le processus Outpost et n’atteint la sandbox que par `context.sandbox`.
- [Hooks du harness](../harness-permissions/): S’exécutent dans le processus Outpost à chaque étape de la boucle intégrée.
- [Fonctions du workflow](../task-dependencies/): Tâches, vérifications de boucle et vérificateurs de décision sont votre code, exécuté par le moteur de workflow.
- [Hooks de préparation](../environment-setup/): Les commandes `workspaceReady` et `hostReady` s’exécutent sur l’hôte, dans le worktree.
- [Code rapporté](../workspaces/): Les commits de l’agent arrivent dans votre dépôt : relisez-les avant de compiler ou de tester sur l’hôte.
- [Métadonnées Git](../containers/): Un agent monté peut écrire dans `.git` des hooks et une configuration que vos propres commandes Git exécuteront.

## Ce qu’Outpost n’authentifie pas

Outpost enregistre qui a fait quoi et écarte les processus d’écriture concurrents. Les contrôles d’identité et de droits restent dans votre application.

| Valeur                                                  | Ce qu’Outpost vérifie                         | Ce que vous vérifiez                                                   |
| ------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------- |
| `actor` d’une [approbation](../approvals/)              | Qu’il figure dans les `actors` du gate        | Qui est la personne et si elle peut décider.                           |
| Décision d’étape d’approbation signée                   | Une signature Ed25519 de la clé de l’acteur   | Que votre service de signature a authentifié la personne.              |
| `producer` d’un [artefact](../artifacts/)               | Que le contenu correspond à son empreinte     | Qui l’a publié : quiconque peut écrire dans le stockage le peut.       |
| Écritures conditionnelles et révisions                  | Les processus d’écriture périmés sont rejetés | L’identité du processus qui écrit.                                     |
| PID distant dans les données de [reprise](../recovery/) | Rien : c’est une métadonnée                   | Que le processus distant est arrêté avant de reprendre sa propriété.   |
| Entrée du [cache de tâches](../task-cache/)             | Sa clé et sa forme JSON                       | Qui peut écrire dans le transport : il choisit les valeurs restaurées. |
| Signature de [webhook](../webhooks/)                    | Que la requête vient de la source configurée  | Si `event.actor` peut lancer le workflow.                              |
| Jeton de [file HTTP](../job-queues/)                    | Que l’appelant détient un jeton configuré     | Qui le détient : un jeton accorde toutes les opérations de la file.    |

## Ce que couvrent les règles réseau

Les [restrictions réseau](../network-restrictions/) limitent les connexions sortantes de la sandbox. Elles ne régissent ni les montages, ni les identifiants, ni les sockets de l’hôte que vous lui exposez.

Le trafic qui part de l’hôte échappe à la politique : requêtes de modèle du harness intégré, téléchargements d’images et appels au plan de contrôle du cloud. Une destination autorisée peut toujours recevoir ce que l’agent lui envoie.

## Faire travailler des agents sur du code non fiable

Durcissez d’abord la sandbox. Ce fournisseur Docker garde vos métadonnées Git hors du conteneur et coupe son réseau :

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  repositoryMode: "isolated",
  egress: { mode: "deny-all" },
});
```

Sans réseau, un agent CLI ne peut pas joindre son modèle. Utilisez le [harness intégré](../harness/), dont les requêtes de modèle partent de votre hôte, ou une [sandbox cloud](../cloud-sandboxes/) avec une liste de domaines autorisés.

<!-- features -->

- **Isoler Git**: Utilisez le [Git privé](../private-git/), une sandbox cloud ou Firecracker, jamais l’exécution sur l’hôte.
- **Ne rien monter de plus**: N’ajoutez aucun volume, périphérique, socket de l’hôte ou cache partagé dont la tâche n’a pas besoin.
- **Limiter les identifiants**: Connectez-vous avec un profil dédié via `account.file` et ne déclarez que les clés utiles à la tâche.
- **Restreindre le réseau**: Bloquez les sorties ou limitez-les à une liste là où le fournisseur le permet.
- **Garder des hooks d’hôte fiables**: Lancez les scripts du projet dans `sandboxReady`, pas dans `hostReady` ni `workspaceReady`.
- **Relire avant d’exécuter**: Lisez le diff rapporté avant de le compiler, le tester ou le pousser depuis l’hôte.

## Limites

- Un conteneur monté n’est pas une frontière contre un agent hostile. Outpost désactive les hooks Git pour ses propres commandes, pas pour les vôtres ni pour l’outillage du projet.
- Le Git privé protège vos métadonnées Git, pas l’hôte. Vous faites toujours confiance à l’image, au moteur, au noyau et à chaque montage explicite.
- Avec le jailer Firecracker, le processus Outpost s’exécute en root. N’y lancez qu’un projet de workflow et une configuration de confiance.
- Un compte cloud conserve ce qu’Outpost y envoie selon ses propres règles de stockage et de réseau.

Signalez une vulnérabilité en privé selon la [politique de sécurité](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/SECURITY.md) du dépôt, sans identifiants réels.

API : [ContainerOptions](../../reference/containeroptions/) · [EgressPolicy](../../reference/egresspolicy/) · [AgentAuthentication](../../reference/agentauthentication/) · [createLocalSandboxProvider](../../reference/createlocalsandboxprovider/) · [defineHarnessTool](../../reference/defineharnesstool/) · [defineHarnessHook](../../reference/defineharnesshook/).
