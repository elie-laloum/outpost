---
title: "createMemorySandboxProvider"
description: "createMemorySandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createMemorySandboxProvider } from "@elie-laloum/outpost/testing";
```

## Rôle et comportement

Crée un fournisseur qui simule les commandes de sandbox sans démarrer de CLI d’agent ni de sous-processus arbitraire. Les tours scriptés ne consomment pas la file de commandes ; les autres appels consomment les commandes dans l’ordre entre toutes les allocations, en comparant exactement exécutable et arguments. Une commande inattendue lève le code provider sans consommer d’entrée. Les workspaces et commits scriptés utilisent le système de fichiers hôte et Git réels. Transferts, terminal, entrée en direct et élévation sont refusés. Chaque appel respecte l’annulation, les délais et la rétention des sorties. La libération annule le travail actif et est idempotente ; aucune isolation par conteneur ou réseau n’est fournie.

[Exemple complet et règles détaillées](../../guide/testing-workflows/).

## Paramètres et propriétés

| Nom                | Type                                    | Présence  | Rôle                                                                                                                                                                                                               |
| ------------------ | --------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`          | `MemorySandboxOptions \| undefined`     | Optionnel | Résultats de commandes prédéfinis facultatifs. Un nouveau fournisseur commence avec une file de commandes non consommée.                                                                                           |
| `options.commands` | `readonly MemoryCommand[] \| undefined` | Optionnel | File ordonnée de correspondances exactes exécutable/arguments et de leurs résultats simulés, partagée entre les allocations du fournisseur. Vide par défaut ; les requêtes d’agents scriptés ne la consomment pas. |

## Retour

`SandboxProvider`

## Signature

```ts
export declare function createMemorySandboxProvider(
  options?: MemorySandboxOptions,
): SandboxProvider;
```

## Contrats associés

- [MemorySandboxOptions](../memorysandboxoptions/)
- [SandboxProvider](../sandboxprovider/)
