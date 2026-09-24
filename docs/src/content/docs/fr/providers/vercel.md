---
title: "Sandbox Vercel"
description: "Sandbox Vercel — Outpost"
sidebar:
  order: 4
---

Installez le SDK optionnel dans le projet utilisateur :

```sh
npm install @vercel/sandbox
```

```ts
import { dispatch, codex } from "@elie-laloum/outpost";
import { vercel } from "@elie-laloum/outpost/providers/vercel";

await dispatch({
  agent: codex(),
  provider: vercel({ create: { timeout: 30 * 60 * 1000 } }),
  branch: { mode: "named", name: "cloud/vercel-task" },
  brief: { text: "Ajoute des tests de validation et commite-les." },
});
```

`create` reprend le type des options de création du SDK installé. Utilisez-le pour les identifiants, runtime, ressources et paramètres réseau pris en charge. La découverte des identifiants suit le SDK : l’authentification de la sandbox reste distincte de celle du modèle.

Les options propres à Outpost sont `root` (répertoire distant), `retain` (fin de sortie conservée) et `variables` (environnement du provider). Outpost découvre le home réel et peut installer l’agent manquant dans un préfixe accessible à l’utilisateur. Passez `bootstrap: false` aux options de dispatch/sandbox pour gérer l’installation vous-même.

Le workspace par défaut est `/vercel/sandbox/outpost`. Outpost crée récursivement les répertoires parents manquants, y compris sur les images dont le répertoire de travail initial est `/vercel`. Un `root` personnalisé doit être accessible en écriture à l’utilisateur de la sandbox.

Le travail distant exige `named` ou `integrate` ; une branche omise utilise l’intégration. Les commandes transmettent leur sortie et rapatrient les changements. L’attachement interactif n’est pas disponible. Le guide de [synchronisation distante](../../sandboxes/remote-sync/) explique entrées non commitées, conflits locaux et récupération.

Les tests de contrat du SDK utilisent des doubles contrôlés. Disponibilité, quotas et accès aux modèles nécessitent une vérification avec votre compte.

[Exécutez les vérifications hébergées sur activation explicite](../../operations/cloud-compatibility/) pour les contrats des fournisseurs réels et les CLI sans identifiants de modèle.
