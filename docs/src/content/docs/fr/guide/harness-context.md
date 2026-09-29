---
title: "Contexte et skills"
description: "Garder l’historique dans ses limites et charger des instructions seulement au besoin."
---

Définissez `context` sur le harness intégré pour réécrire l’historique avant une requête au modèle. Choisissez la stratégie selon les informations que vous pouvez perdre.

```ts
import { summarizeHistory, truncateToolResults } from "@elie-laloum/outpost";

const compact = summarizeHistory({
  triggerCharacters: 200_000,
  keepRecentMessages: 6,
});
const truncate = truncateToolResults({ keepRecent: 4, maxCharacters: 8_000 });
```

`truncateToolResults()` raccourcit les anciennes sorties d’outils tout en gardant les résultats récents. `summarizeHistory()` remplace l’historique ancien par un résumé produit par le modèle et conserve les messages récents. La synthèse ajoute une requête au modèle et contribue à la consommation.

## Stratégies personnalisées

Utilisez `defineHarnessContextStrategy({ name, compact })` pour implémenter une autre politique. Le callback reçoit messages, étape, modèle, signal et fonction de résumé. Renvoyez des messages de remplacement ou laissez-les inchangés. Préservez les relations valides entre appels et résultats d’outils ainsi que le raisonnement rejouable exigé par le fournisseur.

## Persistance

La réduction du contexte modifie ce que le modèle reçoit ; elle est distincte du stockage des transcriptions. Configurez `conversations` pour choisir ou désactiver le stockage. Désactiver les conversations supprime aussi les réparations fondées sur la continuation.

API : [summarizeHistory](../../reference/summarizehistory/) · [truncateToolResults](../../reference/truncatetoolresults/) · [defineHarnessContextStrategy](../../reference/defineharnesscontextstrategy/).

## Skills à la demande

Le harness intégré liste les descriptions de skills dans ses instructions système. Le modèle appelle `load_skill` pour obtenir les instructions et activer les outils du skill.

```ts
import {
  defineHarnessSkill,
  createHarnessGitTools,
} from "@elie-laloum/outpost";

const reviewSkill = defineHarnessSkill({
  name: "review",
  description: "Inspect a patch and report concrete regressions.",
  instructions:
    "Read the diff. Check changed behavior against callers and tests. Cite file paths.",
  tools: [createHarnessGitTools()],
});
```

Passez le résultat dans `createHarness({ skills: [reviewSkill] })`. Les noms doivent être uniques, et ceux des outils ne doivent pas entrer en conflit avec les autres outils du harness ou des skills.

### Instructions dynamiques

`instructions` peut être du texte ou une fonction recevant sandbox, signal et modèle. Lisez les données du dépôt via la sandbox empruntée. Utilisez `defineHarnessInstructions()` pour composer des instructions système réutilisables, résolues à chaque tour.

Un skill met des consignes à disposition ; il n’impose pas une validation humaine. Utilisez les [étapes de validation](../approvals/) du workflow lorsque la continuation dépend d’une décision autorisée.

API : [defineHarnessSkill](../../reference/defineharnessskill/) · [defineHarnessInstructions](../../reference/defineharnessinstructions/).
