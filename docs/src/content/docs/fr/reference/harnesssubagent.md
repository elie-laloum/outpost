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

| Nom           | Type                                                                                              | Présence | Rôle                                                                                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `subagent`    | `CustomAgent`                                                                                     | Requis   | Agent enfant exécuté dans la sandbox empruntée du parent, avec les permissions des ancêtres ajoutées aux siennes et ses tokens comptés dans chaque budget ancêtre.                                         |
| `kind`        | `"tool"`                                                                                          | Requis   | Discriminant de la définition : tool.                                                                                                                                                                      |
| `name`        | `string`                                                                                          | Requis   | Nom d’outil unique présenté au modèle.                                                                                                                                                                     |
| `description` | `string`                                                                                          | Requis   | Explication envoyée au modèle avec l’outil.                                                                                                                                                                |
| `readOnly`    | `boolean`                                                                                         | Requis   | Toujours false : les délégations sont sérialisées même si l’enfant ne déclare que des outils en lecture seule.                                                                                             |
| `inputSchema` | `Readonly<Record<string, unknown>>`                                                               | Requis   | Schéma JSON fixe exigeant une chaîne prompt non vide et refusant les propriétés supplémentaires.                                                                                                           |
| `validate`    | `(value: unknown) => Promise<ToolValidation<HarnessSubagentInput>>`                               | Requis   | Valide l’entrée de délégation du modèle parent selon le schéma prompt fixe avant d’appeler l’enfant.                                                                                                       |
| `resources`   | `(input: HarnessSubagentInput) => ToolResources`                                                  | Requis   | Toujours vide : l’appel de délégation ne correspond aux règles de permission que par le nom de l’outil. Chaque appel d’outil de l’enfant est contrôlé par ses permissions et par celles de chaque ancêtre. |
| `execute`     | `(input: HarnessSubagentInput, context: HarnessToolContext) => ToolOutput \| Promise<ToolOutput>` | Requis   | Lève le code configuration en appel direct : seul le runtime du harness exécute un sous-agent, en fournissant annulation, budgets, permissions et transcription de l’enfant.                               |

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
