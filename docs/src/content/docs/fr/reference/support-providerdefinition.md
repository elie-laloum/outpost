---
title: "ProviderDefinition"
description: "ProviderDefinition — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom         | Type                                                 | Présence  | Rôle                                                                                    |
| ----------- | ---------------------------------------------------- | --------- | --------------------------------------------------------------------------------------- |
| `name`      | `string`                                             | Requis    | Identifiant de provider utilisé dans les diagnostics et enregistrements d’activité.     |
| `variables` | `Readonly<Record<string, string>> \| undefined`      | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                 |
| `acquire`   | `(context: SandboxContext) => Promise<SandboxLease>` | Requis    | Alloue le bail depuis le workspace préparé et les variables d’environnement explicites. |

## Signature

```ts
export interface ProviderDefinition {
  readonly name: string;
  readonly variables?: Variables;
  acquire(context: SandboxContext): Promise<SandboxLease>;
}
```

## Contrats associés

- [SandboxContext](../sandboxcontext/)
- [SandboxLease](../sandboxlease/)
- [Variables](../variables/)
