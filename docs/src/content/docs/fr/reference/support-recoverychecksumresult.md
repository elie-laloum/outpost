---
title: "RecoveryChecksumResult"
description: "RecoveryChecksumResult — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom            | Type                                | Présence | Rôle                                                                             |
| -------------- | ----------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `integrity`    | `RecoveryIntegrity`                 | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `bytesChecked` | `number`                            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `maxBytes`     | `number`                            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `checks`       | `readonly RecoveryStructureCheck[]` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface RecoveryChecksumResult {
  readonly integrity: RecoveryIntegrity;
  readonly bytesChecked: number;
  readonly maxBytes: number;
  readonly checks: readonly RecoveryStructureCheck[];
}
```

## Contrats associés

- [RecoveryIntegrity](../support-recoveryintegrity/)
- [RecoveryStructureCheck](../support-recoverystructurecheck/)
