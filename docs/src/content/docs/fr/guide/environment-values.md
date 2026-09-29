---
title: "Valeurs d’environnement"
description: "Transmettre uniquement les variables nécessaires."
---

Passez `variables` sur le fournisseur pour les valeurs communes à la sandbox, sur le harness pour celles propres à l’agent ou sur une commande pour cette invocation.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  variables: { NODE_ENV: "test", CI: "true" },
});
```

Les valeurs sont des chaînes. Ne recopiez pas tout `process.env` dans un fournisseur : sélectionnez explicitement les noms nécessaires. Un identifiant requis absent est une erreur, pas une demande de tenter un autre mode d’authentification.

## Projets générés

`outpost init` crée `.env.example`. Copiez les déclarations nécessaires dans `.env`. Une valeur non vide est utilisée directement ; une déclaration vide lit la variable correspondante du processus. Le script généré transmet uniquement les noms déclarés.

Le script généré résout son fichier d’environnement, son brief et le chemin relatif du dépôt depuis son propre dossier. Il n’impose pas de lancement depuis ce dossier.

## Hôte et sandbox

L’hôte a besoin des identifiants d’allocation et de stockage. L’agent a besoin de l’accès au modèle. Placez ces identifiants à la bonne frontière au lieu de tous les transmettre dans la sandbox. Voir [Accès compte et API](../access-credentials/).

API : [Variables](../../reference/variables/).
