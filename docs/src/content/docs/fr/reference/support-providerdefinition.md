---
title: "ProviderDefinition"
description: "ProviderDefinition — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom         | Type                                                 | Présence  | Rôle                                                                                                                              |
| ----------- | ---------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | `string`                                             | Requis    | Identifiant enregistré dans les diagnostics et l’activité des ressources ; un nom vide échoue avec le code configuration.         |
| `variables` | `Readonly<Record<string, string>> \| undefined`      | Optionnel | Variables d’environnement définies pour chaque commande de la sandbox, en valeurs littérales ; la fabrique les copie et les fige. |
| `acquire`   | `(context: SandboxContext) => Promise<SandboxLease>` | Requis    | Alloue un environnement et renvoie son bail ; la fabrique ajoute le placement.                                                    |

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
