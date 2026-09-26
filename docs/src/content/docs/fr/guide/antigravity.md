---
title: "Antigravity"
description: "Connecter Antigravity à une sandbox Outpost."
---

Utilisez `antigravityHarness()` avec un [environnement d’exécution](../execution-backends/) pris en charge. Installez la CLI dans votre image ou autorisez le bootstrap chez les fournisseurs distants.

## Accès par compte

Lancez `agy` sur l’hôte et connectez-vous. Outpost copie `~/.gemini/antigravity-cli/antigravity-oauth-token` dans le home privé de la sandbox. L’exécutable est `agy`, pas l’ancienne CLI Gemini.

## Accès API

Fournissez explicitement `GEMINI_API_KEY`. L’usage API suit la facturation API du fournisseur.

```ts
import { agent, antigravityHarness } from "@elie-laloum/outpost";

const coder = agent({
  harness: antigravityHarness({
    authentication: "usage",
    variables: { GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "" },
  }),
});
```

## Comportement

Seules les sessions neuves sont prises en charge. La capture native, la reprise, le fork et la réparation automatique des réponses ne sont pas disponibles. Utilisez les sorties explicites des tâches du workflow pour transmettre des résultats à une autre requête.

Les images générées utilisent l’installateur officiel Antigravity, qui télécharge la CLI courante. Pour des builds reproductibles, fournissez une image contenant le binaire vérifié. Voir [Configuration CLI Google](https://antigravity.google/docs/getting-started?tab=cli).

API : [antigravityHarness](../../reference/antigravityharness/).
