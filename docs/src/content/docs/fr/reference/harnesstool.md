---
title: "HarnessTool"
description: "HarnessTool — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le streaming n’est pas encore disponible ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessTool } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                               | Présence | Rôle                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `kind`        | `"tool"`                                                                           | Requis   | Discriminant de la définition : tool.                                                                |
| `name`        | `string`                                                                           | Requis   | Nom d’outil unique présenté au modèle.                                                               |
| `description` | `string`                                                                           | Requis   | Explication envoyée au modèle avec l’outil.                                                          |
| `readOnly`    | `boolean`                                                                          | Requis   | Indique si l’outil peut s’exécuter en parallèle d’autres appels en lecture seule.                    |
| `inputSchema` | `Readonly<Record<string, unknown>>`                                                | Requis   | JSON Schema figé envoyé au modèle, converti depuis un Standard Schema si besoin.                     |
| `validate`    | `(value: unknown) => Promise<ToolValidation<Input>>`                               | Requis   | Contrôle les arguments bruts du modèle et renvoie la valeur typée ou une liste de problèmes lisible. |
| `resources`   | `(input: Input) => ToolResources`                                                  | Requis   | Chemins et commande d’une entrée validée ; vide si l’outil n’en déclare pas.                         |
| `execute`     | `(input: Input, context: HarnessToolContext) => ToolOutput \| Promise<ToolOutput>` | Requis   | Exécute l’appel avec l’entrée validée et son contexte.                                               |

## Signature

```ts
export interface HarnessTool<Input = unknown> {
  readonly kind: "tool";
  readonly name: string;
  readonly description: string;
  readonly readOnly: boolean;
  readonly inputSchema: JsonSchema;
  validate(value: unknown): Promise<ToolValidation<Input>>;
  resources(input: Input): ToolResources;
  execute(
    input: Input,
    context: HarnessToolContext,
  ): ToolOutput | Promise<ToolOutput>;
}
```

## Contrats associés

- [HarnessToolContext](../harnesstoolcontext/)
- [JsonSchema](../jsonschema/)
- [ToolOutput](../tooloutput/)
- [ToolResources](../toolresources/)
- [ToolValidation](../toolvalidation/)
