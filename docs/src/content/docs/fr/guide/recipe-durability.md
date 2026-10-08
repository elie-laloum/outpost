---
title: Recettes YAML durables
description: Conserver le travail, demander une intervention et reprendre par run ID.
---

Les recettes de format 3 utilisent le moteur de checkpoints existant. Déclarez le stockage dans la configuration locale obligatoire, puis sélectionnez-le depuis la recette partageable. Une pause libère la sandbox et conserve workspaces Git, sorties terminées, conversations et consommation cumulée. [Les workflows de recettes](../recipe-workflows/) présentent la composition des tâches.

## Configurer le stockage persistant

Un transport local stocke l’état sur l’hôte. Un transport S3 peut le remplacer via `type: s3` et ses options natives ; les clients SDK déclarés restent des extensions locales. `stores` contient les checkpoints, `caches` les caches de tâches, et `artifactStores` les contenus d’artefacts. Chacun accepte une référence de transport. Consultez [les transports](../object-storage/) pour leur propriété et les limites de validation distante.

```yaml title="outpost.yaml — stockage"
version: 2
repository: ./repository
sandbox: { provider: local }
branch: { mode: integrate }
transports:
  state: { type: local, directory: ./.outpost/state }
stores:
  checkpoint:
    type: transport
    transporter: { $ref: transports.state }
```

Choisissez un run ID stable et une version de checkpoint. `recipe run --run-id` remplace cet ID pour une nouvelle exécution ; un ID existant nécessite `recipe resume`. Le runtime ajoute une empreinte de la recette, des paramètres, de la configuration pertinente et des versions d’extensions à l’identité du checkpoint. Les valeurs secrètes résolues en sont exclues. Rapports et observation peuvent changer entre invocations.

```yaml title="recipe.yaml — checkpoint"
version: 3
name: reviewed-change
workflow:
  checkpoint:
    store: { $ref: stores.checkpoint }
    runId: reviewed-change
    version: "1"
tasks:
  - key: review
    gate:
      kind: approval
      prompt: Accept the change?
      actors: [maintainer]
```

## Inspecter et reprendre

Une exécution ou reprise réussie reste silencieuse sans rapport déclaré ni `--json`. Status est une consultation explicite et affiche toujours son résultat. Une invocation en pause ou en attente retourne un code CLI non nul ; son rapport final distingue cet état d’un échec. Les tâches terminées ne sont pas rejouées.

```sh
outpost recipe run --file recipe.yaml --config outpost.yaml --json
outpost recipe status --file recipe.yaml --config outpost.yaml \
  --run-id reviewed-change --json
outpost recipe resume --file recipe.yaml --config outpost.yaml \
  --run-id reviewed-change --json
```

Les sandboxes durables partagées et isolées utilisent des workspaces possédés par le runtime. Avant reprise, Outpost vérifie dépôt, répertoire, branche, métadonnées Git et base de comparaison d’origine. Un workspace absent ou modifié est refusé. Le provider doit pouvoir ouvrir une nouvelle sandbox sur ce workspace conservé sur l’hôte ; la synchronisation préserve les fichiers couverts par son contrat de transfert existant. Les workspaces prêtés ne sont pas restaurés automatiquement. Les dialogues conservent leurs exigences natives de workspace nommé et de conversation portable.

Les tâches interrompues nécessitent `resume --retry-incomplete`. Après un crash, arrêtez d’abord le coordinateur précédent et inspectez le checkpoint. `--recover-revision <revision>` libère explicitement sa propriété uniquement si la révision correspond encore ; cette option ne récupère pas les verrous Git et n’autorise pas le rejeu. Traitez les verrous conservés avec les [procédures de récupération](../recovery/). L’expiration d’un heartbeat n’autorise aucune de ces actions. Une allocation interrompue avant l’enregistrement du workspace exige une récupération explicite ; le runtime ne crée jamais de remplacement vide.

## Transmettre décisions et réponses

`recipe decide --decision decision.json` reprend avec une [WorkflowDecision](../../reference/workflowdecision/) native. Copiez les identifiants d’exécution, tâche et demande du rapport en pause ; fournissez un acteur autorisé de confiance et une raison. Pour une gate signée, incluez la preuve originale et configurez `workflow.decisionVerifier` avec un vérificateur `ed25519` référençant un callback local de clés d’approbateurs. Le moteur vérifie acteur, demande, expiration et signature avant mutation.

```sh
outpost recipe decide --file recipe.yaml --config outpost.yaml \
  --run-id reviewed-change --decision decision.json --json
```

Une tâche `interactive` accepte [InteractiveAgentTaskOptions](../../reference/interactiveagenttaskoptions/) sauf clé et dépendances. Son agent doit permettre capture et reprise portables. `recipe answer --answer answer.json` transmet une [WorkflowAnswer](../../reference/workflowanswer/) native contenant exécution, tâche, demande, acteur et valeur de réponse. Les réponses acceptées et tours terminés persistent entre processus.

```yaml title="recipe.yaml — dialogue"
- key: clarify
  interactive:
    repository: ./repository
    sandboxProvider: { $ref: sandboxProviders.container }
    agent: { $ref: agents.interviewer }
    brief: Clarify the requested change before implementing it.
    actors: [maintainer]
```

## Conserver artefacts, caches et consommation

Une action `artifact` sélectionne un magasin et un contrat nommés ; `data` construit sa valeur JSON. Un contrat JSON déclare `jsonSchema`, avec un validateur local facultatif. Un contrat `binary` utilise un callback local `produce`. Les sorties contiennent références et filiation, sans embarquer les octets dans les checkpoints. `examples/69-recipe-durability/` exécute hors ligne un scénario d’approbation et d’artefact entre processus.

```yaml title="recipe.yaml — artefact"
- key: evidence
  artifact:
    store: { $ref: artifactStores.results }
    contract: { $ref: artifacts.evidence }
  data: { checked: true, files: [src/index.ts] }
```

`options.cache` utilise le contrat natif de cache et un callback déclaré pour sa clé. Un cache hit ne consomme ni tentative ni jetons et ne rejoue pas d’effets. Les budgets et `onQuota: { action: pause }` gardent la comptabilité cumulée native. Les tâches agent et isolées peuvent déclarer `quotaResume: continue` ou `restart` ; continuer exige une conversation capturée et une restauration prise en charge.

Un sink d’observation `run` persiste la projection du hub partagé. Déclarez `transporter`, `id` et `kind: workflow` ; activez `resume: true` uniquement pour reprendre une projection ayant terminé son invocation précédente. Après récupération explicite d’un coordinateur interrompu, utilisez un nouvel ID d’observation. Le checkpoint reste l’autorité d’exécution ; les erreurs de sink ne changent pas le résultat. Les tests couvrent Git local, interruption de processus, décisions signées, dialogues, caches et artefacts sans appels payants. La restauration cloud/S3 réelle reste non validée.
