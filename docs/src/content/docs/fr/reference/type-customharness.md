---
title: "CustomHarness"
description: "CustomHarness — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Conversations persistées, jeux d’outils fournis et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { CustomHarness } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                                                 | Présence  | Rôle                                                                                                          |
| --------------- | -------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| `kind`          | `"custom"`                                                           | Requis    | Discriminant d’exécution : custom.                                                                            |
| `modelProvider` | `ModelProvider`                                                      | Requis    | Transport de requêtes que le moteur appelle à chaque étape ; il valide le modèle de l’agent à la composition. |
| `instructions`  | `readonly HarnessInstructions[]`                                     | Requis    | Sources d’instructions normalisées, résolues au début de chaque passe.                                        |
| `tools`         | `readonly HarnessTool<unknown>[]`                                    | Requis    | Liste d’outils aplatie et figée, envoyée au modèle dans l’ordre de déclaration.                               |
| `limits`        | `ResolvedHarnessLimits`                                              | Requis    | Limites normalisées ; maxSteps vaut 100 par défaut.                                                           |
| `toolExecution` | `Required<HarnessToolExecution>`                                     | Requis    | Réglages d’exécution des outils normalisés, valeurs par défaut appliquées.                                    |
| `hooks`         | `readonly HarnessHook<import("./hook.types.ts").HarnessHookPhase>[]` | Requis    | Hooks figés du harness.                                                                                       |
| `permissions`   | `HarnessPermissions \| undefined`                                    | Optionnel | Règles de permission évaluées avant les hooks before-tool, si elles sont définies.                            |
| `cache`         | `boolean`                                                            | Requis    | Indique si chaque requête demande au fournisseur de mettre en cache le préfixe de la conversation.            |

## Signature

```ts
export interface CustomHarness {
  readonly kind: "custom";
  readonly modelProvider: ModelProvider;
  readonly instructions: readonly HarnessInstructions[];
  readonly tools: readonly HarnessTool[];
  readonly limits: ResolvedHarnessLimits;
  readonly toolExecution: Required<HarnessToolExecution>;
  readonly hooks: readonly HarnessHook[];
  readonly permissions?: HarnessPermissions;
  readonly cache: boolean;
}
```

## Contrats associés

- [HarnessHook](../harnesshook/)
- [HarnessInstructions](../harnessinstructions/)
- [HarnessPermissions](../harnesspermissions/)
- [HarnessTool](../harnesstool/)
- [HarnessToolExecution](../harnesstoolexecution/)
- [ModelProvider](../modelprovider/)
- [ResolvedHarnessLimits](../support-resolvedharnesslimits/)
