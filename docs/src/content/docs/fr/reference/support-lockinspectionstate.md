---
title: "LockInspectionState"
description: "LockInspectionState — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom         | Type                                              | Présence          | Rôle                                                                                    |
| ----------- | ------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------- |
| `ownership` | `LockOwnership \| undefined`                      | Optionnel         | Évaluation de la possession actuelle de la ressource par le processus local enregistré. |
| `state`     | `"present" \| "absent" \| "unknown" \| "skipped"` | Requis            | Indique si le fichier de verrou est présent, absent, inconnu ou délibérément ignoré.    |
| `pid`       | `number \| number \| undefined`                   | Selon la variante | Identifiant du processus extrait du fichier de verrou local lorsqu’il est disponible.   |
| `reason`    | `string \| "NOT_FILE"`                            | Selon la variante | Motif du classement du verrou local dans cet état de possession.                        |

## Signature

```ts
export type LockInspectionState = {
  readonly ownership?: LockOwnership;
} & (
  | {
      readonly state: "present" | "absent";
      readonly pid: number;
    }
  | {
      readonly state: "unknown";
      readonly reason: string;
      readonly pid?: number;
    }
  | {
      readonly state: "skipped";
      readonly reason: "NOT_FILE";
    }
);
```

## Contrats associés

- [LockOwnership](../support-lockownership/)
