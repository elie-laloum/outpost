---
title: "Répondre aux questions et approuver le travail"
description: "Traiter les approbations et questions persistantes dans le terminal ou depuis une application."
---

Partez du checkpoint et de l’approbation du guide [Enregistrer et reprendre une recette](../recipe-durability/). Les demandes en attente et les réponses acceptées survivent aux redémarrages.

## Répondre dans le terminal

Exécutez sans `--json` pour traiter automatiquement les questions lorsque stdin et stderr sont des terminaux. Pour l’exemple sauvegardé, reprenez son exécution :

```sh
npx outpost recipe resume --file recipe.yaml --config outpost.yaml \
  --run-id reviewed-change
```

La CLI affiche les éléments sauvegardés, propose approbation ou rejet et demande une raison. Laisser en attente est le choix par défaut. Un acteur autorisé unique est sélectionné automatiquement ; plusieurs acteurs donnent lieu à un choix. Cette sélection déclare une identité locale de confiance, pas une connexion.

Ctrl+C conserve la demande en attente. La reprise la présente à nouveau sans rejouer les tours terminés. Une approbation signée exige toujours une preuve de signature externe.

## Soumettre une décision depuis un fichier

Pour l’automatisation, utilisez `--no-interactive` ou `--json`. Lisez les identifiants de demande sauvegardés dans le rapport et écrivez une [WorkflowDecision](../../reference/workflowdecision/) dans `decision.json`, avec un acteur autorisé et une raison. Les approbations signées exigent aussi leur preuve originale.

```sh
npx outpost recipe decide --file recipe.yaml --config outpost.yaml \
  --run-id reviewed-change --decision decision.json --json
```

Un service recevant des décisions doit authentifier ses appelants avant de fournir les métadonnées d’acteur de confiance. Un nom d’acteur transmis par le client ne constitue pas une authentification. Voir [les approbations signées](../signed-approvals/) pour configurer le vérificateur.

## Laisser un agent poser des questions

Utilisez la configuration Git et le rôle `writer` de la page [configuration des agents](../recipe-configuration/), préparez son image Codex et gardez les `transports` et `stores` du checkpoint. Ajoutez cet élément sous `tasks` dans la recette persistante. L’agent doit permettre la capture et la reprise portables de conversation.

```yaml title="recipe.yaml — interactive task"
- key: clarify
  interactive:
    repository: ./project
    sandboxProvider: { type: docker, image: outpost-codex:dev }
    agent: { $ref: agents.writer }
    brief: Clarify the requested change before implementing it.
    actors: [maintainer]
```

Les tâches interactives conservent leur workspace nommé et libèrent la sandbox avant de présenter une question. Avec un terminal, la CLI collecte les réponses puis continue la conversation sauvegardée. Voir [InteractiveAgentTaskOptions](../../reference/interactiveagenttaskoptions/) pour le contrat complet.

Pour un client sans terminal, écrivez une [WorkflowAnswer](../../reference/workflowanswer/) avec les identifiants sauvegardés d’exécution, de tâche et de demande, l’acteur et la réponse, puis soumettez-la :

```sh
npx outpost recipe answer --file recipe.yaml --config outpost.yaml \
  --run-id reviewed-change --answer answer.json --json
```

`--interactive --json` combine explicitement les questions sur stderr et un rapport final JSON sur stdout. La [référence CLI](../recipe-cli/) décrit les options d’acteur et d’interaction.
