---
title: "Briefs en fichier et expansion"
description: "Briefs en fichier et expansion — Outpost"
sidebar:
  order: 6
---

Un brief prend la forme `{ text }` ou `{ file, values? }`. Fournissez une seule de ces formes. Le texte inline est littéral et n’est jamais développé.

```ts
import { dispatch, codex } from "@elie-laloum/outpost";

await dispatch({
  agent: codex(),
  brief: {
    file: ".outpost/brief.md",
    values: { OBJECTIVE: "Corriger la validation" },
  },
  diagnostic: console.log,
  warn: console.warn,
});
```

Exemple de `.outpost/brief.md` :

```md
Objectif : {{OBJECTIVE}}
Branche de travail : {{WORK_BRANCH}}
Branche de base : {{BASE_BRANCH}}

Changements actuels :
!`git status --short`

Implémente, teste et commite. Affiche <outpost>done</outpost> à la fin.
```

## Règles de résolution

Les chemins relatifs partent du répertoire courant de l’appelant. Le fichier est relu à chaque passe. `values` accepte des valeurs primitives ; les variables réservées de branche viennent du workspace. Une valeur manquante fait échouer l’exécution non interactive. Les valeurs inutilisées sont signalées par `warn`. L’attachement interactif peut demander les noms manquants via `ask(name)`.

Les commandes présentes dans le fichier original s’exécutent en parallèle dans la sandbox, après les hooks. `expansionMs` limite chaque commande à 30 secondes par défaut. Un statut non nul fait échouer l’expansion. `diagnostic` fournit une estimation de taille pour repérer les prompts anormalement volumineux.

Seuls les fragments de commande du fichier original sont exécutés. Une substitution ne peut pas introduire de nouvelle commande d’expansion. En revanche, une valeur insérée dans un fragment shell existant reste une entrée shell : n’y insérez que des valeurs fiables et correctement citées.

Utilisez un fichier pour faire évoluer le prompt entre les passes ou inclure le contexte du dépôt. Préférez le texte littéral pour un contenu utilisateur qui ne doit pas être interprété comme un modèle.
