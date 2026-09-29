---
title: "MicroVM Firecracker"
description: "Exécuter chaque tâche dans une microVM Firecracker sur un hôte Linux/KVM que vous préparez, joint en SSH et éventuellement confiné par le jailer."
---

## Prérequis

Outpost démarre et arrête la VM ; vous préparez une fois l’hôte et l’image invitée.

<!-- features -->

- **Linux avec KVM** : L’utilisateur qui lance Outpost peut lire et écrire `/dev/kvm`.
- **Firecracker et un noyau** : Le binaire `firecracker` et une image de noyau invité sur l’hôte.
- **Un périphérique TAP** : Créé, adressé et routé sur l’hôte, un par VM simultanée.
- **Un système de fichiers racine invité** : Une image disque dont le serveur SSH démarre au boot sur le réseau TAP.
- **Outils invités** : Node.js 24+, Git, `setsid` et `tar` dans le `PATH` de l’utilisateur invité.
- **Confiance SSH** : Une clé privée pour l’utilisateur invité et un fichier known-hosts contenant la clé d’hôte de l’invité.

## Configurer le provider

Importez le provider depuis son sous-chemin et passez-le à `dispatch()` comme n’importe quelle sandbox.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { createFirecrackerSandboxProvider } from "@elie-laloum/outpost/providers/firecracker";
import { coder, repository } from "./outpost.config.mts";

const sandboxProvider = createFirecrackerSandboxProvider({
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

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/firecracker" },
  brief: { text: "Run the test suite and fix the first failure." },
});
console.log(result.commits);
```

Chaque allocation démarre une copie privée de `rootfs`, puis interroge SSH jusqu’à ce que l’invité réponde avec le `$HOME` et les outils attendus. Les chemins de l’hôte doivent être absolus.

| Option                                       | Défaut                | Définit                                                                            |
| -------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| `binary`, `kernel`, `rootfs`                 | Requis                | L’exécutable Firecracker et les fichiers de démarrage de l’invité.                 |
| `tap`, `guestMac`, `bootArgs`                | Requis                | Le périphérique réseau de l’hôte, l’adresse MAC invitée et la ligne noyau.         |
| `ssh.host`, `user`, `identity`, `knownHosts` | Requis                | Comment Outpost joint l’invité. Une clé d’hôte inconnue est refusée.               |
| `home`                                       | Requis                | Le home de l’agent dans l’invité ; il doit égaler le `$HOME` de l’utilisateur SSH. |
| `ssh.port`, `ssh.binary`                     | `22`, `ssh` du `PATH` | Le port SSH de l’invité et le client SSH de l’hôte.                                |
| `root`                                       | `/workspace`          | Le workspace du dépôt dans l’invité.                                               |
| `cpus`, `memoryMb`                           | `2`, `2048`           | Les vCPU et la mémoire invitée en Mio.                                             |
| `bootDeadlineMs`                             | `60000`               | L’attente maximale de SSH et des outils invités avant l’échec.                     |
| `variables`                                  | Aucune                | Les [variables d’environnement](../environment-variables/) de chaque commande.     |
| `jailer`                                     | Lancement direct      | [Lancer avec le jailer](#lancer-avec-le-jailer).                                   |

## Accès au dépôt

Firecracker fonctionne comme une [sandbox cloud](../cloud-sandboxes/) : Outpost envoie l’historique Git par SSH, l’agent commite dans l’invité, puis Outpost télécharge, valide et applique les nouveaux commits. Une CLI d’agent absente est installée dans `home` avant le premier tour, sauf si vous passez `bootstrap: false`.

L’utilisateur SSH doit posséder `root` ou pouvoir le créer. Outpost range ses fichiers de transfert Git dans `root/.git` : le reste du système de fichiers invité peut rester en lecture seule pour cet utilisateur.

## Lancer avec le jailer

Renseignez `jailer` pour démarrer Firecracker à travers son jailer : le VMM tourne sous une identité non root, dans un chroot privé et un cgroup v2 enfant qui limite CPU, mémoire et threads.

| Réglage       | Ce qu’il borne                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `binary`      | L’exécutable du jailer, issu de la même version que Firecracker.                                                                          |
| `directory`   | La base des prisons. Chaque VM y reçoit une prison privée.                                                                                |
| `cgroup`      | Un parent cgroup v2 dédié sous `/sys/fs/cgroup`, avec `cpu`, `memory` et `pids` dans `cgroup.subtree_control`.                            |
| `uid`, `gid`  | L’identité non root du VMM. Elle doit pouvoir utiliser le périphérique TAP.                                                               |
| `cpuQuotaUs`  | Le temps CPU du VMM par tranche de 100 000 µs : `50000` vaut un demi-CPU. Minimum `1000`. Les `cpus` invités restent un réglage distinct. |
| `memoryMaxMb` | La limite mémoire du cgroup en Mio. Elle doit dépasser `memoryMb` en laissant la place au surcoût du VMM. Le swap est désactivé.          |
| `processes`   | La limite de threads hôte de la VM, au moins `16`.                                                                                        |

Le processus Outpost doit tourner en root : il n’appelle jamais `sudo`. Chaque chemin transmis au jailer doit appartenir à root, sans lien symbolique ni droit d’écriture pour le groupe ou les autres, jusqu’à `/`. Cela couvre les deux binaires, `kernel`, `rootfs`, les fichiers d’identité et known-hosts SSH, le client SSH (`/usr/bin/ssh` par défaut dans ce mode), `directory` et `cgroup`.

:::caution
Un superviseur root exécute tout ce que le projet de workflow lui demande. N’exécutez en root qu’un projet et une configuration de confiance.
:::

## Libérer la VM

La libération de la sandbox arrête le VMM, supprime la copie privée du disque et rend le TAP disponible pour l’allocation suivante. Les modifications hors du dépôt synchronisé disparaissent avec le disque. Avec le jailer, Outpost tue aussi le cgroup de la VM, puis supprime le cgroup vide et la prison.

Ctrl+C ou SIGTERM sur le processus Outpost libère aussi la VM. Si l’arrêt est incertain ou si le cgroup reste peuplé, la libération échoue et conserve les fichiers ; l’erreur indique leur chemin. Corrigez la cause, puis relancez la libération.

## Limites

- Une seule VM à la fois par configuration de provider. Pour des tâches simultanées, créez une configuration par périphérique TAP et adresse invitée.
- Outpost ne construit ni le noyau ni le système de fichiers racine, et ne crée ni périphérique TAP, ni identité, ni répertoire de prison, ni cgroup, ni règle de pare-feu.
- Les commandes tournent sous l’utilisateur SSH : les terminaux interactifs ([`attach`](../sandbox-sessions/)) et les commandes élevées sont refusés. Installez les paquets système dans l’image du système de fichiers racine.
- Les [politiques réseau](../network-restrictions/) sont refusées : restreignez la sortie avec des règles de pare-feu sur l’hôte.
- Le quota du jailer ne compte pas le travail du noyau effectué hors du cgroup du VMM. Il s’appuie sur l’espace de noms de montage et l’abandon de privilèges du jailer, sans espace de noms PID séparé.
- Validez démarrage, annulation, transferts de fichiers et libération sur l’hôte visé avant de vous y fier.

API : [createFirecrackerSandboxProvider](../../reference/createfirecrackersandboxprovider/) · [FirecrackerOptions](../../reference/firecrackeroptions/).
