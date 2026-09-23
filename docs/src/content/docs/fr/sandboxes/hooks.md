---
title: "Hooks de préparation et fichiers copiés"
description: "Hooks de préparation et fichiers copiés — Outpost"
sidebar:
  order: 5
---

Les hooks préparent les ressources à des étapes précises du cycle de vie. Fournissez des tableaux de `Command` ; aucune commande n’est interprétée automatiquement comme un script shell.

```ts
import { createSandbox, codex } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: codex(),
  copies: [".env.test"],
  hooks: {
    workspaceReady: [{ executable: "git", arguments: ["status", "--short"] }],
    sandboxReady: [
      { executable: "npm", arguments: ["ci"], deadlineMs: 180_000 },
    ],
  },
});
```

## Ordre d’exécution

1. Créer ou acquérir le workspace Git et copier les entrées sélectionnées.
2. Exécuter `workspaceReady` sur l’hôte, dans l’ordre.
3. Allouer le provider et préparer la synchronisation distante si nécessaire.
4. Exécuter les groupes `hostReady` et `sandboxReady` en parallèle.
5. Commencer les opérations d’agent ou les commandes.

Dans un groupe hôte, les commandes sont séquentielles. Dans `sandboxReady`, elles sont concurrentes. Regroupez les étapes dépendantes dans une commande shell explicite ou dans un script du projet. Un échec annule les hooks frères et attend leur nettoyage avant de faire échouer l’allocation.

`openWorkspace({ hooks })` exécute immédiatement `workspaceReady` ; les sandboxes suivantes ne le répètent pas. Un dispatch ponctuel à plusieurs passes recrée une sandbox par passe ; un dispatch sur sandbox active réutilise son environnement préparé.

Chaque commande accepte `directory`, `variables`, `deadlineMs` et `signal`. Les hooks de sandbox peuvent demander `elevated: true` lorsque le provider le permet. Un échec d’initialisation conserve le travail modifié et retire les workspaces propres possédés. Voir [la récupération](../../operations/recovery/).
