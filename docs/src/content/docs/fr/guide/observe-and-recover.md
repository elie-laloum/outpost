---
title: "Suivre une exécution et examiner les échecs"
description: "Choisissez le suivi en direct, les journaux enregistrés ou les outils de récupération selon votre besoin."
---

## Choisir le mode de suivi

Utilisez les événements en direct pour suivre le travail, les journaux pour l’examiner après coup et les outils de récupération en cas d’interruption. Un observateur décrit ce qui se passe ; une erreur dans sa fonction ne change pas le résultat de la tâche.

<!-- features -->

- [Suivre la progression](../progress/): Recevez les événements d’un dispatch au fil de l’eau.
- [Hub d’observation et OpenTelemetry](../observability/): Un seul flux pour toute une exécution, exporté en traces et métriques.
  - OpenTelemetry
- [Journaux](../journals/): Une trace durable de chaque dispatch, relue après l’exécution.
- [Rejouer sans modèle](../record-replay/): Reproduisez une exécution enregistrée, événement par événement, sans appel au modèle.
  - rejeu
- [Récupérer du travail](../recovery/): Retrouvez, inspectez et restaurez ce qu’une exécution échouée a laissé.
  - worktrees
- [Diagnostic](../diagnostics/): Vérifiez l’hôte, le moteur, l’image et la CLI de l’agent avant de payer un appel au modèle.

## Relire une exécution

Chaque dispatch écrit un journal. `result.logReference` désigne celui qui vient de se terminer ; `readJournal()` en renvoie les événements.

<!-- tabs -->

```ts title="record-journal.ts"
import { createLocalTransport, dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export const transporter = createLocalTransport({
  directory: ".outpost/storage",
});
export const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Describe the repository without changing it." },
  logging: { transporter },
});
```

```ts title="read-journal.ts"
import { result, transporter } from "./record-journal.ts";
import { readJournal } from "@elie-laloum/outpost";

if (result.logReference) {
  const events = await readJournal({
    transporter,
    reference: result.logReference,
  });
  console.log(events.length);
}
```

Sans `logging`, le journal part dans un transport local sous `<dépôt>/.outpost/storage`. Enregistrez l’exécution avec les options de rejeu et ce même journal devient un test déterministe.

## Ce qu’Outpost garde après un échec

| Quoi                    | Où                                                        | Gardé quand                                                           |
| ----------------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| Worktree                | `.outpost/workspaces/`                                    | L’exécution a échoué, l’intégration a conflité, ou il est sale        |
| Transfert distant       | `.outpost/recovery/`                                      | Les changements du cloud n’ont pas pu être appliqués à votre checkout |
| Conversation            | `.outpost/conversations/` ou le stockage propre à l’agent | Après chaque tour et en cas d’échec                                   |
| Progression du workflow | `.outpost/storage/` ou votre [transport](../storage/)     | Après chaque tâche terminée                                           |

Un worktree conservé est un worktree Git ordinaire sur sa branche : ouvrez-le, committez ce que vous gardez, fusionnez la branche.

## Limites

- La livraison aux récepteurs est limitée et peut signaler des pertes. C’est un flux d’observations, pas un registre d’état durable ; le comptage de la consommation en reste indépendant.
- Un journal partage la file limitée du hub. Un transport en échec ou en retard peut laisser des événements de côté, et `readJournal()` ne renvoie alors que ce qui a été écrit avant la panne.
- Les journaux contiennent prompts, messages de l’agent et résultats d’outils, donc du contenu du dépôt. Stockez-les et partagez-les comme le code.
- Un rejeu ne reproduit qu’une exécution enregistrée. Un prompt, un point de départ ou un arbre différent lève `ReplayDivergence` au lieu d’inventer des événements.
- La récupération est explicite. Outpost ne jette jamais un worktree sale ou détaché au titre du nettoyage courant, et un nettoyage expiré laisse les ressources en attente.
- Les empreintes et la traçabilité donnent de l’intégrité, pas de l’authentification : elles prouvent qu’un fichier n’a pas changé, pas qui l’a produit.

API : [createObservationHub](../../reference/createobservationhub/) · [ObservationHub](../../reference/observationhub/) · [createOpenTelemetryObserver](../../reference/createopentelemetryobserver/) · [readJournal](../../reference/readjournal/) · [Logging](../../reference/logging/) · [createReplayAgent](../../reference/createreplayagent/) · [recoveryDetails](../../reference/recoverydetails/) · [inspectRecovery](../../reference/inspectrecovery/).
