---
title: "SessionBundleRelocation"
description: "SessionBundleRelocation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SessionBundleRelocation } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                   | Présence | Rôle                                                                   |
| --------- | ---------------------- | -------- | ---------------------------------------------------------------------- |
| `id`      | `string`               | Requis   | Identifiant de la conversation restaurée.                              |
| `cwd`     | `string`               | Requis   | Workspace de la sandbox vers lequel la session restaurée doit pointer. |
| `target`  | `string`               | Requis   | Dossier de la sandbox dans lequel la session est restaurée.            |
| `helpers` | `SessionBundleHelpers` | Requis   | Utilitaires de chemins et d’empreinte côté sandbox.                    |

## Signature

```ts
export interface SessionBundleRelocation {
  readonly id: string;
  /** Sandbox workspace the restored session must point to. */
  readonly cwd: string;
  /** Sandbox directory the session is restored into. */
  readonly target: string;
  readonly helpers: SessionBundleHelpers;
}
```

## Contrats associés

- [SessionBundleHelpers](../sessionbundlehelpers/)
