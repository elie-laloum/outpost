---
title: "Sandbox Daytona"
description: "Sandbox Daytona — Outpost"
sidebar:
  order: 5
---

Installez le SDK optionnel :

```sh
npm install @daytona/sdk
```

```ts
import { dispatch, claude } from "@elie-laloum/outpost";
import { daytona } from "@elie-laloum/outpost/providers/daytona";

const apiKey = process.env.DAYTONA_API_KEY;
if (!apiKey) throw new Error("Set DAYTONA_API_KEY");
await dispatch({
  agent: claude(),
  provider: daytona({
    connection: { apiKey },
    create: { language: "typescript" },
  }),
  branch: { mode: "named", name: "cloud/daytona-task" },
  brief: { text: "Relis le code et commite des corrections ciblées." },
});
```

`connection` configure le client SDK. `create` accepte les paramètres de création par image ou snapshot du SDK. Outpost accepte aussi `root`, `variables` et `retain`. Les identifiants du modèle se fournissent séparément via [l’environnement de l’agent](../../agents/environment/).

L’environnement doit contenir Node.js, npm, Git, `sh` et `setsid`. L’installation automatique de l’agent est active sauf avec `bootstrap: false`. Une image personnalisée doit fournir les autres outils du projet.

Les sessions de processus natives transmettent stdout/stderr et sont nettoyées après l’appel. L’annulation termine le groupe de la commande, pas la sandbox entière. Le lease transfère fichiers et répertoires. L’attachement interactif n’est pas disponible dans cette version.

Lisez [la synchronisation distante](../../sandboxes/remote-sync/) avant d’activer `includeUncommitted` ou de modifier simultanément le workspace hôte. Les tests de contrat n’allouent pas de sandbox payante réelle.

[Exécutez les vérifications hébergées sur activation explicite](../../operations/cloud-compatibility/) pour les contrats des fournisseurs réels et les CLI sans identifiants de modèle.
