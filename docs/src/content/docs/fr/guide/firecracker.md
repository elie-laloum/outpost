---
title: "Utiliser Firecracker"
description: "Configurez un fournisseur de microVM et les ressources dont il a besoin sur l’hôte."
---

## Prérequis

Préparez l’hôte Linux et l’image invitée avant d’utiliser le fournisseur. Outpost démarre et arrête chaque VM ; votre infrastructure fournit les ressources ci-dessous.

<!-- features -->

- **Linux avec KVM** : L’utilisateur qui lance Outpost peut lire et écrire `/dev/kvm`.
- **Firecracker et un noyau** : Le binaire `firecracker` et une image de noyau invité sur l’hôte.
- **Un périphérique TAP** : Créé, adressé et routé sur l’hôte, un par VM simultanée.
- **Un système de fichiers racine invité** : Une image disque dont le serveur SSH démarre au boot sur le réseau TAP.
- **Outils invités** : Node.js 24+, Git, `setsid` et `tar` dans le `PATH` de l’utilisateur invité.
- **Confiance SSH** : Une clé privée pour l’utilisateur invité et un fichier known-hosts contenant la clé d’hôte de l’invité.

## Configurer le fournisseur

Importez le fournisseur depuis son sous-chemin et passez-le à `dispatch()` comme n’importe quelle sandbox.

<!-- tabs -->

```ts title="firecracker.ts"
import { createFirecrackerSandboxProvider } from "@elie-laloum/outpost/providers/firecracker";

export const sandboxProvider = createFirecrackerSandboxProvider({
  binary: "/usr/local/bin/firecracker",
  kernel: "/srv/firecracker/vmlinux",
  rootfs: "/srv/firecracker/rootfs.ext4",
  tap: "tap0",
  guestMac: "06:00:ac:10:00:02",
  bootArgs:
    "console=ttyS0 reboot=k panic=1 pci=off ip=172.16.0.2::172.16.0.1:255.255.255.252::eth0:off",
  ssh: {
    host: "172.16.0.2",
    user: "agent",
    identity: "/srv/firecracker/id_ed25519",
    knownHosts: "/srv/firecracker/known_hosts",
  },
  home: "/home/agent",
});
```

```ts title="run.ts"
import { dispatch } from "@elie-laloum/outpost";
import { repository, coder } from "./outpost.config.ts";
import { sandboxProvider } from "./firecracker.ts";

export const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/firecracker" },
  brief: { text: "Run the test suite and fix the first failure." },
});
console.log(result.commits);
```

Chaque allocation démarre une copie privée de `rootfs`, puis interroge SSH jusqu’à ce que l’invité réponde avec le `$HOME` et les outils attendus. Les chemins de l’hôte doivent être absolus.

Référence API : [FirecrackerOptions](../../reference/firecrackeroptions/).

## Accès au dépôt

Firecracker fonctionne comme une [sandbox cloud](../cloud-sandboxes/) : Outpost envoie l’historique Git par SSH, l’agent commite dans l’invité, puis Outpost télécharge, valide et applique les nouveaux commits. Une CLI d’agent absente est installée dans `home` avant le premier tour, sauf si vous passez `bootstrap: false`.

L’utilisateur SSH doit posséder `root` ou pouvoir le créer. Outpost range ses fichiers de transfert Git dans `root/.git` : le reste du système de fichiers invité peut rester en lecture seule pour cet utilisateur.

## Lancer avec le jailer

Renseignez `jailer` pour démarrer Firecracker à travers son jailer : le VMM tourne sous une identité non root, dans un chroot privé et un cgroup v2 enfant qui limite CPU, mémoire et threads.

Référence API : [FirecrackerOptions](../../reference/firecrackeroptions/).

Le processus Outpost doit tourner en root : il n’appelle jamais `sudo`. Chaque chemin transmis au jailer doit appartenir à root, sans lien symbolique ni droit d’écriture pour le groupe ou les autres, jusqu’à `/`. Cela couvre les deux binaires, `kernel`, `rootfs`, les fichiers d’identité et known-hosts SSH, le client SSH (`/usr/bin/ssh` par défaut dans ce mode), `directory` et `cgroup`.

:::caution
Un superviseur root exécute tout ce que le projet de workflow lui demande. N’exécutez en root qu’un projet et une configuration de confiance.
:::

## Libérer la VM

La libération de la sandbox arrête le VMM, supprime la copie privée du disque et rend le TAP disponible pour l’allocation suivante. Les modifications hors du dépôt synchronisé disparaissent avec le disque. Avec le jailer, Outpost tue aussi le cgroup de la VM, puis supprime le cgroup vide et la prison.

Ctrl+C ou SIGTERM sur le processus Outpost libère aussi la VM. Si l’arrêt est incertain ou si le cgroup reste peuplé, la libération échoue et conserve les fichiers ; l’erreur indique leur chemin. Corrigez la cause, puis relancez la libération.

## Limites

- Une seule VM à la fois par configuration de fournisseur. Pour des tâches simultanées, créez une configuration par périphérique TAP et adresse invitée.
- Outpost ne construit ni le noyau ni le système de fichiers racine, et ne crée ni périphérique TAP, ni identité, ni répertoire de prison, ni cgroup, ni règle de pare-feu.
- Les commandes tournent sous l’utilisateur SSH : les terminaux interactifs ([`attach`](../sandbox-sessions/)) et les commandes élevées sont refusés. Installez les paquets système dans l’image du système de fichiers racine.
- Les [politiques réseau](../network-restrictions/) sont refusées : restreignez la sortie avec des règles de pare-feu sur l’hôte.
- Les téléchargements de fichiers depuis l’invité sont mis en mémoire tampon un fichier à la fois dans le processus hôte : la limite mémoire du VMM n’est donc pas un budget mémoire total de l’hôte.
- Le quota du jailer ne compte pas le travail du noyau effectué hors du cgroup du VMM. Il s’appuie sur l’espace de noms de montage et l’abandon de privilèges du jailer, sans espace de noms PID séparé.
- Validez démarrage, annulation, transferts de fichiers et libération sur l’hôte visé avant de vous y fier.

API : [createFirecrackerSandboxProvider](../../reference/createfirecrackersandboxprovider/) · [FirecrackerOptions](../../reference/firecrackeroptions/).
