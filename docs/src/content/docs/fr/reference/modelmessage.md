---
title: "ModelMessage"
description: "ModelMessage — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : messages, appels d’outils et raisonnement rejouable neutres vis-à-vis du fournisseur. Pas encore de streaming ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { ModelMessage } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                           | Présence | Rôle                                                                                                                                                                 |
| --------- | ------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `role`    | `"user" \| "assistant"`        | Requis   | Auteur du message : user pour les prompts et les résultats d’outils, assistant pour la sortie du modèle.                                                             |
| `content` | `readonly ModelContentBlock[]` | Requis   | Blocs de contenu ordonnés, non vides. Les appels d’outils et le raisonnement appartiennent aux messages assistant ; les résultats d’outils aux messages utilisateur. |

## Signature

```ts
export interface ModelMessage {
  readonly role: "user" | "assistant";
  readonly content: readonly ModelContentBlock[];
}
```

## Contrats associés

- [ModelContentBlock](../modelcontentblock/)
