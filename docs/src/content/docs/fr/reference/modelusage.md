---
title: "ModelUsage"
description: "ModelUsage — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelUsage } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                  | Type                   | Présence  | Rôle                                                                                                                                                                                                                                                        |
| -------------------- | ---------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inputIncludesCache` | `boolean \| undefined` | Optionnel | Indique si input inclut cached et cacheCreated, true par défaut. L’attribution des CLI Claude Code et Kimi utilise false ; les providers de modèle intégrés utilisent true.                                                                                 |
| `complete`           | `boolean \| undefined` | Optionnel | false quand une partie de l’usage n’a pas pu être mesurée : les compteurs sont alors une borne inférieure ; l’agrégation et la reprise d’un checkpoint le conservent. Absent, les compteurs sont complets tels que rapportés, sans garantie de facturation. |
| `input`              | `number`               | Requis    | Tokens d’entrée tels que l’agent ou le provider de modèle les rapporte. Les providers de modèle intégrés et Codex comptent les tokens en cache dans input ; Claude Code et Kimi Code les rapportent seulement dans cached et cacheCreated.                  |
| `cached`             | `number`               | Requis    | Tokens d’entrée rapportés comme servis depuis le cache du modèle.                                                                                                                                                                                           |
| `cacheCreated`       | `number \| undefined`  | Optionnel | Tokens rapportés comme écrits dans le cache du modèle lorsque le protocole les fournit.                                                                                                                                                                     |
| `output`             | `number`               | Requis    | Tokens de sortie rapportés comme générés par le modèle.                                                                                                                                                                                                     |

## Signature

```ts
export interface ModelUsage extends Omit<Usage, "models"> {
  readonly inputIncludesCache?: boolean;
}
```

## Contrats associés

- [Usage](../usage/)
