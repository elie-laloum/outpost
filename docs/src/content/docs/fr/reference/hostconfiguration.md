---
title: "HostConfiguration"
description: "HostConfiguration — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HostConfiguration } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                                     | Présence  | Rôle                                                                                                                           |
| ---------- | -------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `source`   | `HostCredentialPath`                                     | Requis    | Fichier de l’hôte à lire, avec une variable d’environnement facultative qui déplace son dossier.                               |
| `path`     | `string`                                                 | Requis    | Destination relative au home de l’agent, sans segment . ou ..                                                                  |
| `section`  | `string \| undefined`                                    | Optionnel | Clé de premier niveau qui reçoit les entrées sélectionnées dans la destination ; sans elle, elles sont fusionnées à la racine. |
| `optional` | `boolean \| undefined`                                   | Optionnel | Ignorer le fichier s’il n’existe pas sur l’hôte au lieu d’échouer.                                                             |
| `login`    | `string`                                                 | Requis    | Commande de l’hôte citée dans l’erreur lorsqu’un fichier requis manque.                                                        |
| `select`   | `(content: string) => Readonly<Record<string, unknown>>` | Requis    | Renvoie les entrées à fusionner à partir du contenu du fichier ; lève une erreur si la connexion attendue est absente.         |

## Signature

```ts
export interface HostConfiguration {
  readonly source: HostCredentialPath;
  readonly path: string;
  readonly section?: string;
  readonly optional?: boolean;
  readonly login: string;
  select(content: string): Readonly<Record<string, unknown>>;
}
```

## Contrats associés

- [HostCredentialPath](../support-hostcredentialpath/)
