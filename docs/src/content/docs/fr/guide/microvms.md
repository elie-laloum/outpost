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

## Lancer avec le jailer

Le réglage optionnel `jailer` lance le binaire jailer de la même version que
Firecracker. Utilisez un superviseur root explicitement de confiance : Outpost
n’exécute pas `sudo`. Le VMM passe sous l’UID/GID non root configuré, tandis que
le superviseur conserve ses privilèges. L’appelant prépare une identité dédiée,
les droits du TAP, une base de prison protégée et un parent cgroup v2 dont
`cgroup.subtree_control` active `cpu`, `memory` et `pids`.

Renseignez `jailer.binary`, `directory`, `cgroup`, `uid`, `gid`, `cpuQuotaUs`,
`memoryMaxMb` et `processes`. Les assets de démarrage, fichiers d’identité SSH et
d’hôtes connus, exécutables et chemins de prison/cgroup doivent appartenir à root,
sans symlink ni droit d’écriture groupe/autres dans leurs ancêtres. Le superviseur
et sa configuration sont des entrées opérateur de confiance. N’exécutez pas un
projet de workflow non fiable en root.

`cpuQuotaUs` borne le temps CPU du VMM par période de 100 000 microsecondes
(50 000 signifie un demi-CPU). `memoryMaxMb` limite la mémoire du cgroup en Mio,
doit dépasser `memoryMb` invité et inclure le surcoût du VMM. Le swap est désactivé
pour ce cgroup. `processes` limite les threads hôte et doit valoir au moins 16.
`cpus` configure les vCPU invités, séparément du quota hôte. Le travail du noyau
en dehors du cgroup VMM n’est pas inclus dans ce quota.

Chaque allocation crée une prison et un cgroup privés. La fermeture termine le
VMM et tue les processus du cgroup avant de supprimer le cgroup vide et les fichiers
privés. Un cgroup occupé ou une terminaison incertaine conserve les données de
récupération et signale une erreur ; réessayez la fermeture après résolution.
Les répertoires parents, identités, TAP et règles de pare-feu restent à la charge
de l’opérateur. Ce mode utilise l’espace de noms de montage du jailer et son
abandon de privilèges ; il ne demande ni daemonisation ni espace de noms PID séparé.

Les tests réels sont `test/firecracker-live.test.ts` et
`test/firecracker-jailer-live.test.ts`. Le second exige
`OUTPOST_FIRECRACKER_JAILER_CONFIG`, un hôte de test préparé, une adresse invitée
IPv6 `fd42:30:240::2` avec passerelle hôte `fd42:30:240::1`, et un quota CPU inférieur
à un CPU. Il abaisse volontairement la limite mémoire du cgroup pour provoquer
un arrêt OOM. Exécutez-le uniquement sur les ressources jetables de la campagne.
Le succès établit ces contrôles précis, pas une résistance à toute exploitation
de l’invité ou du noyau hôte.
