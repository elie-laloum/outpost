---
title: "ContainerOptions"
description: "ContainerOptions — Outpost API"
sidebar:
  order: 20
---

## Import

Choisissez un seul de ces imports équivalents.

```ts
import type { ContainerOptions } from "@elie-laloum/outpost/providers/docker";
```

```ts
import type { ContainerOptions } from "@elie-laloum/outpost/providers/podman";
```

## Paramètres et propriétés

| Nom              | Type                                                           | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------- | -------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `egress`         | `EgressPolicy \| undefined`                                    | Optionnel | deny-all utilise le réseau none. Une allowlist démarre un proxy dédié et un pare-feu de namespace avant les commandes : les domaines autorisent HTTP sur 80 et HTTPS CONNECT sur 443 avec SNI TLS correspondant ; les CIDR autorisent TCP/UDP direct, denyCidrs étant prioritaire. Des networks explicites sont incompatibles avec une allowlist. Le guide réseau précise la publication de l’image et les limites de validation.                 |
| `egressImage`    | `string \| undefined`                                          | Optionnel | Remplace l’image de confiance du conteneur de filtrage pour une allowlist. Utilisez un digest immuable en production. Le moteur télécharge une image absente. Omettre cette option utilise l’image publique amd64/arm64 épinglée par digest vérifié dans Outpost. Construisez images/egress et renseignez cette option pour tester un conteneur de filtrage local. L’image doit implémenter le protocole du runtime egress Outpost correspondant. |
| `repositoryMode` | `"mounted" \| "isolated" \| undefined`                         | Optionnel | mounted (par défaut) monte le worktree dans /workspace avec ses métadonnées Git. isolated rend le provider distant : l’historique est envoyé dans /tmp/outpost/workspace, les volumes ne peuvent pas exposer le dépôt hôte et la reprise de spéculation durable n’est pas disponible.                                                                                                                                                             |
| `caches`         | `readonly DependencyCache[] \| undefined`                      | Optionnel | Volumes nommés du moteur, montés dans /outpost/cache/&lt;name>, qui survivent à la sandbox. Le volume dépend du dépôt, de l’image, de l’utilisateur, du nom et de la clé ; les volumes explicites ne doivent pas recouvrir /outpost/cache.                                                                                                                                                                                                        |
| `image`          | `string \| undefined`                                          | Optionnel | Image à exécuter, outpost:&lt;nom du répertoire du dépôt> par défaut. Quand user est absent et que l’image déclare un autre utilisateur numérique que le vôtre, l’acquisition échoue avec le code provider.                                                                                                                                                                                                                                       |
| `user`           | `{ readonly uid: number; readonly gid: number; } \| undefined` | Optionnel | UID et GID des commandes, vos identifiants hôtes par défaut (1000:1000 si indisponibles). L’UID 65532 est réservé au proxy dédié lorsqu’une allowlist est configurée.                                                                                                                                                                                                                                                                             |
| `volumes`        | `readonly Volume[] \| undefined`                               | Optionnel | Montages hôtes supplémentaires dans le conteneur.                                                                                                                                                                                                                                                                                                                                                                                                 |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                | Optionnel | Variables d’environnement définies pour chaque commande de la sandbox, en valeurs littérales. Une clé aussi déclarée par l’agent échoue avec le code configuration.                                                                                                                                                                                                                                                                               |
| `networks`       | `string \| readonly string[] \| undefined`                     | Optionnel | Réseaux du moteur passés par --network. Une allowlist egress refuse les réseaux explicites, car Outpost gère le namespace réseau filtré.                                                                                                                                                                                                                                                                                                          |
| `groups`         | `readonly (string \| number)[] \| undefined`                   | Optionnel | Groupes supplémentaires de l’utilisateur du conteneur, passés par --group-add.                                                                                                                                                                                                                                                                                                                                                                    |
| `devices`        | `readonly string[] \| undefined`                               | Optionnel | Périphériques hôtes exposés au conteneur, passés par --device.                                                                                                                                                                                                                                                                                                                                                                                    |
| `cpus`           | `number \| undefined`                                          | Optionnel | Limite CPU passée par --cpus ; doit être positive.                                                                                                                                                                                                                                                                                                                                                                                                |
| `memoryMb`       | `number \| undefined`                                          | Optionnel | Limite mémoire en mégaoctets, un entier d’au moins 64.                                                                                                                                                                                                                                                                                                                                                                                            |
| `label`          | `false \| "z" \| "Z" \| undefined`                             | Optionnel | Réétiquetage SELinux des montages sous Linux : z partagé (par défaut), Z privé, false montages simples.                                                                                                                                                                                                                                                                                                                                           |
| `retain`         | `number \| undefined`                                          | Optionnel | Octets de fin de sortie conservés par flux, 65536 par défaut.                                                                                                                                                                                                                                                                                                                                                                                     |
| `userns`         | `false \| "keep-id" \| undefined`                              | Optionnel | Espace de noms utilisateur Podman : keep-id conserve votre utilisateur et s’applique par défaut quand Outpost ne tourne pas en root ; false le désactive. Docker l’ignore.                                                                                                                                                                                                                                                                        |

## Signature

```ts
export interface ContainerOptions {
  readonly egress?: EgressPolicy;
  readonly egressImage?: string;
  readonly repositoryMode?: "mounted" | "isolated";
  readonly caches?: readonly DependencyCache[];
  readonly image?: string;
  readonly user?: {
    readonly uid: number;
    readonly gid: number;
  };
  readonly volumes?: readonly Volume[];
  readonly variables?: Variables;
  readonly networks?: string | readonly string[];
  readonly groups?: readonly (string | number)[];
  readonly devices?: readonly string[];
  readonly cpus?: number;
  readonly memoryMb?: number;
  readonly label?: "z" | "Z" | false;
  readonly retain?: number;
  readonly userns?: "keep-id" | false;
}
```

## Contrats associés

- [DependencyCache](../dependencycache/)
- [EgressPolicy](../egresspolicy/)
- [Variables](../variables/)
- [Volume](../volume/)
