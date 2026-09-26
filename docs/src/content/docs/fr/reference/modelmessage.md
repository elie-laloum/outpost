---
title: "ModelMessage"
description: "ModelMessage — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : contrat de fournisseur pour les harness personnalisés, avec messages, appels d’outils, raisonnement rejouable, cache d’historique et streaming. Il peut changer dans une version ultérieure.
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
