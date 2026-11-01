---
title: "Usage"
description: "Usage — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Usage } from "@elie-laloum/outpost/core";
```

## Paramètres et propriétés

| Nom            | Type                                                | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------- | --------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `models`       | `Readonly<Record<string, ModelUsage>> \| undefined` | Optionnel | Compteurs par modèle, chacun avec sa convention de cache. Les dispatchs tarifés les renseignent à partir des modèles CLI explicites, des requêtes du harness et des sous-agents intégrés, avec le nom du modèle pour clé. Sans tarifs, les tours d’agent CLI restent attribués sous &lt;agent>:&lt;modèle>, ou le nom de l’agent quand aucun modèle n’est configuré. Les tâches personnalisées ou en queue doivent les conserver ou les fournir. Les compteurs agrégés restent disponibles et additionnent les entrées telles que rapportées. |
| `complete`     | `boolean \| undefined`                              | Optionnel | false quand une partie de l’usage n’a pas pu être mesurée : les compteurs sont alors une borne inférieure ; l’agrégation et la reprise d’un checkpoint le conservent. Absent, les compteurs sont complets tels que rapportés, sans garantie de facturation.                                                                                                                                                                                                                                                                                   |
| `input`        | `number`                                            | Requis    | Tokens d’entrée tels que l’agent ou le provider de modèle les rapporte. Les providers de modèle intégrés et Codex comptent les tokens en cache dans input ; Claude Code et Kimi Code les rapportent seulement dans cached et cacheCreated.                                                                                                                                                                                                                                                                                                    |
| `cached`       | `number`                                            | Requis    | Tokens d’entrée rapportés comme servis depuis le cache du modèle.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `cacheCreated` | `number \| undefined`                               | Optionnel | Tokens rapportés comme écrits dans le cache du modèle lorsque le protocole les fournit.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `output`       | `number`                                            | Requis    | Tokens de sortie rapportés comme générés par le modèle.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

## Signature

```ts
export interface Usage {
  readonly models?: Readonly<Record<string, ModelUsage>>;
  readonly complete?: boolean;
  readonly input: number;
  readonly cached: number;
  readonly cacheCreated?: number;
  readonly output: number;
}
```

## Contrats associés

- [ModelUsage](../modelusage/)
