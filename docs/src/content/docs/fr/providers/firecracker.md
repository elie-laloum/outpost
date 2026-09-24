---
title: Prototype de recherche Firecracker
description: Exécuter une microVM avec un invité Linux préparé explicitement.
sidebar:
  order: 7
---

`@elie-laloum/outpost/providers/firecracker` est un fournisseur expérimental à activer explicitement. Il démarre un véritable processus Firecracker et utilise SSH authentifié pour les commandes et les transferts binaires. Son placement distant réutilise l'initialisation et la synchronisation Git d'Outpost. Aucun service payant ni SDK optionnel n'est nécessaire.

Ce prototype n'utilise **pas** le jailer de Firecracker, ne configure pas les cgroups, ne certifie pas l'isolation et ne constitue pas une frontière de sécurité de production. Utilisez un hôte Linux dédié et jetable avec des travaux de confiance. Le [guide officiel Firecracker](https://github.com/firecracker-microvm/firecracker/blob/main/docs/getting-started.md) décrit les prérequis du noyau, du système de fichiers, du réseau et du jailer. Outpost n'installe aucun logiciel, n'exécute pas sudo, ne modifie pas le pare-feu et ne se replie jamais sur une exécution hôte.

## Préparer l'hôte et l'invité

Un administrateur doit préparer ces ressources avant l'acquisition :

1. Un hôte Linux x86_64 ou aarch64 avec accès en lecture/écriture à `/dev/kvm`, un binaire Firecracker exécutable, un noyau Linux non compressé compatible et une image ext4. Fixez et vérifiez vos versions. Gardez l'image de base immuable pendant les acquisitions ; chaque VM en reçoit une copie privée.
2. Une interface TAP persistante appartenant à l'utilisateur courant, avec une adresse hôte et une route vers l'invité. Configurez séparément le transfert IP, DNS et l'accès sortant nécessaires aux agents. Chaque VM concurrente exige ses propres TAP, MAC et IP. Outpost ne supprime jamais ces ressources hôte.
3. Un invité amorçable avec les pilotes virtio correspondants, une IP statique et sa route par défaut, Node.js 24+, Git, util-linux `setsid`, tar, un shell POSIX et OpenSSH démarré automatiquement. Installez aussi le CLI de votre agent. Sur une distribution dérivée de Debian, installez `git util-linux tar openssh-server`, puis Node 24 pour l'architecture invitée. Créez un utilisateur `outpost` avec le home `/home/outpost` et donnez-lui accès en écriture à `/workspace`. Désactivez les mots de passe SSH ; placez la clé publique dédiée dans `/home/outpost/.ssh/authorized_keys` (dossier 700, fichier 600, appartenant à l'utilisateur). Activez `ssh.service` avant de figer l'image. Cette préparation est extérieure à Outpost.
4. Une identité SSH privée dédiée sur l'hôte et un fichier `known_hosts` contenant la clé publique d'hôte vérifiée depuis l'image préparée. N'accordez pas votre confiance à un simple scan réseau non authentifié. L'image doit conserver ses clés d'hôte SSH dans chaque copie. Outpost impose leur vérification stricte, ignore la configuration SSH utilisateur et utilise uniquement l'identité explicite.

L'authentification de l'agent auprès de son service est indépendante du transport SSH. Fournissez uniquement les variables nécessaires ; le home invité copié et ses identifiants disparaissent à la destruction normale de la VM.

## Créer un fournisseur

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { firecracker } from "@elie-laloum/outpost/providers/firecracker";

await using sandbox = await createSandbox({
  repository: "/work/project",
  provider: firecracker({
    binary: "/opt/firecracker/firecracker",
    kernel: "/opt/firecracker/vmlinux",
    rootfs: "/opt/firecracker/outpost.ext4",
    bootArgs: "console=ttyS0 reboot=k panic=1 root=/dev/vda rw",
    tap: "outpost-tap0",
    guestMac: "06:00:ac:10:00:02",
    root: "/workspace",
    home: "/home/outpost",
    ssh: {
      host: "172.16.0.2",
      user: "outpost",
      identity: "/work/keys/outpost",
      knownHosts: "/work/keys/known_hosts",
    },
    cpus: 2,
    memoryMb: 2048,
    bootDeadlineMs: 60_000,
  }),
});
```

Les chemins sont absolus. `bootArgs` doit correspondre au noyau, au disque racine et au réseau préparés. Le fournisseur attend SSH, vérifie le home et les outils requis, puis retourne le bail. Les terminaux interactifs et commandes avec élévation ne sont pas pris en charge. Une commande conserve son code de sortie et attend le processus même après fermeture de ses sorties. L'annulation utilise une connexion SSH indépendante et le groupe de processus propre à la commande ; si elle ne peut être confirmée, l'opération échoue et la VM doit être libérée.

Les transferts préservent les octets, les permissions ordinaires, les liens symboliques et le contenu des dossiers. Les destinations traversant un lien symbolique sont refusées. Chaque fichier est chargé individuellement en mémoire et les manifestes sont limités à 16 Mio ; ce prototype ne convient pas aux très gros fichiers ou arborescences. Commandes et transferts ont des délais bornés. La copie initiale du disque ne peut pas être interrompue en cours d'opération.

## Propriété des ressources et validation

Chaque bail possède un dossier temporaire privé `outpost-firecracker-*` contenant disque, configuration et socket API. La libération attend les opérations actives, termine uniquement son processus VM et supprime les fichiers privés après confirmation de l'arrêt. Si l'arrêt reste incertain, l'erreur indique le disque conservé ; inspectez le processus et récupérez le disque avant nettoyage manuel. Un arrêt brutal de l'hôte ou du processus peut aussi laisser des fichiers. Les dossiers temporaires `outpost-firecracker-tap-<nom>.lock` et `outpost-firecracker-ssh-<hash>.lock` réservent la TAP et le point SSH, empêchant les fournisseurs coopératifs d'un même hôte de partager une TAP. Ils ne sont pas récupérés automatiquement après un crash : ne les supprimez qu'après avoir vérifié l'arrêt de l'ancienne VM. La sortie du processus tente de tuer la VM mais ne garantit pas le nettoyage asynchrone du disque.

Les tests habituels simulent SSH et le processus VM ; ils ne prouvent ni le démarrage KVM, ni le réseau, ni l'isolation. Pour un démarrage réel, enregistrez les options ci-dessus dans un fichier JSON ignoré par Git puis exécutez :

```sh
OUTPOST_FIRECRACKER_CONFIG=/absolute/path/guest.json node --test test/firecracker-live.test.ts
```

Le test démarre la VM fournie, vérifie le transfert binaire depuis un processus invité, un code de sortie non nul après fermeture des sorties, l'annulation et la réutilisation, puis libère la VM. Sans configuration, il est explicitement ignoré. Un succès valide seulement cet environnement ; intégration du jailer, mesures de performances, tests adversariaux et instantanés restent des travaux de recherche.
