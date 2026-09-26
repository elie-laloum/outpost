---
title: "Kimi Code"
description: "Connecter Kimi Code à une sandbox Outpost."
---

Utilisez `kimiHarness()` avec un [environnement d’exécution](../execution-backends/) pris en charge. Installez la CLI dans votre image ou autorisez le bootstrap chez les fournisseurs distants.

## Accès par compte

Connectez-vous avec la CLI Kimi sur l’hôte. Outpost utilise les identifiants et l’identifiant d’appareil sous `~/.kimi-code` (ou `KIMI_CODE_HOME`). Pour un profil séparé, `account.file` est le dossier contenant `credentials/kimi-code.json` et `device_id`.

## Accès API

Fournissez explicitement `KIMI_API_KEY`. L’usage API suit la facturation API du fournisseur.

```ts
import { agent, kimiHarness } from "@elie-laloum/outpost";

const coder = agent({
  harness: kimiHarness({
    authentication: "usage",
    variables: { KIMI_API_KEY: process.env.KIMI_API_KEY ?? "" },
  }),
  model: process.env.KIMI_MODEL ?? "",
});
```

## Comportement

L’authentification API exige un modèle explicite sur `agent()`. Définissez `KIMI_MODEL` dans l’environnement de votre application pour le snippet ci-dessus ; cette variable appartient à l’exemple, pas aux réglages d’Outpost. L’authentification par compte peut utiliser le modèle par défaut de la CLI.

Cet adaptateur démarre uniquement des sessions neuves. La capture native des conversations, la reprise, le fork et la réparation automatique des réponses ne sont pas disponibles.

API : [kimiHarness](../../reference/kimiharness/).
