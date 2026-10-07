---
title: "SecretSource"
description: "SecretSource — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SecretSource } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                                                                                   | Présence | Rôle                                                                                                                                                                                                                                                                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                                                                                               | Requis   | Nom stable identifiant l’implémentation du gestionnaire ; doit être non vide pour fromSecrets.                                                                                                                                                                                                                                                                            |
| `resolve` | `(names: readonly string[], options?: SecretResolveOptions) => Promise<Readonly<Record<string, string \| undefined>>>` | Requis   | Lit uniquement les noms demandés, en respectant si possible le signal, et renvoie des propriétés propres de données contenant des chaînes ou undefined pour les secrets absents. N’écrit pas les valeurs sur disque, ne modifie pas l’environnement hôte et n’énumère pas les secrets non déclarés. Appelez via fromSecrets pour borner l’attente et filtrer les erreurs. |

## Signature

```ts
export interface SecretSource {
  readonly name: string;
  resolve(
    names: readonly string[],
    options?: SecretResolveOptions,
  ): Promise<Readonly<Record<string, string | undefined>>>;
}
```

## Contrats associés

- [SecretResolveOptions](../secretresolveoptions/)
