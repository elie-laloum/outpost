---
title: "Choisir une sandbox"
description: "Choisissez où l’agent exécute ses commandes : conteneur, cloud, microVM ou machine locale."
---

## Environnements disponibles

Commencez avec Docker ou Podman pour travailler dans un conteneur local. Pour une exécution hébergée, utilisez Vercel ou Daytona. Le fournisseur de sandbox détermine où les commandes s’exécutent ; vous le choisissez indépendamment de l’agent.

<!-- features -->

- [Docker](../containers/): Le choix par défaut : un conteneur local démarré depuis une image que vous construisez.
  - monté
- [Podman](../containers/): Le même fournisseur de conteneur sur le moteur Podman, y compris en mode rootless.
  - monté
- [Vercel](../cloud-sandboxes/): Une sandbox hébergée, sans moteur local.
  - distant
- [Daytona](../cloud-sandboxes/): Une sandbox hébergée qui accepte aussi les terminaux interactifs.
  - distant
- [Firecracker](../firecracker/): Une microVM sur un hôte Linux avec KVM que vous préparez.
  - distant
- [Exécution sur l’hôte](../host-process/): Les commandes s’exécutent directement sur votre machine, sans isolation.
  - hôte

## Choisir selon votre besoin

<!-- path -->

1. [Docker et Podman](../containers/): Un environnement reproductible sur votre machine ou un runner de CI. Commencez ici.
2. [Sandboxes cloud](../cloud-sandboxes/): Un travail qui doit tourner hors de l’hôte, avec des listes de destinations autorisées.
3. [MicroVM Firecracker](../firecracker/): Un noyau invité distinct, sur une infrastructure que vous exploitez.
4. [Exécution sur l’hôte](../host-process/): Du code de confiance qui a besoin des outils installés sur votre machine.

## Configurer le fournisseur

Importez le fournisseur depuis son sous-chemin et passez-le dans `sandboxProvider`. L’agent, le brief et la branche ne changent pas.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { createVercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";
import { coder, repository } from "./outpost.config.ts";

const result = await dispatch({
  agent: coder,
  repository,
  sandboxProvider: createVercelSandboxProvider(),
  brief: { text: "Fix the broken links in the README and commit the change." },
});
console.log(result.branch, result.commits.length);
```

Chaque fournisseur a son propre sous-chemin, `@elie-laloum/outpost/providers/<name>` : `docker`, `podman`, `vercel`, `daytona`, `firecracker` et `local`. Sans `sandboxProvider`, Outpost utilise Docker.

Vercel et Daytona chargent leur SDK au moment d’allouer une sandbox. Installez-le à côté d’Outpost : `npm install @vercel/sandbox` ou `npm install @daytona/sdk`. Les autres fournisseurs ne demandent aucun paquet supplémentaire.

## Comparer les environnements

|                                                         | Docker, Podman       | Vercel                          | Daytona                   | Firecracker                       | Hôte                     |
| ------------------------------------------------------- | -------------------- | ------------------------------- | ------------------------- | --------------------------------- | ------------------------ |
| Accès au dépôt                                          | Worktree monté       | Snapshot téléversé              | Snapshot téléversé        | Snapshot téléversé                | Système de fichiers hôte |
| Isolation                                               | Conteneur            | Sandbox hébergée                | Sandbox hébergée          | MicroVM                           | Aucune                   |
| [`attach()`](../sandbox-sessions/) interactif           | Oui                  | Non                             | Oui                       | Non                               | Oui                      |
| Entrée en direct pour la [réorientation](../steering/)  | Oui                  | Oui                             | Oui                       | Oui                               | Oui                      |
| [Caches de dépendances](../containers/)                 | Oui                  | Non                             | Non                       | Non                               | Non                      |
| [Règles de sortie](../network-restrictions/)            | `deny-all` seulement | Oui                             | Oui, avec des limites     | Non                               | Non                      |
| Reprise de la [spéculation durable](../speculation/)    | Oui                  | Non                             | Non                       | Non                               | Non                      |
| Installe un CLI d’agent manquant                        | Non                  | Oui                             | Oui                       | Oui                               | Non                      |
| [Mode de branche](../repository-and-branch/) par défaut | `current`            | `integrate`                     | `integrate`               | `integrate`                       | `current`                |
| Préparation                                             | Moteur et image      | `@vercel/sandbox`, identifiants | `@daytona/sdk`, clé d’API | Hôte KVM, noyau, rootfs, TAP, SSH | CLI d’agent et outils    |

Les fournisseurs distants (Vercel, Daytona, Firecracker) travaillent sur une copie de l’historique Git. Si un CLI pris en charge manque, ils l’installent avant le premier tour, sauf si vous passez `bootstrap: false`. Ils refusent le mode de branche `current`.

Avec `repositoryMode: "isolated"`, Docker et Podman se comportent comme un fournisseur distant : voir [Git privé](../private-git/). Ils perdent alors la reprise de spéculation durable, qui exige le mode monté par défaut.

## Limites

- Rien ne se replie sur l’hôte. Un moteur, un SDK ou un identifiant manquant fait échouer la tâche ; seul `createLocalSandboxProvider()` s’exécute sur l’hôte, et vous le choisissez explicitement.
- Un conteneur monté peut écrire dans les métadonnées Git du dépôt. Ce n’est pas une barrière contre un agent hostile : lisez [Sécurité](../security/).
- La synchronisation distante s’arrête plutôt que d’écraser des modifications concurrentes de l’hôte, et conserve les données de récupération. Voir [Sandboxes cloud](../cloud-sandboxes/).
- Un fournisseur Firecracker possède un périphérique TAP et exécute une seule VM à la fois. Créez un fournisseur par VM simultanée.

API : [SandboxProvider](../../reference/sandboxprovider/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [createVercelSandboxProvider](../../reference/createvercelsandboxprovider/) · [createDaytonaSandboxProvider](../../reference/createdaytonasandboxprovider/) · [createFirecrackerSandboxProvider](../../reference/createfirecrackersandboxprovider/) · [createLocalSandboxProvider](../../reference/createlocalsandboxprovider/).
