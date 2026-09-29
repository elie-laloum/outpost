---
title: "ConfigurationFile"
description: "ConfigurationFile — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ConfigurationFile } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                | Présence | Rôle                                                                                                                                                                     |
| --------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `path`    | `string`                            | Requis   | Chemin relatif au home de l’agent, sans segment . ou ..                                                                                                                  |
| `section` | `string`                            | Requis   | Clé d’objet de premier niveau qui reçoit les entrées, par exemple mcpServers. Les autres clés du fichier sont conservées.                                                |
| `entries` | `Readonly<Record<string, unknown>>` | Requis   | Entrées ajoutées à la section ou remplaçant les entrées de même nom. Un fichier illisible ou une section qui n’est pas un objet provoque un échec au lieu d’être écrasé. |

## Signature

```ts
export interface ConfigurationFile {
  readonly path: string;
  readonly section: string;
  readonly entries: Readonly<Record<string, unknown>>;
}
```
