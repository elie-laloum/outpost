---
title: "Docker et Podman"
description: "Docker et Podman — Outpost"
sidebar:
  order: 2
---

Docker et Podman partagent leur configuration. Construisez l’image du projet avec [le CLI d’images](../../start/cli-images/) avant d’allouer une sandbox.

```ts
import { docker } from "@elie-laloum/outpost/providers/docker";

const provider = docker({
  image: "outpost:project",
  cpus: 2,
  memoryMb: 4096,
  networks: ["development"],
  volumes: [
    {
      source: "~/.config/example",
      target: "~/.config/example",
      readOnly: true,
    },
  ],
  variables: { PROJECT_MODE: "test" },
});
console.log(provider.name);
```

## Options

| Option              | Signification                                                               |
| ------------------- | --------------------------------------------------------------------------- |
| `image`             | Défaut : `outpost:<répertoire-du-dépôt-normalisé>`.                         |
| `user`              | `{ uid, gid }` explicite ; sinon IDs POSIX de l’hôte, ou 1000 sous Windows. |
| `volumes`           | Montages source/cible et `readOnly` facultatif.                             |
| `networks`          | Nom de réseau ou tableau de noms.                                           |
| `groups`, `devices` | Groupes supplémentaires et correspondances de périphériques.                |
| `cpus`, `memoryMb`  | Contraintes de ressources du moteur.                                        |
| `label`             | SELinux `z` (défaut Linux), `Z` ou `false`.                                 |
| `retain`            | Taille de la fin de sortie conservée.                                       |
| `userns`            | Podman : `"keep-id"` ou `false`.                                            |
| `variables`         | Environnement du provider.                                                  |

Les sources acceptent `~`, chemins relatifs ou absolus. Les cibles relatives partent de `/workspace` ; `~` cible le home de l’agent. Un montage de fichier individuel doit cibler le home ; ailleurs, montez un répertoire. Les parents manquants sont préparés pour l’UID/GID de l’agent.

Les containers utilisent un home privé éphémère, des capacités réduites, no-new-privileges et un processus init. Seuls les montages sélectionnés et les métadonnées Git nécessaires sont exposés ; le socket Docker n’est pas monté automatiquement. L’annulation arrête le groupe de la commande sans détruire le container actif.

## Différences entre plateformes

Les contrôles préalables signalent les écarts d’UID de l’image lorsqu’aucun utilisateur explicite n’est fourni. Podman gère les espaces utilisateurs rootless ; sa machine doit être démarrée sur macOS. Linux utilise les labels SELinux, Windows/macOS la syntaxe bind-mount. Les chemins Git des worktrees Windows sont adaptés aux containers Linux.

En cas de problème de droits, vérifiez ensemble UID/GID de l’image, propriétaire hôte, espace utilisateur Podman et SELinux. N’exposez pas des répertoires sans rapport pour contourner l’erreur.
