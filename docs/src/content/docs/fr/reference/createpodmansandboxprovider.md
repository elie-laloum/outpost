---
title: "createPodmanSandboxProvider"
description: "createPodmanSandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createPodmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";
```

## Rôle et comportement

Crée le provider de conteneur sur le moteur Podman, avec les mêmes options que Docker. Quand Outpost ne tourne pas en root, userns keep-id conserve votre utilisateur par défaut ; sur macOS, une machine Podman doit être démarrée.

[Exemple complet et règles détaillées](../../guide/containers/).

## Paramètres et propriétés

| Nom                      | Type                                                           | Présence  | Rôle                                                                                                                                                                                                                                                                                  |
| ------------------------ | -------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                | `ContainerOptions \| undefined`                                | Optionnel | Image de conteneur, mode de dépôt, montages, environnement, réseau et limites de ressources.                                                                                                                                                                                          |
| `options.egress`         | `EgressPolicy \| undefined`                                    | Optionnel | deny-all uniquement, appliqué par le réseau none. Une allowlist, ou des networks autres que none, échoue avec le code configuration dès la création.                                                                                                                                  |
| `options.repositoryMode` | `"mounted" \| "isolated" \| undefined`                         | Optionnel | mounted (par défaut) monte le worktree dans /workspace avec ses métadonnées Git. isolated rend le provider distant : l’historique est envoyé dans /tmp/outpost/workspace, les volumes ne peuvent pas exposer le dépôt hôte et la reprise de spéculation durable n’est pas disponible. |
| `options.caches`         | `readonly DependencyCache[] \| undefined`                      | Optionnel | Volumes nommés du moteur, montés dans /outpost/cache/&lt;name>, qui survivent à la sandbox. Le volume dépend du dépôt, de l’image, de l’utilisateur, du nom et de la clé ; les volumes explicites ne doivent pas recouvrir /outpost/cache.                                            |
| `options.image`          | `string \| undefined`                                          | Optionnel | Image à exécuter, outpost:&lt;nom du répertoire du dépôt> par défaut. Quand user est absent et que l’image déclare un autre utilisateur numérique que le vôtre, l’acquisition échoue avec le code provider.                                                                           |
| `options.user`           | `{ readonly uid: number; readonly gid: number; } \| undefined` | Optionnel | UID et GID des commandes dans le conteneur, vos UID et GID hôtes par défaut (1000:1000 s’ils sont indisponibles).                                                                                                                                                                     |
| `options.volumes`        | `readonly Volume[] \| undefined`                               | Optionnel | Montages hôtes supplémentaires dans le conteneur.                                                                                                                                                                                                                                     |
| `options.variables`      | `Readonly<Record<string, string>> \| undefined`                | Optionnel | Variables d’environnement définies pour chaque commande de la sandbox, en valeurs littérales. Une clé aussi déclarée par l’agent échoue avec le code configuration.                                                                                                                   |
| `options.networks`       | `string \| readonly string[] \| undefined`                     | Optionnel | Réseau ou réseaux du moteur à attacher, passés par --network.                                                                                                                                                                                                                         |
| `options.groups`         | `readonly (string \| number)[] \| undefined`                   | Optionnel | Groupes supplémentaires de l’utilisateur du conteneur, passés par --group-add.                                                                                                                                                                                                        |
| `options.devices`        | `readonly string[] \| undefined`                               | Optionnel | Périphériques hôtes exposés au conteneur, passés par --device.                                                                                                                                                                                                                        |
| `options.cpus`           | `number \| undefined`                                          | Optionnel | Limite CPU passée par --cpus ; doit être positive.                                                                                                                                                                                                                                    |
| `options.memoryMb`       | `number \| undefined`                                          | Optionnel | Limite mémoire en mégaoctets, un entier d’au moins 64.                                                                                                                                                                                                                                |
| `options.label`          | `false \| "z" \| "Z" \| undefined`                             | Optionnel | Réétiquetage SELinux des montages sous Linux : z partagé (par défaut), Z privé, false montages simples.                                                                                                                                                                               |
| `options.retain`         | `number \| undefined`                                          | Optionnel | Octets de fin de sortie conservés par flux, 65536 par défaut.                                                                                                                                                                                                                         |
| `options.userns`         | `false \| "keep-id" \| undefined`                              | Optionnel | Espace de noms utilisateur Podman : keep-id conserve votre utilisateur et s’applique par défaut quand Outpost ne tourne pas en root ; false le désactive. Docker l’ignore.                                                                                                            |

## Retour

`SandboxProvider`

## Signature

```ts
export declare const createPodmanSandboxProvider: (
  options?: ContainerOptions,
) => SandboxProvider;
```

## Contrats associés

- [ContainerOptions](../containeroptions/)
