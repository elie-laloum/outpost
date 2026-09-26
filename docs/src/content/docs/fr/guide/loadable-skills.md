---
title: "Skills à la demande"
description: "Charger des instructions et outils ciblés à la demande."
---

Le harness expérimental liste les descriptions de skills dans ses instructions système. Le modèle appelle `load_skill` pour obtenir les instructions et activer les outils du skill.

```ts
import { defineHarnessSkill, harnessGitTools } from "@elie-laloum/outpost";

const reviewSkill = defineHarnessSkill({
  name: "review",
  description: "Inspect a patch and report concrete regressions.",
  instructions:
    "Read the diff. Check changed behavior against callers and tests. Cite file paths.",
  tools: [harnessGitTools()],
});
```

Passez le résultat dans `harness({ skills: [reviewSkill] })`. Les noms doivent être uniques, et ceux des outils ne doivent pas entrer en conflit avec les autres outils du harness ou des skills.

## Instructions dynamiques

`instructions` peut être du texte ou une fonction recevant sandbox, signal et modèle. Lisez les données du dépôt via la sandbox empruntée. Utilisez `defineHarnessInstructions()` pour composer des instructions système réutilisables, résolues à chaque tour.

Un skill met des consignes à disposition ; il n’impose pas une validation humaine. Utilisez les [étapes de validation](../review-gates/) du workflow lorsque la continuation dépend d’une décision autorisée.

API : [defineHarnessSkill](../../reference/defineharnessskill/) · [defineHarnessInstructions](../../reference/defineharnessinstructions/).
