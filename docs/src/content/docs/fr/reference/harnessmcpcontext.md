---
title: "HarnessMcpContext"
description: "HarnessMcpContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessMcpContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type                                                                                                   | Présence | Rôle                                                                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `prompt` | `(server: string, name: string, promptArguments: Readonly<Record<string, string>>) => Promise<string>` | Requis   | Rend un prompt d’un serveur MCP en cours d’exécution sous forme de texte préfixé par les rôles. Échoue avec le code configuration si le serveur n’est pas déclaré ou n’offre aucun prompt. |

## Signature

```ts
export interface HarnessMcpContext {
  prompt(
    server: string,
    name: string,
    promptArguments: Readonly<Record<string, string>>,
  ): Promise<string>;
}
```
