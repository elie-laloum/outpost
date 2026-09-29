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

| Nom      | Type                                                                                          | Présence | Rôle                                                                                                                                                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`   | `string`                                                                                      | Requis   | Nom de l’adaptateur pour le diagnostic : local ou s3 pour les transports intégrés.                                                                                                                                                          |
| `read`   | `(key: string, options?: TransportReadOptions) => Promise<TransportObject \| undefined>`      | Requis   | Lit un objet complet, ou renvoie undefined si la clé est absente. Un objet plus grand que maxBytes est refusé au lieu d’être tronqué.                                                                                                       |
| `write`  | `(key: string, bytes: Uint8Array, options: TransportWriteOptions) => Promise<TransportEntry>` | Requis   | Stocke atomiquement jusqu’à 64 Mio si ifRevision correspond à la révision courante, ou vaut null et la clé est absente ; sinon échoue avec TransportConflict. Chaque succès renvoie une nouvelle révision, même pour des octets identiques. |
| `remove` | `(key: string, options: TransportWriteOptions) => Promise<void>`                              | Requis   | Supprime l’objet seulement si sa révision courante vaut ifRevision ; un objet absent ou une autre révision provoque TransportConflict. ifRevision null est refusé.                                                                          |
| `list`   | `(prefix?: string, options?: TransportReadOptions) => AsyncIterable<TransportEntry>`          | Requis   | Produit les métadonnées de chaque objet dont la clé commence par prefix, sur toutes les pages du backend. Ce n’est pas un instantané : les objets modifiés pendant le listing peuvent apparaître ou non.                                    |

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
