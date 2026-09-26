---
title: "HostCredential"
description: "HostCredential — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom           | Type                                                           | Présence  | Rôle                                                                                                                   |
| ------------- | -------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `source`      | `HostCredentialPath`                                           | Requis    | Emplacement hôte du fichier de credentials et variable d’environnement optionnelle qui déplace le home de la CLI.      |
| `destination` | `{ readonly file: string; } \| { readonly variable: string; }` | Requis    | Destination du contenu retenu : chemin de fichier relatif au home de la sandbox, ou variable d’environnement.          |
| `login`       | `string`                                                       | Requis    | Commande hôte qui crée le fichier, indiquée lorsqu’il manque.                                                          |
| `alternative` | `string \| undefined`                                          | Optionnel | Autre forme d’authentification proposée lorsque le fichier manque.                                                     |
| `select`      | `((content: string) => string) \| undefined`                   | Optionnel | Valide le fichier et ne renvoie que le contenu à installer ou transmettre, sans reproduire de secret dans les erreurs. |

## Signature

```ts
export interface HostCredential {
  readonly source: HostCredentialPath;
  readonly destination:
    | {
        readonly file: string;
      }
    | {
        readonly variable: string;
      };
  readonly login: string;
  readonly alternative?: string;
  select?(content: string): string;
}
```

## Contrats associés

- [HostCredentialPath](../support-hostcredentialpath/)
