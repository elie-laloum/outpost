---
title: "resourceOperationKinds"
description: "resourceOperationKinds — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Signature

```ts
export declare const resourceOperationKinds: readonly [
  "dispatch",
  "attach",
  "diagnose",
  "command",
  "invoke",
  "upload",
  "download",
  "manifest",
  "download-batch",
  "upload-batch",
];
```
