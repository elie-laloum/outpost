---
title: "Enregistrer et reprendre une recette"
description: "Conserver la progression, attendre une approbation et reprendre sans rejouer les tâches terminées."
---

Cet exemple enregistre des éléments à relire, attend une approbation puis confirme l’acceptation. Il demande uniquement le [paquet installé](../yaml-recipes/) : ni Git, ni sandbox, ni agent. Enregistrez ces deux fichiers complets ensemble.

## Stocker la progression

Le transport local déclaré dans le stockage de checkpoints conserve les checkpoints sous `.outpost/state` ; le stockage garde un nom parce que la recette le référence. Les commandes suivantes doivent utiliser la même configuration et le même identifiant d’exécution. Le format YAML est en version 3 ; le `version: "1"` du checkpoint ci-dessous est une identité distincte que vous choisissez pour le workflow.

```yaml title="outpost.yaml"
version: 3
stores:
  checkpoint:
    type: transport
    transporter:
      type: local
      directory: ./.outpost/state
```

## Attendre une approbation

`evidence` termine avant l’ouverture de l’étape d’approbation. La tâche `accepted` ne démarre qu’après acceptation. Le checkpoint conserve les résultats terminés et la consommation cumulée.

```yaml title="recipe.yaml"
version: 3
name: reviewed-change
workflow:
  checkpoint:
    store: { $ref: stores.checkpoint }
    runId: reviewed-change
    version: "1"
tasks:
  - key: evidence
    value: { summary: Ready for review }
  - key: review
    after: [evidence]
    gate:
      kind: approval
      prompt: Accept this evidence?
      actors: [maintainer]
  - key: accepted
    after: [review]
    value: { approved: true }
```

## Examiner puis reprendre

La première commande utilise `--json` : elle laisse l’approbation en attente et retourne un code de sortie non nul avec le rapport correspondant. `status` lit la progression enregistrée. Lancez la dernière commande dans un terminal pour examiner les éléments et approuver avec une raison ; elle ne rejoue pas `evidence`.

```sh
npx outpost recipe run --file recipe.yaml --config outpost.yaml --json
npx outpost recipe status --file recipe.yaml --config outpost.yaml   --run-id reviewed-change --json
npx outpost recipe resume --file recipe.yaml --config outpost.yaml   --run-id reviewed-change --interactive
```

Laisser en attente est le choix par défaut. Pour les décisions sans terminal, les approbations signées et les questions d’agents, suivez [les interactions humaines](../recipe-dialogue/).

Utilisez `recipe run --run-id another-run` pour une nouvelle exécution, et `resume` pour un identifiant existant. Les modifications des paramètres ou de l’identité d’exécution sont refusées ; les réglages d’observation et de rapports peuvent changer.

## Conserver les fichiers de travail

Pour les tâches de commandes ou d’agents, ajoutez un [workspace et une sandbox](../recipe-workspaces/) à `outpost.yaml`. Les checkpoints conservent le workspace original et le vérifient avant reprise ; un workspace absent n’est pas recréé silencieusement. Les snapshots de fichiers sont conservés avant un checkpoint stabilisé. Les sources montées doivent rester disponibles.

Les workspaces Git conservent leur branche et leur référence de diff. Les workspaces de fichiers utilisent la configuration 3 avec `runtime.directory`, `runtime.namespace` et les réglages facultatifs de conservation ; voir [la restauration de fichiers](../resuming-file-workspaces/). Les workspaces empruntés ne sont pas restaurés automatiquement.

## Récupérer une exécution interrompue

Une pause normale demande seulement `resume`. Après un crash, arrêtez l’ancien coordinateur et examinez l’état sauvegardé avant de choisir une récupération.

| État enregistré                                         | Action requise                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| Tâches terminées et approbation en attente              | Reprendre ou soumettre une décision                                |
| Tâche interrompue                                       | `resume --retry-incomplete` autorise explicitement son rejeu       |
| Checkpoint encore possédé par un coordinateur abandonné | `--recover-revision <revision>` après vérification du propriétaire |
| Verrou de workspace conservé                            | Suivre séparément la [récupération des verrous](../recovery/)      |

Récupérer la propriété n’autorise pas le rejeu d’une tâche. L’expiration du heartbeat n’autorise aucune de ces opérations. La [référence CLI](../recipe-cli/) décrit les options.

## Ajouter caches, artefacts et pauses sur quota

| Besoin                                  | Intégration YAML                                       |
| --------------------------------------- | ------------------------------------------------------ |
| Réutiliser le résultat JSON d’une tâche | `options.cache`, un store nommé et un callback de clé  |
| Conserver un artefact                   | `artifact` avec store, contrat et expression `data`    |
| Attendre après une limite de quota      | `onQuota: { action: pause }` avec budgets cumulés      |
| Suivre une exécution par identifiant    | Un récepteur d’observation `run` adossé à un transport |

Consultez les [composants](../yaml-components/) pour les déclarations et les [extensions](../recipe-extensions/) pour les callbacks. Un cache ne rejoue pas les effets. Continuer un agent après quota exige une conversation capturée et une restauration compatible. Le checkpoint fait autorité ; une erreur d’observation ne change pas le résultat.

<!-- Retained section anchors for existing bookmarks. -->

<span id="configurer-le-stockage-persistant"></span>
<span id="inspecter-et-reprendre"></span>
<span id="transmettre-décisions-et-réponses"></span>
<span id="répondre-directement-dans-le-terminal"></span>
<span id="conserver-artefacts-caches-et-consommation"></span>
<span id="workspaces-de-fichiers"></span>
