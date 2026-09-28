---
title: "HarnessSubagent"
description: "HarnessSubagent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessSubagent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                                                                            | Présence | Rôle                                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `subagent`    | `CustomAgent`                                                                                                                   | Requis   | Configuration explicite de l’enfant intégré, exécutée par le runtime dans la sandbox empruntée du parent avec intersection des permissions et budgets de tokens cumulés des ancêtres. |
| `kind`        | `"tool"`                                                                                                                        | Requis   | Discriminant de la définition : tool.                                                                                                                                                 |
| `name`        | `string`                                                                                                                        | Requis   | Nom d’outil unique présenté au modèle.                                                                                                                                                |
| `description` | `string`                                                                                                                        | Requis   | Explication envoyée au modèle avec l’outil.                                                                                                                                           |
| `readOnly`    | `boolean`                                                                                                                       | Requis   | Toujours false : les délégations sont sérialisées même si l’enfant ne déclare que des outils en lecture seule.                                                                        |
| `inputSchema` | `Readonly<Record<string, unknown>>`                                                                                             | Requis   | Schéma JSON fixe exigeant une chaîne prompt non vide et refusant les propriétés supplémentaires.                                                                                      |
| `validate`    | `(value: unknown) => Promise<ToolValidation<import("./subagent.types.js").HarnessSubagentInput>>`                               | Requis   | Valide l’entrée de délégation du modèle parent selon le schéma prompt fixe avant d’appeler l’enfant.                                                                                  |
| `resources`   | `(input: import("./subagent.types.js").HarnessSubagentInput) => ToolResources`                                                  | Requis   | L’appel de délégation ne déclare ni chemin ni commande. Chaque outil descendant déclare ses propres ressources, vérifiées selon les permissions de l’enfant et des ancêtres.          |
| `execute`     | `(input: import("./subagent.types.js").HarnessSubagentInput, context: HarnessToolContext) => ToolOutput \| Promise<ToolOutput>` | Requis   | L’exécution directe est refusée ; le runtime du harness fournit annulation, budgets, permissions et gestion du transcript lors de l’appel de cet outil.                               |

## Signature

```ts
export interface HarnessSubagent extends HarnessTool<HarnessSubagentInput> {
  readonly subagent: CustomAgent;
}
```

## Contrats associés

- [CustomAgent](../customagent/)
- [HarnessSubagentInput](../harnesssubagentinput/)
- [HarnessTool](../harnesstool/)
