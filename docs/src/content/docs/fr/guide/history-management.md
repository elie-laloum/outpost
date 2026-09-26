---
title: "Gestion du contexte"
description: "Maintenir l’historique de la boucle dans des bornes utiles."
---

Définissez `context` sur le harness expérimental pour réécrire l’historique avant une requête au modèle. Choisissez la stratégie selon les informations que vous pouvez perdre.

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
