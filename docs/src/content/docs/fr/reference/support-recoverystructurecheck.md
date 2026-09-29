---
title: "RecoveryStructureCheck"
description: "RecoveryStructureCheck — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom      | Type               | Présence | Rôle                                                                                                           |
| -------- | ------------------ | -------- | -------------------------------------------------------------------------------------------------------------- |
| `path`   | `string`           | Requis   | Entrée du transfert conservé examinée par ce contrôle.                                                         |
| `status` | `"fail" \| "pass"` | Requis   | pass lorsque l’invariant contrôlé est respecté, fail sinon.                                                    |
| `code`   | `string`           | Requis   | Code du contrôle, tel que FILE_PRESENT, INVALID_STATE, PATCH_APPLIES, CHECKSUM_MISMATCH ou SOURCE_UNSUPPORTED. |

## Signature

```ts
export interface RecoveryStructureCheck {
  readonly path: string;
  readonly status: "pass" | "fail";
  readonly code: string;
}
```
