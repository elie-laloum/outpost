---
title: "Transport"
description: "Transport — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Transport } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type                                                                                          | Présence | Rôle                                                                                                                                                                                                    |
| -------- | --------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`   | `string`                                                                                      | Requis   | Nom de diagnostic de l’adaptateur ; les appelants utilisent le contrat du transport sans sélectionner un comportement par ce nom.                                                                       |
| `read`   | `(key: string, options?: TransportReadOptions) => Promise<TransportObject \| undefined>`      | Requis   | Lit un objet complet avec une limite d’octets ; renvoie undefined uniquement s’il est absent. La révision identifie précisément les octets lus.                                                         |
| `write`  | `(key: string, bytes: Uint8Array, options: TransportWriteOptions) => Promise<TransportEntry>` | Requis   | Publie atomiquement jusqu’à 64 Mio si la révision attendue correspond, ou crée l’objet si ifRevision vaut null. Chaque écriture réussie renvoie une nouvelle révision, même pour des octets identiques. |
| `remove` | `(key: string, options: TransportWriteOptions) => Promise<void>`                              | Requis   | Supprime uniquement la révision existante fournie ; null est invalide. Un conflit ne doit jamais supprimer un remplacement écrit par un autre propriétaire.                                             |
| `list`   | `(prefix?: string, options?: TransportReadOptions) => AsyncIterable<TransportEntry>`          | Requis   | Parcourt les métadonnées des clés commençant par le préfixe, avec pagination du backend. Le listing est une observation, pas une transaction entre objets.                                              |

## Signature

```ts
export interface Transport {
  readonly name: string;
  read(
    key: string,
    options?: TransportReadOptions,
  ): Promise<TransportObject | undefined>;
  write(
    key: string,
    bytes: Uint8Array,
    options: TransportWriteOptions,
  ): Promise<TransportEntry>;
  remove(key: string, options: TransportWriteOptions): Promise<void>;
  list(
    prefix?: string,
    options?: TransportReadOptions,
  ): AsyncIterable<TransportEntry>;
}
```

## Contrats associés

- [TransportEntry](../transportentry/)
- [TransportObject](../transportobject/)
- [TransportReadOptions](../transportreadoptions/)
- [TransportWriteOptions](../transportwriteoptions/)
