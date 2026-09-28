---
title: "SandboxProvider"
description: "SandboxProvider — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxProvider } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                                                              | Présence  | Rôle                                                                                                                                                                                                                |
| ----------- | --------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `recover`   | `((resourceId: string, options?: TransferOptions) => Promise<void>) \| undefined` | Optionnel | Nettoyage optionnel et idempotent d’une ressource enregistrée après l’arrêt de son coordinateur. Préserver les données récupérables du dépôt et respecter annulation et délais. Requis pour la spéculation durable. |
| `name`      | `string`                                                                          | Requis    | Identifiant de provider utilisé dans les diagnostics et enregistrements d’activité.                                                                                                                                 |
| `placement` | `"mounted" \| "remote" \| "host"`                                                 | Requis    | Mode d’accès au workspace : checkout hôte monté, checkout distant synchronisé ou exécution directe sur l’hôte.                                                                                                      |
| `variables` | `Readonly<Record<string, string>> \| undefined`                                   | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                             |
| `acquire`   | `(context: SandboxContext) => Promise<SandboxLease>`                              | Requis    | Alloue un bail d’exécution pour le contexte de workspace préparé.                                                                                                                                                   |

## Signature

```ts
export interface SandboxProvider {
  readonly recover?: (
    resourceId: string,
    options?: TransferOptions,
  ) => Promise<void>;
  readonly name: string;
  readonly placement: "mounted" | "remote" | "host";
  readonly variables?: Variables;
  acquire(context: SandboxContext): Promise<SandboxLease>;
}
```

## Contrats associés

- [SandboxContext](../sandboxcontext/)
- [SandboxLease](../sandboxlease/)
- [TransferOptions](../transferoptions/)
- [Variables](../variables/)
