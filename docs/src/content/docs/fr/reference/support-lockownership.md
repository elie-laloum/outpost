---
title: "LockOwnership"
description: "LockOwnership — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom      | Type                                  | Présence | Rôle                                                                                                                                                                                        |
| -------- | ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status` | `"active" \| "unknown" \| "inactive"` | Requis   | active : le PID tourne avec l’identité enregistrée ; inactive : le processus s’est terminé ; unknown : autre hôte, démarrage ou espace de noms de PID, PID réutilisé ou identité manquante. |
| `reason` | `string`                              | Requis   | Code à l’origine du statut, tel que LOCAL_IDENTITY_MATCH, PROCESS_EXITED, OTHER_HOST, PID_REUSED ou REMOTE_OWNER_UNVERIFIED.                                                                |

## Signature

```ts
export interface LockOwnership {
  readonly status: "active" | "inactive" | "unknown";
  readonly reason: string;
}
```
