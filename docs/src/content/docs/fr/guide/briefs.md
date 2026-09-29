---
title: "Rédiger le brief"
description: "Fournir du texte, des fichiers et des variables de prompt."
---

Un brief est soit `{ text }`, soit `{ file, values }`. Utilisez le texte pour les requêtes construites par l’application et un fichier pour un modèle de tâche réutilisable.

```ts
import { fileURLToPath } from "node:url";
import type { Brief } from "@elie-laloum/outpost";

const brief: Brief = {
  file: fileURLToPath(new URL("task.md", import.meta.url)),
  values: { FEATURE: "email validation" },
};
```

## Modèles de fichier

Utilisez `{{FEATURE}}` dans le fichier pour insérer la valeur ci-dessus. `WORK_BRANCH` et `BASE_BRANCH` sont des variables intégrées décrivant le workspace Git sélectionné. Donnez des instructions concrètes : fichiers concernés, vérifications requises et création éventuelle d’un commit.

Les fichiers de prompt peuvent développer leurs fragments originaux de commandes shell. Ce développement exécute des commandes : le modèle et les valeurs insérées dans ces commandes doivent être fiables. Le texte substitué ne peut pas introduire de nouveaux fragments. `expansionMs` borne chaque développement.

## Distinguer instructions et contrôles

Un brief peut demander à l’agent de lancer les tests ou d’éviter un fichier. Appliquez les conditions importantes dans votre application : exécutez une commande, inspectez son statut, validez une réponse ou attendez une revue. Une instruction seule n’est pas une dépendance imposée au workflow.

Utilisez la [validation de sortie](../typed-responses/) lorsqu’une autre tâche consomme la réponse de l’agent.

API : [Brief](../../reference/brief/) · [DispatchOptions](../../reference/dispatchoptions/).
