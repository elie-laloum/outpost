---
title: "Détecter un agent qui tourne en rond"
description: "Arrêter, avertir ou rediriger un agent quand ses outils ou changements de fichiers se répètent."
---

## Arrêter l’activité répétitive

Un agent peut continuer à produire des sorties tout en répétant les mêmes commandes ou modifications. Activez le watchdog d’activité en complément des [limites de temps](../limits-and-cancellation/) pour détecter ces répétitions. Utilisez la configuration d’agent et de sandbox de l’[installation](../setup/).

Ce dispatch s’arrête quand un même appel d’outil décodé ou contenu de changement de fichiers apparaît trois fois parmi les vingt derniers événements d’activité. D’autres appels peuvent séparer ces occurrences.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/guarded-fix" },
  brief: { text: "Corrige les tests qui échouent et commite le changement." },
  watchdog: {
    repetition: { window: 20, maxRepeats: 3 },
    onStuck: "stop",
  },
});
```

Outpost émet `stuck`, arrête l’agent et rejette avec une `OutpostError` de code `stuck`. Un événement `stopped` indique la même raison. Le dispatch froid libère sa sandbox et conserve le travail pour la [récupération](../recovery/) ; une session chaude reste utilisable. Les fichiers et commits déjà écrits restent en place.

## Rediriger l’agent

Donnez une nouvelle consigne concrète au watchdog si un changement d’approche est préférable à un arrêt immédiat. Cela utilise le [steering](../steering/) : la boucle intégrée reçoit un message, tandis qu’une CLI reçoit une entrée directe ou reprend sa conversation dans la même sandbox. Un sous-agent intégré détecté reçoit sa propre consigne.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Analyse le test du parseur qui échoue." },
  watchdog: {
    repetition: { window: 20, maxRepeats: 3 },
    onStuck: {
      instruction:
        "Cesse de répéter cette action. Examine l’assertion en échec et essaie une autre approche.",
      maxInterventions: 1,
    },
  },
});
```

Après cette consigne, une nouvelle alerte de répétition arrête l’agent. Les tours repris et réparations de réponse partagent la limite de cette exécution ; un dispatch ultérieur repart de zéro. Une CLI doit accepter l’entrée directe ou la reprise, et une consigne non remise échoue avec le code `steering`. Les instructions de réponse finale typée restent ajoutées après la nouvelle consigne.

## Observer sans interrompre

Utilisez `onStuck: "warn"` pour laisser continuer l’agent et recevoir un avertissement via `warn` ou les récepteurs d’observation. La fenêtre est réinitialisée après chaque alerte : l’épisode suivant doit accumuler assez de nouvelles occurrences pour atteindre à nouveau le seuil.

L’événement `stuck` porte la catégorie d’activité répétitive, le nom d’outil si disponible, le nombre d’occurrences et l’action choisie. Il omet les entrées d’outils et contenus de fichiers. Les événements suivent aussi le chemin d’observation habituel vers les journaux et rapporteurs personnalisés ; la politique s’applique indépendamment de la livraison bornée aux observateurs.

## Interpréter une alerte

Cette heuristique de répétition exacte ne prouve pas l’absence de progrès. Le polling, les nouvelles tentatives auprès d’un service instable ou la vérification répétée d’un test peuvent être légitimes. Choisissez une fenêtre et un seuil adaptés, ou commencez par des avertissements.

L’ordre des clés d’objet est ignoré ; les chaînes et l’ordre des tableaux restent significatifs. Les IDs d’appel identifient les doublons du protocole sans distinguer des actions identiques. Les portées des sous-agents et appels parents distinguent les actions. Texte, sorties et résultats d’outils ne comptent pas dans la fenêtre. La comparaison porte sur l’activité décodée avant masquage et conserve des empreintes plutôt que les entrées complètes.

Les événements de changement de fichiers exposent seulement ce que rapporte l’adaptateur : les mêmes chemins et types de changement peuvent correspondre même si le contenu diffère. Le watchdog ne lit pas les fichiers et ne compare pas les diffs Git. Un contenu absent correspond aux autres contenus absents, séparément de `null`. Les autres contenus non JSON avancent la fenêtre sans correspondance. Les agents sans événements outil ou changement de fichiers ne peuvent pas déclencher ce détecteur. Les agents de rejeu refusent l’option.

L’exemple hors ligne du dépôt dans `examples/58-repetition-watchdog/` exerce arrêt, avertissement et steering avec un modèle simulé et de vraies commandes locales, sans identifiants ni appels payants. Les exécutions réelles des CLI natives et du cloud restent à valider.

API : [WatchdogOptions](../../reference/watchdogoptions/) · [RepetitionPolicy](../../reference/repetitionpolicy/) · [StuckInstruction](../../reference/stuckinstruction/) · [StuckEvent](../../reference/stuckevent/).
