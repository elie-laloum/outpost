---
title: "Choisir les paramètres d’isolation"
description: "Combinez les contrôles d’exécution, de Git et du réseau selon les accès nécessaires à la tâche."
---

## Choisir les contrôles nécessaires

Choisissez d’abord l’environnement d’exécution, puis réglez ses accès à Git, au réseau et aux identifiants. Ces contrôles appartiennent au fournisseur de sandbox et s’appliquent indépendamment des consignes données à l’agent. Le fournisseur local s’exécute directement sur votre machine, sans isolation.

<!-- features -->

- [Restrictions réseau](../network-restrictions/): Bloquez tout le trafic sortant, ou n’autorisez que les hôtes dont l’agent a besoin.
- [Git privé](../private-git/): Donnez au conteneur son propre checkout au lieu de votre worktree monté.
- [Variables d’environnement](../environment-variables/): Déclarez quelles valeurs atteignent la sandbox, l’agent ou une seule commande.
- [Sandboxes cloud](../cloud-sandboxes/): Sortez le travail de votre machine, vers une sandbox hébergée.
  - Vercel
  - Daytona
- [MicroVM Firecracker](../firecracker/): Un noyau invité distinct, sur une infrastructure que vous exploitez.
  - KVM
  - rootfs
- [Sécurité](../security/): Ce que chaque frontière couvre, et ce qu’elle laisse ouvert.
  - identifiants
  - montages

## Limiter les accès du conteneur

:::caution[Expérimental]
Les politiques egress et Git privé sont des prototypes à activer explicitement. Vérifiez que votre fournisseur applique la politique avant de vous y fier.
:::

Docker et Podman acceptent les deux couches à la fois : le conteneur n’atteint aucun réseau et ne voit jamais votre worktree.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  repositoryMode: "isolated",
  egress: { mode: "deny-all" },
});
console.log(sandboxProvider.name);
```

Préparez d’abord les outils et les dépendances dans l’[image](../agent-images/). Un agent CLI coupé du réseau ne peut pas joindre son modèle ; le [harness intégré](../harness/) le peut, car ses requêtes au modèle partent de votre hôte et seuls ses outils s’exécutent hors ligne.

## Ce que couvre chaque couche

| Couche              | Se règle sur                       | Tient l’agent à l’écart de                   | Disponible sur                                                                        |
| ------------------- | ---------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------- |
| Politique egress    | Le fournisseur de sandbox          | Les hôtes que vous n’avez pas autorisés      | Docker et Podman : `deny-all` seulement ; listes d’autorisation sur Vercel et Daytona |
| Git privé           | Docker ou Podman                   | Votre worktree et vos répertoires Git d’hôte | Docker et Podman                                                                      |
| Sandbox hébergée    | Le fournisseur que vous choisissez | Votre système de fichiers, vos processus     | Vercel, Daytona, Firecracker                                                          |
| Variables déclarées | `dispatch()` ou le fournisseur     | Les valeurs que vous n’avez pas déclarées    | Tous les fournisseurs                                                                 |

Les fournisseurs distants travaillent toujours sur une copie de l’historique. L’exécution sur l’hôte n’isole rien : `createLocalSandboxProvider()` lance les commandes sur votre machine, et vous le choisissez explicitement.

## Limites

- Une politique est fixée à la création du fournisseur, et une destination autorisée peut toujours recevoir ce que l’agent lui envoie.
- Egress ne couvre pas le trafic qu’Outpost gère lui-même : requêtes au modèle du harness, téléchargements d’images, transferts de fichiers et appels au plan de contrôle d’un cloud.
- Git privé protège vos métadonnées Git, pas votre hôte. Vous faites toujours confiance à l’image, au moteur, au noyau et à chaque montage ajouté.
- Le code écrit par l’agent revient sur votre machine. Lisez-le avant de l’exécuter là.
- Rien ne retombe sur l’hôte : un moteur, un SDK ou un identifiant manquant fait échouer la tâche.

API : [EgressPolicy](../../reference/egresspolicy/) · [ContainerOptions](../../reference/containeroptions/) · [VercelOptions](../../reference/verceloptions/) · [DaytonaOptions](../../reference/daytonaoptions/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createLocalSandboxProvider](../../reference/createlocalsandboxprovider/).
