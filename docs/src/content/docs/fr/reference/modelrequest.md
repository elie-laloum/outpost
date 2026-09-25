---
title: "ModelRequest"
description: "ModelRequest — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Cette première phase effectue des appels HTTP textuels sans Codex. Le harness d’agent est prévu en phase deux : l’exécution d’outils, la modification du dépôt et la persistance des conversations ne sont pas implémentées. Cette API ne peut pas servir d’agent de dispatch ni de provider de sandbox ; son contrat peut évoluer. Consultez le [périmètre implémenté et le harness prévu](../../guide/advanced/model-providers/).
:::

## Import

```ts
import type { ModelRequest } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                       | Présence  | Rôle                                                                                                                                                                                    |
| ----------------- | -------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prompt`          | `string`                   | Requis    | Texte non vide envoyé comme entrée utilisateur de cette requête ; aucun contenu du dépôt n’est collecté automatiquement.                                                                |
| `system`          | `string \| undefined`      | Optionnel | Texte optionnel envoyé comme message system de Chat Completions ou instructions de Responses.                                                                                           |
| `maxOutputTokens` | `number \| undefined`      | Optionnel | Limite positive de tokens de sortie transmise dans max_completion_tokens ou max_output_tokens ; omise par défaut. La disponibilité et le décompte du raisonnement dépendent du service. |
| `signal`          | `AbortSignal \| undefined` | Optionnel | Signal d’annulation de l’appelant pour cette requête, combiné au délai du fournisseur. L’annulation ne détruit pas le client réutilisable.                                              |

## Signature

```ts
export interface ModelRequest {
  readonly prompt: string;
  readonly system?: string;
  readonly maxOutputTokens?: number;
  readonly signal?: AbortSignal;
}
```
