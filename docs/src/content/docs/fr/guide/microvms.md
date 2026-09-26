---
title: "Exécution en microVM"
description: "Configurer le fournisseur Firecracker expérimental."
---

:::note[Expérimental]
Firecracker exige un hôte Linux/KVM et un invité préparés. Ce n’est ni un constructeur automatique d’images VM ni une certification d’isolation de production.
:::

Importez `firecrackerSandboxProvider` depuis `@elie-laloum/outpost/providers/firecracker` et fournissez les fichiers de démarrage et la configuration SSH décrits par `FirecrackerOptions`.

| Entrée requise                               | Rôle                                                              |
| -------------------------------------------- | ----------------------------------------------------------------- |
| `binary`, `kernel`, `rootfs`                 | Exécutable Firecracker et fichiers de démarrage invités préparés. |
| `tap`, `guestMac`, `bootArgs`                | Réseau hôte/invité et configuration de démarrage.                 |
| `ssh.host`, `user`, `identity`, `knownHosts` | Invité joignable avec identité et confiance hôte explicites.      |
| `home`                                       | Home privé de l’agent dans l’invité.                              |

Préparez permissions KVM, périphérique TAP, runtime invité, serveur SSH et clé hôte fiable avant l’allocation. Les options CPU, mémoire et délai de boot bornent ressources et attente de démarrage.

La propriété du fournisseur couvre le runtime alloué ; elle ne provisionne pas le réseau hôte et ne prépare pas le système de fichiers racine. Validez réellement démarrage, annulation des commandes, transferts et nettoyage sur l’hôte visé avant adoption. La [roadmap](../../project/roadmap/) indique la validation opérationnelle restante.

API : [firecrackerSandboxProvider](../../reference/firecrackersandboxprovider/) · [FirecrackerOptions](../../reference/firecrackeroptions/).
